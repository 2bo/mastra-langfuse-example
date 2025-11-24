#!/usr/bin/env tsx
import { LangfuseClient } from '@langfuse/client';
import {
  weatherDatasetItems,
  WEATHER_DATASET_NAME,
  WEATHER_DATASET_DESCRIPTION,
} from '../datasets/weather-dataset';

/**
 * Script to create and populate the weather workflow evaluation dataset in Langfuse.
 * Run with: tsx src/mastra/experiments/scripts/create-dataset.ts
 */
async function createWeatherDataset() {
  console.log('🚀 Creating weather workflow evaluation dataset...\n');

  const { LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL } = process.env;
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY || !LANGFUSE_BASE_URL) {
    throw new Error(
      'Langfuseの認証情報が足りません。LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL を環境変数で設定してください。',
    );
  }

  // Initialize Langfuse client
  const langfuse = new LangfuseClient({
    publicKey: LANGFUSE_PUBLIC_KEY,
    secretKey: LANGFUSE_SECRET_KEY,
    baseUrl: LANGFUSE_BASE_URL,
  });

  try {
    // Create dataset
    console.log(`📦 Creating dataset: ${WEATHER_DATASET_NAME}`);
    const dataset = await langfuse.api.datasets.create({
      name: WEATHER_DATASET_NAME,
      description: WEATHER_DATASET_DESCRIPTION,
    });
    console.log(`✅ Dataset created with ID: ${dataset.id}\n`);

    // Add dataset items
    console.log(`📝 Adding ${weatherDatasetItems.length} items to dataset...\n`);

    for (const [index, item] of weatherDatasetItems.entries()) {
      console.log(`  [${index + 1}/${weatherDatasetItems.length}] Adding: ${item.input.city}`);
      console.log(
        `     Language: ${item.metadata?.language}, Difficulty: ${item.metadata?.difficulty}`,
      );

      await langfuse.api.datasetItems.create({
        datasetName: WEATHER_DATASET_NAME,
        input: item.input,
        expectedOutput: item.expectedOutput,
        metadata: item.metadata,
      });

      console.log(`     ✅ Added successfully\n`);
    }

    console.log('🎉 Dataset creation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Dataset name: ${WEATHER_DATASET_NAME}`);
    console.log(`   Total items: ${weatherDatasetItems.length}`);
    console.log(`   View in Langfuse UI: ${process.env.LANGFUSE_BASE_URL}/datasets\n`);
  } catch (error) {
    console.error('❌ Error creating dataset:', error);
    throw error;
  } finally {
    // Flush to ensure all data is sent
    await langfuse.flush();
  }
}

// Run the script
createWeatherDataset()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
