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

1. **Mastraプレイグラウンド**から日本語でビジネスプロセスを入力
2. GPT-4o-miniが自動的にプロセス要素を解析・抽出
3. BPMN XML + インタラクティブHTMLビューアーが生成
4. 複数表示形式をテスト中（SVG、データURI等）

**注意**: WebUIは現在未実装。Mastraプレイグラウンドを使用してください。

## AI設定

### 主要なAIプロバイダー
```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 現在対応済みプロバイダー
- **OpenAI**: GPT-4o-mini（実装済み・推奨）
- **Anthropic**: Claude（Mastra統合済み・未テスト）

### 将来対応予定
- AWS Bedrock（要実装）

## プロジェクト構成

**現在の実装状況（シングルパッケージ）：**
```
packages/
└── mastra-agent/    # Mastraエージェント（BPMN生成機能統合済み）
    ├── src/mastra/agents/        # BPMNエージェント
    ├── src/mastra/tools/         # BPMN生成・可視化ツール
    └── generated/                # 生成されたBPMNファイル
```

**将来予定のモノレポ構成：**
```
packages/
├── web-ui/          # React WebUI（未実装）
├── mastra-agent/    # Mastraエージェント（実装済み）
└── shared-types/    # 共通型定義（未実装）
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