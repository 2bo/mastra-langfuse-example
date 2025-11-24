import type { Evaluator } from '@langfuse/client';
import type { WeatherDatasetItem } from '../datasets/weather-dataset';

type WeatherMetadata = Record<string, unknown> & {
  language?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
};

type WeatherEvaluator = Evaluator<
  WeatherDatasetItem['input'],
  WeatherDatasetItem['expectedOutput'],
  WeatherMetadata
>;

/**
 * Evaluator: Checks if weather information was successfully retrieved
 */
export const weatherDataRetrievalEvaluator: WeatherEvaluator = async ({ output }) => {
  const result = output as { hasWeatherInfo: boolean; location: string };

  const success = result.hasWeatherInfo;

  return {
    name: 'weather_data_retrieval',
    value: success ? 1.0 : 0.0,
    dataType: 'BOOLEAN',
    comment: success
      ? `Successfully retrieved weather for ${result.location}`
      : 'Failed to retrieve weather data',
  };
};

/**
 * Evaluator: Checks if activity suggestions were generated
 */
export const activityGenerationEvaluator: WeatherEvaluator = async ({ output }) => {
  const result = output as { hasActivities: boolean; activities: string };

  const success = result.hasActivities;

  return {
    name: 'activity_generation',
    value: success ? 1.0 : 0.0,
    dataType: 'BOOLEAN',
    comment: success
      ? `Generated ${result.activities.length} characters of activity suggestions`
      : 'Failed to generate activities',
  };
};

/**
 * Evaluator: Checks if the location name matches expected English translation
 */
export const locationTranslationEvaluator: WeatherEvaluator = async ({
  input,
  output,
  expectedOutput,
}) => {
  const inputData = input as WeatherDatasetItem['input'];
  const result = output as { location: string };
  const expected = expectedOutput as WeatherDatasetItem['expectedOutput'];

  const actualLocation = result.location.toLowerCase().trim();
  const expectedLocation = expected.locationInJapanese.toLowerCase().trim();

  // Check for exact match or close match (handling diacritics)
  const isMatch =
    actualLocation === expectedLocation ||
    actualLocation.includes(expectedLocation) ||
    expectedLocation.includes(actualLocation);

  // Calculate similarity score (simple approach)
  let score = 0.0;
  if (isMatch) {
    score = 1.0;
  } else {
    // Partial credit for similar locations
    const distance = levenshteinDistance(actualLocation, expectedLocation);
    const maxLength = Math.max(actualLocation.length, expectedLocation.length);
    score = Math.max(0, 1 - distance / maxLength);
  }

  return {
    name: 'location_translation',
    value: score,
    comment: `入力: "${inputData.city}" → 出力: "${result.location}" (期待: "${expected.locationInJapanese}")`,
  };
};

/**
 * Evaluator: Overall success - combines weather retrieval and activity generation
 */
export const overallSuccessEvaluator: WeatherEvaluator = async ({ output, expectedOutput }) => {
  const result = output as { hasWeatherInfo: boolean; hasActivities: boolean };
  const expected = expectedOutput as WeatherDatasetItem['expectedOutput'];

  const weatherSuccess = result.hasWeatherInfo === expected.hasWeatherInfo;
  const activitiesSuccess = result.hasActivities === expected.hasActivities;

  const success = weatherSuccess && activitiesSuccess;

  return {
    name: 'overall_success',
    value: success ? 1.0 : 0.0,
    dataType: 'BOOLEAN',
    comment: success
      ? 'All checks passed'
      : `Weather: ${weatherSuccess}, Activities: ${activitiesSuccess}`,
  };
};

/**
 * Helper function: Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Export all item-level evaluators
 */
export const itemEvaluators: WeatherEvaluator[] = [
  weatherDataRetrievalEvaluator,
  activityGenerationEvaluator,
  locationTranslationEvaluator,
  overallSuccessEvaluator,
];
