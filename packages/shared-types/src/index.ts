// BPMN要素の型定義 - プロジェクト独自の実装
// bpmn-moddleとbpmn-jsはインストール済みだが、型定義はシンプルに独自実装

// よく使うBPMN要素の型エイリアス（bpmn-moddleが生成する実際の構造）
export interface BaseElement {
	id?: string;
	$type: string;
	[key: string]: any;
}

export interface Definitions extends BaseElement {
	$type: 'bpmn:Definitions';
	rootElements?: BaseElement[];
	targetNamespace?: string;
}

export interface Process extends BaseElement {
	$type: 'bpmn:Process';
	id: string;
	name?: string;
	flowElements?: BaseElement[];
	isExecutable?: boolean;
}

export interface FlowElement extends BaseElement {
	id: string;
	name?: string;
	incoming?: string[];
	outgoing?: string[];
}

export interface StartEvent extends FlowElement {
	$type: 'bpmn:StartEvent';
}

export interface EndEvent extends FlowElement {
	$type: 'bpmn:EndEvent';
}

export interface Task extends FlowElement {
	$type: 'bpmn:Task';
}

export interface UserTask extends FlowElement {
	$type: 'bpmn:UserTask';
}

export interface ServiceTask extends FlowElement {
	$type: 'bpmn:ServiceTask';
}

export interface ExclusiveGateway extends FlowElement {
	$type: 'bpmn:ExclusiveGateway';
	default?: string;
}

export interface ParallelGateway extends FlowElement {
	$type: 'bpmn:ParallelGateway';
}

export interface SequenceFlow extends BaseElement {
	$type: 'bpmn:SequenceFlow';
	id: string;
	sourceRef: string;
	targetRef: string;
	conditionExpression?: BaseElement;
}

// 日本語プロセス解析用の拡張型
export interface JapaneseProcessInput {
	text: string;
	context?: string;
}

// AI解析結果の型
export interface ProcessAnalysisResult {
	// BPMN定義
	definitions: Definitions;
	// 解析の信頼度
	confidence: number;
	// 警告メッセージ
	warnings?: string[];
	// 解析されたプロセス要素のサマリー
	summary: {
		totalTasks: number;
		totalGateways: number;
		totalEvents: number;
		flows: number;
	};
}

// プロセス要素の抽出結果
export interface ExtractedElements {
	tasks: Array<{
		id: string;
		name: string;
		type: 'task' | 'userTask' | 'serviceTask';
		description?: string;
	}>;
	gateways: Array<{
		id: string;
		name?: string;
		type: 'exclusive' | 'parallel' | 'inclusive';
		condition?: string;
	}>;
	events: Array<{
		id: string;
		name?: string;
		type: 'start' | 'end' | 'intermediate';
	}>;
	flows: Array<{
		id: string;
		source: string;
		target: string;
		condition?: string;
	}>;
}

// AWS Bedrock用のプロンプト設定
export interface BedrockPromptConfig {
	modelId: string;
	temperature?: number;
	maxTokens?: number;
	systemPrompt?: string;
}

// Mastraエージェント用の設定
export interface AgentConfig {
	name: string;
	description: string;
	bedrockConfig: BedrockPromptConfig;
}

// BPMN生成オプション
export interface BPMNGenerationOptions {
	format: 'xml' | 'json' | 'svg' | 'png';
	layoutOptions?: {
		direction: 'horizontal' | 'vertical';
		spacing: number;
	};
	validateSchema?: boolean;
}
