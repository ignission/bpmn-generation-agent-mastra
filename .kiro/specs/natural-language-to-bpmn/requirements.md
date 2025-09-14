# Requirements Document

## Introduction

日本語で記述されたビジネスプロセスの説明を解析し、BPMN（Business Process Model and Notation）図を自動生成するツールです。ビジネスアナリストや要件定義者が、口頭説明や文書からプロセス図を効率的に作成できるようにします。Mastraフレームワークを活用してTypeScriptベースのAIエージェントとして実装します。

## Requirements

### Requirement 1

**User Story:** ビジネスアナリストとして、日本語でビジネスプロセスを説明したときに、自動的にBPMN図が生成されるようにしたい。そうすることで、手動での図作成時間を大幅に短縮できる。

#### Acceptance Criteria

1. WHEN ユーザーが日本語でビジネスプロセスを入力 THEN システム SHALL プロセスの流れを解析してBPMN要素を特定する
2. WHEN プロセス解析が完了 THEN システム SHALL 適切なBPMN記法（開始イベント、タスク、ゲートウェイ、終了イベント等）を使用して図を生成する
3. WHEN BPMN図が生成される THEN システム SHALL 視覚的に理解しやすい形式で図を表示する

### Requirement 2

**User Story:** ユーザーとして、複雑な条件分岐を含むプロセスを説明したときに、適切なゲートウェイが配置されたBPMN図が生成されるようにしたい。そうすることで、実際のビジネスロジックを正確に表現できる。

#### Acceptance Criteria

1. WHEN プロセス説明に条件分岐（「もし〜なら」「〜の場合」等）が含まれる THEN システム SHALL 排他ゲートウェイまたは包括ゲートウェイを適切に配置する
2. WHEN 並行処理の説明が含まれる THEN システム SHALL 並行ゲートウェイを使用して同時実行を表現する
3. WHEN 複数の条件が組み合わされる THEN システム SHALL 適切なゲートウェイの組み合わせで論理構造を表現する

### Requirement 3

**User Story:** 開発者として、Mastraフレームワークのplayground機能を活用して開発・テストしたい。そうすることで、リアルタイムでの動作確認とデバッグが効率的に行える。

#### Acceptance Criteria

1. WHEN システムを実装 THEN システム SHALL MastraフレームワークのTypeScript環境で動作する
2. WHEN 開発・テスト時 THEN システム SHALL Mastraのplayground機能でリアルタイムに自然言語からBPMN変換をテストできる
3. WHEN AI処理を実行 THEN システム SHALL Mastraのワークフロー機能で処理ステップを可視化・デバッグできる

### Requirement 4

**User Story:** ユーザーとして、生成されたBPMN図を複数の標準的な形式で出力したい。そうすることで、他のBPMNツールや開発環境でも利用できる。

#### Acceptance Criteria

1. WHEN BPMN図が生成される THEN システム SHALL BPMN 2.0標準に準拠したXML形式で出力する
2. WHEN JSON形式での出力が要求される THEN システム SHALL BPMN構造をJSON形式で出力する
3. WHEN 図を表示 THEN システム SHALL SVGまたはPNG形式での画像出力も提供する
4. WHEN 出力ファイルを生成 THEN システム SHALL ファイル名に生成日時を含めて管理しやすくする

### Requirement 5

**User Story:** エンドユーザーとして、専用のWebUIで自然言語を入力し、生成されたBPMN図を編集・修正できるようにしたい。そうすることで、直感的な操作でプロセス図を作成・調整できる。

#### Acceptance Criteria

1. WHEN ユーザーがWebUIにアクセス THEN システム SHALL 自然言語入力フィールドとBPMN表示エリアを提供する
2. WHEN BPMN図が生成される THEN システム SHALL ドラッグ&ドロップによる要素の移動、追加、削除機能を提供する
3. WHEN ユーザーが図を編集 THEN システム SHALL 変更内容をリアルタイムで反映し、標準形式で出力できる

### Requirement 6

**User Story:** ユーザーとして、WebUIで複数のプロセス例を試せるようにしたい。そうすることで、ツールの能力を理解し、適切な説明方法を学習できる。

#### Acceptance Criteria

1. WHEN WebUIを起動 THEN システム SHALL サンプルプロセス説明を複数提供する
2. WHEN サンプルを選択 THEN システム SHALL 対応するBPMN図を即座に生成して表示する
3. WHEN サンプル結果を確認 THEN ユーザー SHALL 自然言語からBPMNへの変換パターンを理解できる

### Requirement 7

**User Story:** 開発者として、WebUIとは別にMastraプレイグラウンドでAIプロンプトの調整とデバッグを行いたい。そうすることで、BPMN生成の精度を効率的に向上させられる。

#### Acceptance Criteria

1. WHEN プロンプト調整時 THEN 開発者 SHALL Mastraプレイグラウンドで自然言語解析ロジックをテストできる
2. WHEN AI処理をデバッグ THEN システム SHALL 各処理ステップの中間結果を可視化する
3. WHEN プロンプトを最適化 THEN システム SHALL 変更内容を即座にWebUIに反映できる