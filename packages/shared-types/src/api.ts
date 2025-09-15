// API関連の共通型定義とレスポンスインターフェース

// 型定義の再定義（循環インポート回避）
interface ProcessAnalysisResult {
	originalText: string;
	extractedElements: any[];
	processStructure: any;
	confidence: number;
	warnings: string[];
}

interface BPMNGenerationOptions {
	format: 'xml' | 'json' | 'svg' | 'png';
	layoutOptions?: {
		direction: 'horizontal' | 'vertical';
		spacing: number;
	};
	validateSchema?: boolean;
}

interface ValidationResult {
	isValid: boolean;
	errors: any[];
	warnings: any[];
}

interface AnalysisQualityScore {
	overall: number;
	clarity: number;
	completeness: number;
	confidence: number;
}

// 基本APIレスポンス
export interface BaseApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: ApiError;
	timestamp: string;
	requestId?: string;
}

// API成功レスポンス
export interface ApiSuccessResponse<T = unknown> extends BaseApiResponse<T> {
	success: true;
	data: T;
}

// APIエラーレスポンス
export interface ApiErrorResponse extends BaseApiResponse<never> {
	success: false;
	error: ApiError;
}

// API結果のユニオン型
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// エラー情報
export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
	stack?: string;
	timestamp: string;
}

// エラーの種類
export enum ErrorCode {
	// システムエラー
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	TIMEOUT = 'TIMEOUT',

	// リクエストエラー
	BAD_REQUEST = 'BAD_REQUEST',
	INVALID_INPUT = 'INVALID_INPUT',
	MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

	// AI関連エラー
	AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
	AI_RATE_LIMIT = 'AI_RATE_LIMIT',
	AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
	AI_MODEL_NOT_AVAILABLE = 'AI_MODEL_NOT_AVAILABLE',

	// BPMN関連エラー
	BPMN_VALIDATION_ERROR = 'BPMN_VALIDATION_ERROR',
	BPMN_GENERATION_ERROR = 'BPMN_GENERATION_ERROR',
	INVALID_BPMN_STRUCTURE = 'INVALID_BPMN_STRUCTURE',

	// 自然言語処理エラー
	NLP_PROCESSING_ERROR = 'NLP_PROCESSING_ERROR',
	UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
	TEXT_TOO_LONG = 'TEXT_TOO_LONG',
	TEXT_TOO_SHORT = 'TEXT_TOO_SHORT',
}

// プロセス生成リクエスト
export interface ProcessGenerationRequest {
	input: {
		text: string;
		context?: string;
		language?: 'ja' | 'en';
	};
	options?: {
		generateOptions?: BPMNGenerationOptions;
		aiConfig?: {
			temperature?: number;
			maxTokens?: number;
			model?: string;
		};
		validation?: {
			strict?: boolean;
			skipWarnings?: boolean;
		};
	};
}

// プロセス生成レスポンス
export interface ProcessGenerationResponse {
	result: ProcessAnalysisResult;
	validation: ValidationResult;
	qualityScore: AnalysisQualityScore;
	processingTime: number;
	metadata: {
		aiModel: string;
		promptVersion: string;
		processingSteps: ProcessingStep[];
	};
}

// 処理ステップの記録
export interface ProcessingStep {
	step: string;
	duration: number;
	success: boolean;
	details?: Record<string, unknown>;
	error?: string;
}

// BPMN検証リクエスト
export interface BPMNValidationRequest {
	bpmnXml?: string;
	definitions?: any;
	options?: {
		strictMode?: boolean;
		customRules?: string[];
	};
}

// BPMN検証レスポンス
export interface BPMNValidationResponse {
	validation: ValidationResult;
	suggestions?: string[];
	fixableIssues?: FixableIssue[];
}

// 修正可能な問題
export interface FixableIssue {
	issueId: string;
	description: string;
	severity: 'error' | 'warning';
	suggestedFix: string;
	autoFixable: boolean;
}

// 健全性チェック
export interface HealthCheckResponse {
	status: 'healthy' | 'degraded' | 'unhealthy';
	services: Record<string, ServiceStatus>;
	timestamp: string;
}

export interface ServiceStatus {
	status: 'up' | 'down' | 'degraded';
	latency?: number;
	error?: string;
	lastCheck: string;
}

// ページネーション
export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
	pagination: PaginationInfo;
}

// メタデータ情報
export interface ApiMetadata {
	version: string;
	environment: string;
	features: string[];
	limits: {
		maxTextLength: number;
		maxProcessElements: number;
		rateLimit: number;
	};
}

// Webhook関連
export interface WebhookEvent {
	id: string;
	type: string;
	timestamp: string;
	data: Record<string, unknown>;
	source: string;
}

export interface WebhookResponse {
	received: boolean;
	processed: boolean;
	error?: string;
}

// ストリーミングレスポンス
export interface StreamingResponse {
	id: string;
	event: string;
	data: unknown;
	timestamp: string;
}

// Mastraエージェント固有の型
export interface AgentExecutionContext {
	requestId: string;
	userId?: string;
	sessionId?: string;
	startTime: string;
	metadata: Record<string, unknown>;
}

export interface AgentExecutionResult {
	success: boolean;
	result?: unknown;
	error?: ApiError;
	executionTime: number;
	steps: ProcessingStep[];
	context: AgentExecutionContext;
}

// レート制限情報
export interface RateLimitInfo {
	limit: number;
	remaining: number;
	reset: string;
	retryAfter?: number;
}

// API使用統計
export interface UsageStats {
	requests: {
		total: number;
		success: number;
		error: number;
	};
	ai: {
		tokensUsed: number;
		modelsUsed: Record<string, number>;
	};
	performance: {
		averageResponseTime: number;
		p95ResponseTime: number;
	};
	period: {
		start: string;
		end: string;
	};
}
