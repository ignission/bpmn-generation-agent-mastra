import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const bpmnTool = createTool({
	id: 'generate-bpmn',
	description: '日本語のビジネスプロセス説明からBPMN XML/JSONを生成する',
	inputSchema: z.object({
		processText: z.string().describe('日本語のビジネスプロセス説明'),
		format: z.enum(['xml', 'json', 'both']).default('both').describe('出力フォーマット'),
	}),
	outputSchema: z.object({
		xml: z.string().optional().describe('BPMN XML形式'),
		json: z.object({}).optional().describe('BPMN JSON形式'),
		processName: z.string().describe('抽出されたプロセス名'),
		elementsCount: z
			.object({
				startEvents: z.number(),
				tasks: z.number(),
				gateways: z.number(),
				endEvents: z.number(),
			})
			.describe('抽出された要素数'),
	}),
	execute: async ({ context }) => {
		return await generateBPMN(context.processText, context.format);
	},
});

const generateBPMN = async (processText: string, format: 'xml' | 'json' | 'both' = 'both') => {
	// 簡単なプロセス名抽出
	const processName = extractProcessName(processText);

	// 基本的なBPMN要素を抽出（簡易版）
	const elements = extractBPMNElements(processText);

	// BPMN XMLを生成
	const xml = format === 'json' ? undefined : generateBPMNXML(processName, elements);

	// BPMN JSONを生成
	const json = format === 'xml' ? undefined : generateBPMNJSON(processName, elements);

	return {
		xml,
		json,
		processName,
		elementsCount: {
			startEvents: elements.startEvents.length,
			tasks: elements.tasks.length,
			gateways: elements.gateways.length,
			endEvents: elements.endEvents.length,
		},
	};
};

interface BPMNElements {
	startEvents: Array<{ id: string; name: string }>;
	tasks: Array<{ id: string; name: string; type: string }>;
	gateways: Array<{ id: string; name: string; type: string }>;
	endEvents: Array<{ id: string; name: string }>;
	flows: Array<{ id: string; sourceRef: string; targetRef: string }>;
}

// 長いテキストを適切な長さに短縮
const truncateText = (text: string, maxLength: number = 20): string => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
};

const extractProcessName = (text: string): string => {
	// 簡易的なプロセス名抽出
	const firstSentence = text.split(/[。．]/)[0];
	if (firstSentence.length > 30) {
		return firstSentence.substring(0, 30) + '...プロセス';
	}
	return firstSentence + 'プロセス';
};

const extractBPMNElements = (text: string): BPMNElements => {
	const elements: BPMNElements = {
		startEvents: [],
		tasks: [],
		gateways: [],
		endEvents: [],
		flows: [],
	};

	// 日本語パターンマッチング（簡易版）

	// 開始イベントのパターン
	const startPatterns = [
		/([^。．]*(?:申請|依頼|要求|注文).*?(?:受け付け|受信|到着))/g,
		/([^。．]*(?:プロセス|処理|手続き).*?(?:開始|スタート))/g,
	];

	startPatterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const id = `start_${elements.startEvents.length + 1}`;
			elements.startEvents.push({
				id,
				name: truncateText(match[1].trim() || 'プロセス開始', 15),
			});
		}
	});

	// タスクのパターン
	const taskPatterns = [
		/([^。．]*(?:確認|チェック|検証|処理|実行|作成|送信|登録|保存|承認|却下))/g,
	];

	taskPatterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const id = `task_${elements.tasks.length + 1}`;
			const taskText = match[1].trim();
			elements.tasks.push({
				id,
				name: truncateText(taskText || 'タスク実行', 12),
				type: 'userTask',
			});
		}
	});

	// 条件分岐（ゲートウェイ）のパターン
	const gatewayPatterns = [/([^。．]*(?:もし|場合|なら|ならば|かどうか|判断|条件))/g];

	gatewayPatterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const id = `gateway_${elements.gateways.length + 1}`;
			elements.gateways.push({
				id,
				name: truncateText(match[1].trim() || '条件判定', 10),
				type: 'exclusiveGateway',
			});
		}
	});

	// 終了イベントのパターン
	const endPatterns = [/([^。．]*(?:完了|終了|通知|結果|完成))/g];

	endPatterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const id = `end_${elements.endEvents.length + 1}`;
			elements.endEvents.push({
				id,
				name: truncateText(match[1].trim() || 'プロセス完了', 15),
			});
		}
	});

	// 基本的なフロー生成（要素が1つもない場合のフォールバック）
	if (elements.startEvents.length === 0) {
		elements.startEvents.push({ id: 'start_1', name: 'プロセス開始' });
	}

	if (elements.tasks.length === 0) {
		elements.tasks.push({ id: 'task_1', name: '処理実行', type: 'userTask' });
	}

	if (elements.endEvents.length === 0) {
		elements.endEvents.push({ id: 'end_1', name: 'プロセス完了' });
	}

	// シンプルなフロー接続を生成
	const allElements = [
		...elements.startEvents,
		...elements.tasks,
		...elements.gateways,
		...elements.endEvents,
	];

	for (let i = 0; i < allElements.length - 1; i++) {
		elements.flows.push({
			id: `flow_${i + 1}`,
			sourceRef: allElements[i].id,
			targetRef: allElements[i + 1].id,
		});
	}

	return elements;
};

