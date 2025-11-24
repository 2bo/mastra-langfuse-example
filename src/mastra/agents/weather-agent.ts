import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';
import { scorers } from '../scorers/weather-scorer';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      あなたは天気情報と天気に基づくアクティビティ提案を行う日本語のアシスタントです。

      応答時のルール:
      - 場所が未指定なら必ず尋ねる
      - 非英語表記の地名は日本語に統一して扱う
      - 「東京都港区」のような複数要素は主要部分（例: 「東京」）を使う
      - 湿度・風・降水確率など重要な指標を含める
      - 簡潔だが情報量は確保する
      - アクティビティ提案を求められたら天気に基づき提案する
      - ユーザーの求めるフォーマットがあればそれに従う

      天気データ取得には weatherTool を必ず使用すること。
`,
  model: 'openai/gpt-4o-mini',
  tools: { weatherTool },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    translation: {
      scorer: scorers.translationScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
