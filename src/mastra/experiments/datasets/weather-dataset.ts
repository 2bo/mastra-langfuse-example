import { z } from 'zod';

// Dataset item schema
export const weatherDatasetItemSchema = z.object({
  input: z.object({
    city: z.string().describe('天気を取得する都市名（入力は日本語でも可）'),
  }),
  expectedOutput: z.object({
    hasWeatherInfo: z.boolean().describe('天気情報が取得できたか'),
    hasActivities: z.boolean().describe('アクティビティ提案が生成されたか'),
    locationInJapanese: z.string().describe('想定する日本語表記の地名'),
  }),
  metadata: z
    .object({
      language: z.string().describe('入力言語（例: "ja", "en"）'),
      difficulty: z.enum(['easy', 'medium', 'hard']).describe('テスト難易度'),
      description: z.string().describe('このテストで確認したいこと'),
    })
    .optional(),
});

export type WeatherDatasetItem = z.infer<typeof weatherDatasetItemSchema>;

// Sample dataset items (5 test cases)
export const weatherDatasetItems: WeatherDatasetItem[] = [
  {
    input: {
      city: 'Tokyo',
    },
    expectedOutput: {
      hasWeatherInfo: true,
      hasActivities: true,
      locationInJapanese: '東京',
    },
    metadata: {
      language: 'en',
      difficulty: 'easy',
      description: '英語表記の主要都市（基本ケース）',
    },
  },
  {
    input: {
      city: 'Paris',
    },
    expectedOutput: {
      hasWeatherInfo: true,
      hasActivities: true,
      locationInJapanese: 'パリ',
    },
    metadata: {
      language: 'en',
      difficulty: 'easy',
      description: '英語表記の欧州都市（基本ケース）',
    },
  },
  {
    input: {
      city: '東京',
    },
    expectedOutput: {
      hasWeatherInfo: true,
      hasActivities: true,
      locationInJapanese: '東京',
    },
    metadata: {
      language: 'ja',
      difficulty: 'medium',
      description: '日本語表記の都市名。地名を日本語で扱えるか',
    },
  },
  {
    input: {
      city: 'São Paulo',
    },
    expectedOutput: {
      hasWeatherInfo: true,
      hasActivities: true,
      locationInJapanese: 'サンパウロ',
    },
    metadata: {
      language: 'pt',
      difficulty: 'medium',
      description: 'アクセント付き表記。発音記号を落とした日本語表記へ',
    },
  },
  {
    input: {
      city: 'New York',
    },
    expectedOutput: {
      hasWeatherInfo: true,
      hasActivities: true,
      locationInJapanese: 'ニューヨーク',
    },
    metadata: {
      language: 'en',
      difficulty: 'easy',
      description: '複合語の都市名（英語入力→日本語出力期待）',
    },
  },
];

// Dataset configuration
export const WEATHER_DATASET_NAME = 'weather-workflow-evaluation';
export const WEATHER_DATASET_DESCRIPTION =
  '多言語の都市名入力に対する日本語天気ワークフロー評価データセット';
