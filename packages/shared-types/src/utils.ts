// BPMN構造のバリデーションユーティリティ

// 必要な型定義（循環インポート回避）
interface BaseElement {
	$type: string;
	id?: string;
}

interface Definitions extends BaseElement {
	rootElements: BaseElement[];
}

interface Process extends BaseElement {
	flowElements?: BaseElement[];
}

interface SequenceFlow extends BaseElement {
	sourceRef?: string;
	targetRef?: string;
}

interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

interface ValidationError {
	code: string;
	message: string;
	elementId?: string;
	elementType?: string;
	severity: 'error';
}

interface ValidationWarning {
	code: string;
	message: string;
	elementId?: string;
	elementType?: string;
	severity: 'warning';
}

interface ProcessValidation {
	hasStartEvent: boolean;
	hasEndEvent: boolean;
	hasOrphanedElements: boolean;
	hasUnconnectedFlows: boolean;
	circularReferences: string[];
}

interface ValidationRule {
	name: string;
	check: (elements: BaseElement[]) => ValidationError[];
}

// BPMN要素の基本チェック
export function validateBPMNElement(element: BaseElement): ValidationError[] {
	const errors: ValidationError[] = [];

	// ID必須チェック
	if (!element.id) {
		errors.push({
			code: 'MISSING_ID',
			message: 'BPMN要素にIDが必要です',
			elementId: element.id,
			elementType: element.$type,
			severity: 'error',
		});
	}

	// $type必須チェック
	if (!element.$type) {
		errors.push({
			code: 'MISSING_TYPE',
			message: 'BPMN要素に$typeが必要です',
			elementId: element.id,
			elementType: element.$type,
			severity: 'error',
		});
	}

	return errors;
}

// プロセス全体の構造チェック
export function validateProcessStructure(process: Process): ProcessValidation {
	const flowElements = process.flowElements || [];

	const hasStartEvent = flowElements.some(el => el.$type === 'bpmn:StartEvent');
	const hasEndEvent = flowElements.some(el => el.$type === 'bpmn:EndEvent');

	// 接続されていない要素の検出
	const flows = flowElements.filter(el => el.$type === 'bpmn:SequenceFlow') as SequenceFlow[];
	const flowElementIds = flowElements
		.filter(el => el.$type !== 'bpmn:SequenceFlow')
		.map(el => el.id)
		.filter((id): id is string => id !== undefined);

	const connectedElements = new Set<string>();
	flows.forEach(flow => {
		if (flow.sourceRef) connectedElements.add(flow.sourceRef);
		if (flow.targetRef) connectedElements.add(flow.targetRef);
	});

	const hasOrphanedElements = flowElementIds.some(id => !connectedElements.has(id));

	// 未接続フローの検出
	const hasUnconnectedFlows = flows.some(flow =>
		(flow.sourceRef && !flowElementIds.includes(flow.sourceRef)) ||
		(flow.targetRef && !flowElementIds.includes(flow.targetRef))
	);

	// 循環参照の検出（簡易版）
	const circularReferences = detectCircularReferences(flows);

	return {
		hasStartEvent,
		hasEndEvent,
		hasOrphanedElements,
		hasUnconnectedFlows,
		circularReferences,
	};
}

// 循環参照検出（深度優先探索）
function detectCircularReferences(flows: SequenceFlow[]): string[] {
	const graph = new Map<string, string[]>();
	flows.forEach(flow => {
		if (flow.sourceRef && flow.targetRef) {
			if (!graph.has(flow.sourceRef)) {
				graph.set(flow.sourceRef, []);
			}
			graph.get(flow.sourceRef)!.push(flow.targetRef);
		}
	});

	const visited = new Set<string>();
	const recursionStack = new Set<string>();
	const cycles: string[] = [];

	function dfs(node: string, path: string[]): boolean {
		if (recursionStack.has(node)) {
			cycles.push(path.join(' -> ') + ' -> ' + node);
			return true;
		}

		if (visited.has(node)) {
			return false;
		}

		visited.add(node);
		recursionStack.add(node);

		const neighbors = graph.get(node) || [];
		for (const neighbor of neighbors) {
			if (dfs(neighbor, [...path, node])) {
				return true;
			}
		}

		recursionStack.delete(node);
		return false;
	}

	for (const startNode of graph.keys()) {
		if (!visited.has(startNode)) {
			dfs(startNode, []);
		}
	}

	return cycles;
}

