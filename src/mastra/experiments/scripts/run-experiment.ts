#!/usr/bin/env tsx
import { LangfuseClient } from '@langfuse/client';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { weatherWorkflowTask } from '../tasks/weather-task';
import { itemEvaluators } from '../evaluators/item-evaluators';
import { runEvaluators } from '../evaluators/run-evaluators';
import { WEATHER_DATASET_NAME } from '../datasets/weather-dataset';

/**
 * weather workflow 用の評価実験を実行するスクリプト。
 * 実行例: tsx src/mastra/experiments/scripts/run-experiment.ts
 *
 * 処理内容:
 * 1. Langfuse からデータセットを取得
 * 2. 各アイテムに対して weather workflow を実行
 * 3. アイテム評価・ラン評価を実施
 * 4. 結果を整形して表示（Langfuse へのリンク付き）
 */

async function runWeatherWorkflowExperiment() {
  console.log('🧪 Starting Weather Workflow Experiment\n');

  // Initialize OpenTelemetry for tracing
  console.log('📡 Initializing OpenTelemetry...');
  const otelSdk = new NodeSDK({
    spanProcessors: [
      new LangfuseSpanProcessor({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_BASE_URL,
      }),
    ],
  });
  otelSdk.start();
  console.log('✅ OpenTelemetry initialized\n');

  // Initialize Langfuse client
  const langfuse = new LangfuseClient({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL,
  });

  try {
    // Fetch dataset
    console.log(`📦 Fetching dataset: ${WEATHER_DATASET_NAME}`);
    const dataset = await langfuse.dataset.get(WEATHER_DATASET_NAME);
    console.log(`✅ Dataset fetched: ${dataset.items.length} items\n`);

    // Get experiment name and description from CLI args or use defaults
    const experimentName =
      process.argv[2] || `Weather Workflow Experiment - ${new Date().toISOString().split('T')[0]}`;
    const experimentDescription =
      process.argv[3] || 'Evaluating weather workflow performance on diverse city names';

    console.log(`🧪 Experiment Configuration:`);
    console.log(`   Name: ${experimentName}`);
    console.log(`   Description: ${experimentDescription}`);
    console.log(`   Dataset: ${WEATHER_DATASET_NAME}`);
    console.log(`   Items: ${dataset.items.length}`);
    console.log(`   Item Evaluators: ${itemEvaluators.length}`);
    console.log(`   Run Evaluators: ${runEvaluators.length}\n`);

    console.log('🚀 Running experiment...\n');

    // Run experiment using the dataset
    const result = await dataset.runExperiment({
      name: experimentName,
      description: experimentDescription,
      task: weatherWorkflowTask,
      evaluators: itemEvaluators,
      runEvaluators: runEvaluators,
      maxConcurrency: 3, // Run 3 items in parallel
      metadata: {
        model: 'gpt-4o-mini',
        version: '1.0.0',
        executedAt: new Date().toISOString(),
      },
    });

    // Display formatted results
    console.log('\n' + '='.repeat(80));
    console.log('📊 EXPERIMENT RESULTS');
    console.log('='.repeat(80) + '\n');

    const formattedResult = await result.format();
    console.log(formattedResult);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Experiment completed successfully!');
    console.log('='.repeat(80) + '\n');

    console.log('🔗 View results in Langfuse:');
    console.log(
      `   Dataset: ${process.env.LANGFUSE_BASE_URL}/project/${dataset.projectId}/datasets/${encodeURIComponent(WEATHER_DATASET_NAME)}`,
    );
    console.log('   Traces: ' + process.env.LANGFUSE_BASE_URL + '/traces\n');
  } catch (error) {
    console.error('❌ Error running experiment:', error);
    throw error;
  } finally {
    // Flush Langfuse client and shutdown OpenTelemetry
    console.log('🔄 Flushing data to Langfuse...');
    await langfuse.flush();
    console.log('✅ Data flushed\n');

    console.log('🔄 Shutting down OpenTelemetry...');
    await otelSdk.shutdown();
    console.log('✅ OpenTelemetry shutdown complete\n');
  }
}

// Run the experiment
runWeatherWorkflowExperiment()
  .then(() => {
    console.log('✨ Experiment script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Experiment script failed:', error);
    process.exit(1);
  });
