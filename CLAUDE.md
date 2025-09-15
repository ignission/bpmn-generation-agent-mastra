# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

日本語のビジネスプロセス説明からBPMN（Business Process Model and Notation）図を自動生成するTypeScriptベースのAIシステム。MastraフレームワークとAWS Bedrockを活用し、自然言語処理によってプロセス図を効率的に作成します。

## アーキテクチャ

### モノレポ構成
```
packages/
├── web-ui/                 # React + React Router v7 フロントエンド
├── mastra-agent/          # Mastraエージェント（処理フロー制御）
├── nlp-processor/         # 自然言語処理サービス（Mastra統合）
├── bpmn-generator/        # BPMN生成サービス（XML/JSON/画像出力）
└── shared-types/          # 共通型定義（BPMNElement, ProcessDefinition等）
```

### 処理フロー
1. **入力受付**: WebUIまたはMastraプレイグラウンドから日本語プロセス説明を受信
2. **自然言語解析**: Mastra統合AI（大規模言語モデル）でプロセス要素を抽出
3. **構造化**: 抽出要素をBPMN構造に変換（タスク、ゲートウェイ、フロー）
4. **BPMN生成**: BPMN 2.0標準準拠のXML生成
5. **出力**: XML、JSON、SVG/PNG形式で出力

### 主要コンポーネント
- **BPMNGenerationAgent**: Mastraワークフローによる全体制御
- **ProcessStructureParser**: BPMN構造構築とレイアウト最適化
- **BPMNGenerator**: 標準形式出力生成

## 開発コマンド

### 初期セットアップ
```bash
# pnpmワークスペースの初期化
pnpm install

# 全パッケージのビルド
pnpm -r build

# 型チェック
pnpm -r typecheck
```

### 開発サーバー起動
```bash
# WebUI開発サーバー
pnpm --filter web-ui dev

# Mastraプレイグラウンド
pnpm --filter mastra-agent playground

# 全パッケージの同時起動
pnpm dev
```

### テスト実行
```bash
# 単体テスト
pnpm test

# 統合テスト
pnpm test:integration

# AIプロンプトテスト（Mastraプレイグラウンド）
pnpm --filter mastra-agent test:prompts
```

### コード品質
```bash
# Biome linter実行
pnpm lint

# フォーマット
pnpm format

# フォーマットチェック
pnpm format:check
```

## 実装状況

実装計画は仕様ドキュメント（`.kiro/specs/natural-language-to-bpmn/tasks.md`）に記載。主要タスク：

1. **基盤構築**: pnpmモノレポ構成、TypeScript設定、Biome設定
2. **共通実装**: BPMN型定義
3. **AI処理**: Mastra統合によるプロンプト管理
4. **BPMN変換**: 構造パーサー、レイアウト最適化
5. **出力生成**: XML/JSON/画像フォーマット対応
6. **Mastra統合**: エージェントワークフロー、プレイグラウンド
7. **WebUI**: React Router v7、BPMNビューアー/エディター
8. **サンプル**: プロセス例ライブラリ、学習機能
9. **統合テスト**: E2Eテスト、エラーハンドリング

## AI設定（Mastra統合）

MastraフレームワークのビルトインAI機能を使用します。独自のAIサービス実装は不要です。

### 環境変数設定

#### 主要なAIプロバイダー
```bash
# .envファイルに追加（いずれか1つ以上）
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

#### エンタープライズ向けAIプロバイダー
```bash
# AWS Bedrock
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 対応AIプロバイダー
- **OpenAI**: GPT-4/GPT-3.5による日本語プロセス解析
- **Anthropic**: Claude 3 Sonnetによる高精度解析
- **AWS Bedrock**: エンタープライズ向けマネージドサービス
- Mastraが自動的にプロバイダーを管理・統合

## BPMN要素の対応

### 日本語パターン → BPMN要素
- 「〜を開始する」「〜から始める」 → StartEvent
- 「〜を実行する」「〜を処理する」 → Task/UserTask/ServiceTask
- 「もし〜なら」「〜の場合」 → ExclusiveGateway（排他ゲートウェイ）
- 「同時に」「並行して」 → ParallelGateway（並行ゲートウェイ）
- 「〜を終了する」「完了」 → EndEvent

## MCP (Model Context Protocol) 設定

このプロジェクトはMCPサーバーを使用してClaude Codeにコンテキストを提供します。

### 利用可能なMCPサーバー
- **filesystem**: プロジェクトファイルへのアクセス
- **context7**: 最新のドキュメントとコード例を動的に取得（無料で使用可能）

設定ファイル: `.mcp.json`

注: Context7はAPIキーなしでも使用できますが、より高いレート制限が必要な場合は[context7.com/dashboard](https://context7.com/dashboard)でAPIキーを取得できます。

## 開発方針

### BPMN型定義について
- `bpmn-moddle`と`bpmn-js`をインストール済みだが、型定義は独自実装を使用
- 理由：標準ライブラリの型定義が複雑で、プロジェクトに必要な部分のみをシンプルに定義
- BPMN 2.0標準に準拠しつつ、実装に必要な型を段階的に追加していく方針
- 必要に応じてClaude（AI）が型定義を拡張・追加可能

### コード生成方針
- 必要最小限の実装から始め、段階的に機能を追加
- 外部ライブラリは参考にしつつ、プロジェクト固有の要件に合わせて実装
- 型安全性を重視し、TypeScriptの厳格モードで開発

## デバッグとトラブルシューティング

### Mastraプレイグラウンドでのデバッグ
```bash
# プレイグラウンド起動
pnpm --filter mastra-agent playground

# 処理ステップの可視化とプロンプト最適化が可能
```

### よくあるエラーと対処法
- **AWS Bedrock接続エラー**: 環境変数とIAM権限を確認
- **BPMN生成失敗**: 入力テキストの構造を確認、プロンプトを調整
- **レイアウト問題**: ProcessStructureParser.optimizeLayoutのパラメータを調整