// BPMN定義全体の検証
export function validateDefinitions(definitions: Definitions): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	// 基本構造チェック
	errors.push(...validateBPMNElement(definitions));

	if (!definitions.rootElements || definitions.rootElements.length === 0) {
		errors.push({
			code: 'NO_ROOT_ELEMENTS',
			message: 'BPMN定義にrootElementsが必要です',
			elementId: definitions.id,
			elementType: definitions.$type,
			severity: 'error',
		});
		return { isValid: false, errors, warnings };
	}

	// 各プロセスの検証
	const processes = definitions.rootElements.filter(el => el.$type === 'bpmn:Process') as Process[];

	if (processes.length === 0) {
		errors.push({
			code: 'NO_PROCESSES',
			message: 'BPMN定義にプロセスが含まれていません',
			elementId: definitions.id,
			elementType: definitions.$type,
			severity: 'error',
		});
	}

	processes.forEach(process => {
		// プロセス基本チェック
		errors.push(...validateBPMNElement(process));

		// プロセス構造チェック
		const structureValidation = validateProcessStructure(process);

		if (!structureValidation.hasStartEvent) {
			warnings.push({
				code: 'NO_START_EVENT',
				message: 'プロセスに開始イベントがありません',
				elementId: process.id,
				elementType: process.$type,
				severity: 'warning',
			});
		}

		if (!structureValidation.hasEndEvent) {
			warnings.push({
				code: 'NO_END_EVENT',
				message: 'プロセスに終了イベントがありません',
				elementId: process.id,
				elementType: process.$type,
				severity: 'warning',
			});
		}

		if (structureValidation.hasOrphanedElements) {
			warnings.push({
				code: 'ORPHANED_ELEMENTS',
				message: '接続されていない要素があります',
				elementId: process.id,
				elementType: process.$type,
				severity: 'warning',
			});
		}

		if (structureValidation.hasUnconnectedFlows) {
			errors.push({
				code: 'UNCONNECTED_FLOWS',
				message: '存在しない要素を参照するフローがあります',
				elementId: process.id,
				elementType: process.$type,
				severity: 'error',
			});
		}

		structureValidation.circularReferences.forEach(cycle => {
			errors.push({
				code: 'CIRCULAR_REFERENCE',
				message: `循環参照が検出されました: ${cycle}`,
				elementId: process.id,
				elementType: process.$type,
				severity: 'error',
			});
		});

		// 各フロー要素の検証
		const flowElements = process.flowElements || [];
		flowElements.forEach(element => {
			errors.push(...validateBPMNElement(element));
		});
	});

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

// カスタムルールによる検証
export function validateWithRules(elements: BaseElement[], rules: ValidationRule[]): ValidationError[] {
	const errors: ValidationError[] = [];

	rules.forEach(rule => {
		try {
			errors.push(...rule.check(elements));
		} catch (error) {
			errors.push({
				code: 'RULE_EXECUTION_ERROR',
				message: `検証ルール "${rule.name}" の実行中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
				severity: 'error',
			});
		}
	});

	return errors;
}

// ID重複チェック
export function validateUniqueIds(elements: BaseElement[]): ValidationError[] {
	const errors: ValidationError[] = [];
	const seenIds = new Set<string>();

	elements.forEach(element => {
		if (element.id) {
			if (seenIds.has(element.id)) {
				errors.push({
					code: 'DUPLICATE_ID',
					message: `重複したID "${element.id}" が検出されました`,
					elementId: element.id,
					elementType: element.$type,
					severity: 'error',
				});
			} else {
				seenIds.add(element.id);
			}
		}
	});

	return errors;
}