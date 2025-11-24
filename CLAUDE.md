# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Mastra + Langfuse統合のサンプルプロジェクト**です。以下を実演します：
- MastraによるAIエージェントとワークフローの構築
- 観測性と評価のためのLangfuse統合
- LLM出力品質評価のためのカスタムスコアラー作成
- データセットを使った自動評価実験

本アプリケーションは、都市名（主に日本語）を受け取り、天気データを取得して、その場所に特化したアクティビティを提案する天気ベースのレコメンデーションシステムです。

## よく使うコマンド

### 開発
```bash
# Mastra開発サーバー起動（ホットリロード付き）
npm run dev

# Mastraプロジェクトのビルド
npm run build

# 本番サーバー起動
npm start
```

### コード品質
```bash
# 型チェック
npm run typecheck

# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix

# Prettierでフォーマット
npm run format

# フォーマットチェックのみ（変更なし）
npm run format:check
```

### 実験・評価
```bash
# Langfuseに評価用データセットを作成
npm run experiment:create-dataset

# デフォルト名で実験実行
npm run experiment:run

# カスタム名・説明付きで実験実行
npm run experiment:run "実験名" "実験の説明"
```

## アーキテクチャ

### エージェントシステム
- **weatherAgent** (`src/mastra/agents/weather-agent.ts`): `weatherTool`を使って天気データを取得し、日本語でアクティビティ提案を生成するメインエージェント。3つのスコアラーを搭載：ツール呼び出しの適切性、完全性、翻訳品質。
- **cityTranslatorAgent** (`src/mastra/agents/city-translator-agent.ts`): 非英語の都市名を英語ASCII表記に正規化し、ジオコーディングAPIで確実に検索できるようにする。

### ワークフローパイプライン
**weatherWorkflow** (`src/mastra/workflows/weather-workflow.ts`)は3ステップで構成：
1. **normalizeCity**: 日本語・非英語の都市名を翻訳エージェントで英語ASCII表記に変換
2. **fetchWeather**: Open-Meteo API（ジオコーディング＋天気予報）を呼び出し
3. **planActivities**: weatherAgentを使い、天気条件に基づいた構造化された日本語アクティビティ提案を生成

### 観測性と評価
**Langfuse統合** (`src/mastra/index.ts`):
- `LangfuseExporter`と`DefaultExporter`を併用して二重の観測性を実現
- 必要な環境変数: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`
- 開発モードではリアルタイムログを有効化

**スコアラー** (`src/mastra/scorers/weather-scorer.ts`):
- `toolCallAppropriatenessScorer`: weatherToolの正しい使用を検証
- `completenessScorer`: 出力に期待される全情報が含まれているか確認
- `translationScorer`: 非英語地名の翻訳品質を評価するカスタムLLM判定スコアラー

**実験システム** (`src/mastra/experiments/`):
- 様々な日本語都市名をカバーする5つのテストケースのデータセット定義
- アイテムレベル評価：天気取得、アクティビティ生成、地名翻訳、総合成功
- ランレベル評価：集計メトリクス（成功率、翻訳精度）
- 詳細は`src/mastra/experiments/README.md`を参照（日本語ドキュメント）

### ストレージとメモリ
- **LibSQLStore**: Mastraストレージとエージェントメモリの両方で使用
- `src/mastra/index.ts`のストレージは`:memory:`（揮発性データ）
- エージェントメモリは`file:../mastra.db`に永続化（`.mastra/output`ディレクトリからの相対パス）

## 環境設定

必須の環境変数:
```
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
NODE_ENV=development  # Langfuseリアルタイムログを有効化
```

オプション:
```
OPENAI_API_KEY=...  # デフォルトのプロバイダー設定を使わない場合
```

## 技術的注意点

- **Node.jsバージョン**: >=22.13.0が必要（package.jsonのenginesを参照）
- **モジュールシステム**: ESモジュール（`"type": "module"`）
- **TypeScript**: strictモード有効、bundlerモジュール解決
- **Mastra CLI**: build/dev/startコマンド用にdevDependencyで利用可能
- **外部API**: Open-Meteo（ジオコーディングと天気）- APIキー不要
- **日本語対応**: エージェント指示、プロンプト、出力フォーマットは主に日本語

## 重要なファイル
- `src/mastra/index.ts`: エージェント、ワークフロー、スコアラー、観測性を含むMastraインスタンス設定
- `src/mastra/tools/weather-tool.ts`: Open-Meteo APIを使う天気データ取得ツール
- `src/mastra/workflows/weather-workflow.ts`: 都市名正規化、天気取得、アクティビティ提案ステップを含むメインワークフロー
- `src/mastra/experiments/scripts/run-experiment.ts`: Langfuse実験実行のエントリーポイント
