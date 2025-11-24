# weather-workflow experiments ドキュメント

Mastra + Langfuse で weather workflow を自動評価する仕組みのまとめです。`src/mastra/experiments/` 配下のコードを対象にしています。

## 目的
- 多言語（主に日本語）入力の都市名に対し、天気取得とアクティビティ提案が期待通りに動くかを自動で検証する。
- Langfuse Experiments を使ってスコアを保存し、結果をダッシュボードで比較できるようにする。

## セットアップ
1. 依存インストール: `npm install`
2. `.env` などで環境変数を設定  
   - `LANGFUSE_PUBLIC_KEY`  
   - `LANGFUSE_SECRET_KEY`  
   - `LANGFUSE_BASE_URL`

## 実行手順
1. データセット作成  
   ```bash
   npm run experiment:create-dataset
   ```
2. 実験実行  
   ```bash
   npm run experiment:run
   # カスタム名・説明を付ける例
   npm run experiment:run "v1 日本語プロンプト" "日本語評価スモーク"
   ```

## 評価の観点
- `weather_data_retrieval`: 天気情報が取得できたか。
- `activity_generation`: アクティビティ提案が生成されたか。
- `location_translation`: 出力地名が期待する日本語表記と一致するか（レーベンシュタイン距離で部分点）。
- `overall_success`: 主要チェックの総合。
- Run レベルでは各指標の平均/成功率を集計。

## ディレクトリ構成（抜粋）
- `datasets/weather-dataset.ts`  
  評価データセット定義とサンプル5件。期待地名は日本語表記 (`locationInJapanese`)。
- `tasks/weather-task.ts`  
  実際の `weatherWorkflow` を走らせ、評価で使う出力形式に整形するタスク。
- `evaluators/item-evaluators.ts`  
  アイテム単位の評価（天気取得・アクティビティ生成・地名日本語一致・総合）。
- `evaluators/run-evaluators.ts`  
  ラン全体の集計評価（平均成功率・翻訳精度・天気取得率・アクティビティ生成率）。
- `scripts/create-dataset.ts`  
  Langfuse 上にデータセットを作成し、サンプルアイテムを投入する CLI。
- `scripts/run-experiment.ts`  
  データセットを取得してタスク＋評価を実行し、結果を整形表示。Langfuseにスコア・トレースも保存。

## トラブルシューティング
- データセットが見つからない: `npm run experiment:create-dataset` を再実行。
- ネットワーク系エラー: Open-Meteo API への外部アクセス可否を確認。
- Langfuse認証エラー: 環境変数のキー/URLを再確認。
