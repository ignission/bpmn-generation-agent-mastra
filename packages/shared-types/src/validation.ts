// バリデーション関連の型定義

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	code: string;
	message: string;
	elementId?: string;
	elementType?: string;
	severity: 'error';
}

export interface ValidationWarning {
	code: string;
	message: string;
	elementId?: string;
	elementType?: string;
	severity: 'warning';
}

// BPMN構造の検証ルール
export interface ValidationRule {
	id: string;
	name: string;
	description: string;
	check: (elements: any[]) => ValidationError[];
}

// プロセス構造の検証
export interface ProcessValidation {
	hasStartEvent: boolean;
	hasEndEvent: boolean;
	hasOrphanedElements: boolean;
	hasUnconnectedFlows: boolean;
	circularReferences: string[];
}

// 日本語テキスト解析の品質スコア
export interface AnalysisQualityScore {
	confidence: number; // 0-1の信頼度
	completeness: number; // 抽出の完全性
	clarity: number; // プロセスの明確性
	ambiguityLevel: number; // 曖昧さのレベル
	suggestions: string[]; // 改善提案
}