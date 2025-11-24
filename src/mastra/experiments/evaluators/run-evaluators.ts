import type { RunEvaluator } from '@langfuse/client';
import type { WeatherDatasetItem } from '../datasets/weather-dataset';

type WeatherMetadata = Record<string, unknown> & {
  language?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
};

type WeatherRunEvaluator = RunEvaluator<
  WeatherDatasetItem['input'],
  WeatherDatasetItem['expectedOutput'],
  WeatherMetadata
>;

/**
 * Run-level evaluator: Calculate average success rate across all items
 */
export const averageSuccessRateEvaluator: WeatherRunEvaluator = async ({ itemResults }) => {
  // Get all overall_success scores
  const successScores = itemResults
    .flatMap((result) => result.evaluations)
    .filter((evaluation) => evaluation.name === 'overall_success')
    .map((evaluation) => evaluation.value)
    .filter((value): value is number => typeof value === 'number');

  if (successScores.length === 0) {
    return {
      name: 'avg_success_rate',
      value: 0,
      comment: 'No success scores found',
    };
  }

  const average = successScores.reduce((sum, val) => sum + val, 0) / successScores.length;

  return {
    name: 'avg_success_rate',
    value: average,
    comment: `Average success rate: ${(average * 100).toFixed(1)}% (${successScores.filter((s) => s === 1).length}/${successScores.length} passed)`,
  };
};

/**
 * Run-level evaluator: Calculate average translation accuracy
 */
export const averageTranslationAccuracyEvaluator: WeatherRunEvaluator = async ({
  itemResults,
}) => {
  // Get all location_translation scores
  const translationScores = itemResults
    .flatMap((result) => result.evaluations)
    .filter((evaluation) => evaluation.name === 'location_translation')
    .map((evaluation) => evaluation.value)
    .filter((value): value is number => typeof value === 'number');

  if (translationScores.length === 0) {
    return {
      name: 'avg_translation_accuracy',
      value: 0,
      comment: 'No translation scores found',
    };
  }

  const average = translationScores.reduce((sum, val) => sum + val, 0) / translationScores.length;

  return {
    name: 'avg_translation_accuracy',
    value: average,
    comment: `Average translation accuracy: ${(average * 100).toFixed(1)}%`,
  };
};

/**
 * Run-level evaluator: Calculate weather data retrieval rate
 */
export const weatherRetrievalRateEvaluator: WeatherRunEvaluator = async ({ itemResults }) => {
  // Get all weather_data_retrieval scores
  const weatherScores = itemResults
    .flatMap((result) => result.evaluations)
    .filter((evaluation) => evaluation.name === 'weather_data_retrieval')
    .map((evaluation) => evaluation.value)
    .filter((value): value is number => typeof value === 'number');

  if (weatherScores.length === 0) {
    return {
      name: 'weather_retrieval_rate',
      value: 0,
      comment: 'No weather retrieval scores found',
    };
  }

  const average = weatherScores.reduce((sum, val) => sum + val, 0) / weatherScores.length;

  return {
    name: 'weather_retrieval_rate',
    value: average,
    comment: `Weather retrieval rate: ${(average * 100).toFixed(1)}% (${weatherScores.filter((s) => s === 1).length}/${weatherScores.length} successful)`,
  };
};

/**
 * Run-level evaluator: Calculate activity generation rate
 */
export const activityGenerationRateEvaluator: WeatherRunEvaluator = async ({ itemResults }) => {
  // Get all activity_generation scores
  const activityScores = itemResults
    .flatMap((result) => result.evaluations)
    .filter((evaluation) => evaluation.name === 'activity_generation')
    .map((evaluation) => evaluation.value)
    .filter((value): value is number => typeof value === 'number');

  if (activityScores.length === 0) {
    return {
      name: 'activity_generation_rate',
      value: 0,
      comment: 'No activity generation scores found',
    };
  }

  const average = activityScores.reduce((sum, val) => sum + val, 0) / activityScores.length;

  return {
    name: 'activity_generation_rate',
    value: average,
    comment: `Activity generation rate: ${(average * 100).toFixed(1)}% (${activityScores.filter((s) => s === 1).length}/${activityScores.length} successful)`,
  };
};

/**
 * Export all run-level evaluators
 */
export const runEvaluators: WeatherRunEvaluator[] = [
  averageSuccessRateEvaluator,
  averageTranslationAccuracyEvaluator,
  weatherRetrievalRateEvaluator,
  activityGenerationRateEvaluator,
];
