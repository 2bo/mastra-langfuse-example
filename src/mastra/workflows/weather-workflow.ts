import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
});

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

const normalizeCity = createStep({
  id: 'normalize-city',
  description: 'Normalize city name to English ASCII using translator agent',
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    city: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    let normalized = inputData.city;

    try {
      const agent = mastra?.getAgent('cityTranslatorAgent');
      if (!agent) {
        return { city: normalized };
      }

      const response = await agent.stream([
        {
          role: 'user',
          content: `地名を英語ASCII表記に変換して返してください。出力は地名のみ。\n地名: ${inputData.city}`,
        },
      ]);

      let text = '';
      for await (const chunk of response.textStream) {
        text += chunk;
      }

      normalized = text.trim().split(/\r?\n/)[0]?.trim() || inputData.city;
      // ダイアクリティカルマーク除去
      normalized = normalized.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    } catch {
      normalized = inputData.city;
    }

    return { city: normalized };
  },
});

const fetchWeather = createStep({
  id: 'fetch-weather',
  description: 'Fetches weather forecast for a given city',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1&language=en`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };

    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      current: {
        time: string;
        precipitation: number;
        weathercode: number;
      };
      hourly: {
        precipitation_probability: number[];
        temperature_2m: number[];
      };
    };

    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0,
      ),
      location: name,
    };

    return forecast;
  },
});

const planActivities = createStep({
  id: 'plan-activities',
  description: 'Suggests activities based on weather conditions',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;

    if (!forecast) {
      throw new Error('Forecast data not found');
    }

    const agent = mastra?.getAgent('weatherAgent');
    if (!agent) {
      throw new Error('Weather agent not found');
    }

    const prompt = `以下の天気予報をもとに「${forecast.location}」でのアクティビティを提案してください:
      ${JSON.stringify(forecast, null, 2)}

      以下の日本語フォーマットを厳守してください（絵文字・見出しも含めそのまま）:

      📅 [曜日付きの日付]
      ═══════════════════════════

      🌡️ 天気サマリー
      • 状況: [短い説明]
      • 気温: [最低/最高 ℃]
      • 降水確率: [X%]

      🌅 午前のおすすめ
      屋外:
      • [アクティビティ名] - [具体的な場所やルートを含む短い説明]
        ベスト時間帯: [時間帯]
        メモ: [天気上の注意点]

      🌞 午後のおすすめ
      屋外:
      • [アクティビティ名] - [具体的な場所やルートを含む短い説明]
        ベスト時間帯: [時間帯]
        メモ: [天気上の注意点]

      🏠 屋内オプション
      • [アクティビティ名] - [具体的な施設名]
        こんなときに: [雨/暑さ/強風 などトリガー]

      ⚠️ 注意事項
      • [警報や紫外線、風などの注意]

      ガイドライン:
      - 時間指定の屋外案内を各日2〜3件
      - 屋内の保険プランを1〜2件
      - 降水確率50%以上なら屋内を優先提示
      - 場所固有のスポット名を入れる
      - 気温に応じて運動強度を調整
      - 簡潔で読みやすく`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let activitiesText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(normalizeCity)
  .then(fetchWeather)
  .then(planActivities);

weatherWorkflow.commit();

export { weatherWorkflow };
