import { Agent } from '@mastra/core/agent';

/**
 * シティ名を英語（ASCII）表記に正規化するエージェント。
 * - 例: "東京" -> "Tokyo", "São Paulo" -> "Sao Paulo", "札幌市" -> "Sapporo"
 * - すでに英語の場合はそのまま返す
 * - 出力は地名のみ（余計な語句なし）
 */
export const cityTranslatorAgent = new Agent({
  name: 'City Translator Agent',
  instructions: `
    あなたの役割は入力された地名を「英語のASCII表記」に変換して一語で返すことです。
    ルール:
    - 返答は地名のみ。句読点や説明を付けない。
    - アクセント・ダイアクリティカルマークは除去する（São Paulo → Sao Paulo）。
    - すでに英語の場合はそのまま返す。
    - 不明な場合は入力をそのまま返す。
  `,
  model: 'openai/gpt-4o-mini',
});