const generateBPMNXML = (processName: string, elements: BPMNElements): string => {
	const processId = 'process_1';

	const startEventsXML = elements.startEvents
		.map((el) => `    <bpmn:startEvent id="${el.id}" name="${el.name}" />`)
		.join('\n');

	const tasksXML = elements.tasks
		.map((el) => `    <bpmn:userTask id="${el.id}" name="${el.name}" />`)
		.join('\n');

	const gatewaysXML = elements.gateways
		.map((el) => `    <bpmn:exclusiveGateway id="${el.id}" name="${el.name}" />`)
		.join('\n');

	const endEventsXML = elements.endEvents
		.map((el) => `    <bpmn:endEvent id="${el.id}" name="${el.name}" />`)
		.join('\n');

	const flowsXML = elements.flows
		.map(
			(flow) =>
				`    <bpmn:sequenceFlow id="${flow.id}" sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}" />`,
		)
		.join('\n');

	// レイアウト情報を生成
	const diagramXML = generateDiagramInfo(processId, elements);

	return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" name="${processName}" isExecutable="false">
${startEventsXML}
${tasksXML}
${gatewaysXML}
${endEventsXML}
${flowsXML}
  </bpmn:process>
${diagramXML}
</bpmn:definitions>`;
};

const generateDiagramInfo = (processId: string, elements: BPMNElements): string => {
	let x = 100; // 開始X座標
	let y = 100; // Y座標
	const spacing = 180; // 要素間のスペースを拡大

	let shapeXML = '';
	let edgeXML = '';

	// 全ての要素をリスト化（順番を保持）
	const allElements = [
		...elements.startEvents,
		...elements.tasks,
		...elements.gateways,
		...elements.endEvents,
	];

	// 各要素の座標を計算してShape要素を生成
	allElements.forEach((element, index) => {
		const elementX = x + index * spacing;
		let width = 100;
		let height = 80;

		// 要素タイプに応じてサイズを調整
		if (
			elements.startEvents.some((e) => e.id === element.id) ||
			elements.endEvents.some((e) => e.id === element.id)
		) {
			width = 36;
			height = 36;
		} else if (elements.gateways.some((e) => e.id === element.id)) {
			width = 50;
			height = 50;
		} else {
			// タスクのサイズを拡大
			width = 120;
			height = 80;
		}

		shapeXML += `    <bpmndi:BPMNShape id="BPMNShape_${element.id}" bpmnElement="${element.id}">
      <dc:Bounds x="${elementX}" y="${y}" width="${width}" height="${height}" />
    </bpmndi:BPMNShape>\n`;
	});

	// フロー（エッジ）の座標を生成
	elements.flows.forEach((flow) => {
		const sourceIndex = allElements.findIndex((e) => e.id === flow.sourceRef);
		const targetIndex = allElements.findIndex((e) => e.id === flow.targetRef);

		// 要素の中心点を計算
		const sourceX = x + sourceIndex * spacing + 60; // 要素幅の中心
		const targetX = x + targetIndex * spacing + 60;
		const flowY = y + 40;

		edgeXML += `    <bpmndi:BPMNEdge id="BPMNEdge_${flow.id}" bpmnElement="${flow.id}">
      <di:waypoint x="${sourceX}" y="${flowY}" />
      <di:waypoint x="${targetX}" y="${flowY}" />
    </bpmndi:BPMNEdge>\n`;
	});

	return `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
${shapeXML}${edgeXML}    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
};

const generateBPMNJSON = (processName: string, elements: BPMNElements) => {
	return {
		definitions: {
			$type: 'bpmn:Definitions',
			id: 'Definitions_1',
			targetNamespace: 'http://bpmn.io/schema/bpmn',
			rootElements: [
				{
					$type: 'bpmn:Process',
					id: 'process_1',
					name: processName,
					isExecutable: false,
					flowElements: [
						...elements.startEvents.map((el) => ({
							$type: 'bpmn:StartEvent',
							id: el.id,
							name: el.name,
						})),
						...elements.tasks.map((el) => ({
							$type: 'bpmn:UserTask',
							id: el.id,
							name: el.name,
						})),
						...elements.gateways.map((el) => ({
							$type: 'bpmn:ExclusiveGateway',
							id: el.id,
							name: el.name,
						})),
						...elements.endEvents.map((el) => ({
							$type: 'bpmn:EndEvent',
							id: el.id,
							name: el.name,
						})),
						...elements.flows.map((flow) => ({
							$type: 'bpmn:SequenceFlow',
							id: flow.id,
							sourceRef: flow.sourceRef,
							targetRef: flow.targetRef,
						})),
					],
				},
			],
		},
	};
};
