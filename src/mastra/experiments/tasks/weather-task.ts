import type { ExperimentItem } from '@langfuse/client';
import { mastra } from '../../index';
import type { WeatherDatasetItem } from '../datasets/weather-dataset';

/**
 * Task function for running the weather workflow in experiments.
 * This function is called by the Experiment Runner for each dataset item.
 */
export async function weatherWorkflowTask(item: ExperimentItem): Promise<{
  activities: string;
  location: string;
  hasWeatherInfo: boolean;
  hasActivities: boolean;
}> {
  // Extract input from dataset item
  const input = item.input as WeatherDatasetItem['input'];
  const city = input.city;

  console.log(`\n🌤️  Running weather workflow for: ${city}`);

  try {
    // Get the weather workflow from mastra
    const workflow = mastra.getWorkflow('weatherWorkflow');

    if (!workflow) {
      throw new Error('Weather workflow not found');
    }

    // Execute the workflow with inputData
    const run = await workflow.createRunAsync();
    const workflowResult = await run.start({
      inputData: { city },
    });

    if (workflowResult.status !== 'success') {
      console.error(`   ❌ Workflow failed with status: ${workflowResult.status}`);
      return {
        activities: '',
        location: city,
        hasWeatherInfo: false,
        hasActivities: false,
      };
    }

    // The final workflow output is the activities string
    const activities = workflowResult.result.activities ?? '';

    const fetchWeatherStep = workflowResult.steps['fetch-weather'];
    const planActivitiesStep = workflowResult.steps['plan-activities'];

    const location =
      fetchWeatherStep?.status === 'success' && 'location' in fetchWeatherStep.output
        ? (fetchWeatherStep.output.location as string)
        : city;

    // To get intermediate step results, we need to access them differently
    // For now, we'll extract location from the activities response
    // Since the workflow returns activities, we need to check if it has weather info
    const hasActivities =
      planActivitiesStep?.status === 'success'
        ? Boolean(activities && activities.trim().length > 0)
        : false;

    // We'll infer weather retrieval success from having activities
    // (since activities require weather data)
    const hasWeatherInfo = fetchWeatherStep?.status === 'success';

    console.log(`   ✅ Workflow completed`);
    console.log(`   📍 Location: ${location}`);
    console.log(`   🎯 Has weather info: ${hasWeatherInfo}`);
    console.log(`   🎯 Has activities: ${hasActivities}`);

    return {
      activities: activities || '',
      location,
      hasWeatherInfo,
      hasActivities,
    };
  } catch (error) {
    console.error(`   ❌ Error executing workflow for ${city}:`, error);

    // Return empty result on error
    return {
      activities: '',
      location: '',
      hasWeatherInfo: false,
      hasActivities: false,
    };
  }
}
