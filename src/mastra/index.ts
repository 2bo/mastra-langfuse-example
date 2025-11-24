import { DefaultExporter } from '@mastra/core/ai-tracing';
import { Mastra } from '@mastra/core/mastra';
import { LangfuseExporter } from '@mastra/langfuse';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { weatherAgent } from './agents/weather-agent';
import { cityTranslatorAgent } from './agents/city-translator-agent';
import {
  completenessScorer,
  toolCallAppropriatenessScorer,
  translationScorer,
} from './scorers/weather-scorer';
import { weatherWorkflow } from './workflows/weather-workflow';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, cityTranslatorAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'debug',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    configs: {
      default: {
        serviceName: 'mastra-langfuse-example',
        exporters: [
          new DefaultExporter(), // For Studio/Playground
          new LangfuseExporter({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY,
            secretKey: process.env.LANGFUSE_SECRET_KEY,
            baseUrl: process.env.LANGFUSE_BASE_URL,
            realtime: process.env.NODE_ENV === 'development',
            logLevel: 'info',
          }),
        ],
      },
    },
  },
});
