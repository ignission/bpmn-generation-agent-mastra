# BPMN Generation Agent - Mastra

日本語のビジネスプロセス説明からBPMN（Business Process Model and Notation）図を自動生成するTypeScriptベースのAIシステム。MastraフレームワークとAI言語モデルを活用し、自然言語処理によってプロセス図を効率的に作成します。

## 特徴

- 🗾 **日本語対応**: 日本語ビジネスプロセス説明の高精度解析
- 🤖 **AI統合**: 大規模言語モデルによる自然言語処理
- 📊 **BPMN準拠**: BPMN 2.0標準に準拠したプロセス図生成
- 🔧 **Mastra統合**: Mastraフレームワークによるワークフロー管理
- 📱 **WebUI**: React + React Router v7による直感的なユーザーインターフェース

## クイックスタート

### 必要な環境
- Node.js 18+
- pnpm
- AIプロバイダーのAPIキー

### セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd bpmn-generation-agent-mastra
   ```

2. **依存関係のインストール**
   ```bash
   pnpm install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```

   `.env`ファイルにAIプロバイダーのAPIキーを設定：
   ```bash
   # 例：OpenAI使用時
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **開発サーバーの起動**
   ```bash
   pnpm dev
   ```

## 使用方法

1. WebUIまたはMastraプレイグラウンドから日本語でビジネスプロセスを入力
2. AIが自動的にプロセス要素を解析・抽出
3. BPMN図が自動生成される
4. XML、JSON、SVG/PNG形式で出力・ダウンロード可能

## AI設定

### 主要なAIプロバイダー
```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### エンタープライズ向けプロバイダー
```bash
# AWS Bedrock
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## プロジェクト構成

```
packages/
├── web-ui/          # React + React Router v7 フロントエンド
├── mastra-agent/    # Mastraエージェント（処理フロー制御）
├── nlp-processor/   # 自然言語処理サービス（Mastra統合）
├── bpmn-generator/  # BPMN生成サービス（XML/JSON/画像出力）
└── shared-types/    # 共通型定義（BPMNElement, ProcessDefinition等）
```

## 開発コマンド

```bash
# 全パッケージのビルド
pnpm -r build

# 型チェック
pnpm -r typecheck

# Linter実行
pnpm lint

# フォーマット
pnpm format
```

## BPMN要素の対応

| 日本語パターン | BPMN要素 |
|---|---|
| 〜を開始する、〜から始める | StartEvent |
| 〜を実行する、〜を処理する | Task/UserTask/ServiceTask |
| もし〜なら、〜の場合 | ExclusiveGateway |
| 同時に、並行して | ParallelGateway |
| 〜を終了する、完了 | EndEvent |

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストや課題報告を歓迎します。詳細は[CLAUDE.md](./CLAUDE.md)をご確認ください。