import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { promises as fs } from 'fs';
import * as path from 'path';

export const bpmnVisualizationTool = createTool({
	id: 'visualize-bpmn',
	description: 'BPMN XMLから画像を生成する',
	inputSchema: z.object({
		bpmnXml: z.string().describe('BPMN XML文字列'),
		format: z
			.enum(['html', 'svg'])
			.default('html')
			.describe('出力フォーマット（HTMLビューアーまたはSVG）'),
		filename: z.string().optional().describe('ファイル名（拡張子なし）'),
	}),
	outputSchema: z.object({
		imageUrl: z.string().describe('生成された画像のURL'),
		filePath: z.string().describe('生成されたファイルのパス'),
		dimensions: z
			.object({
				width: z.number(),
				height: z.number(),
			})
			.describe('画像のサイズ'),
		asciiPreview: z.string().describe('プレイグラウンド表示用のASCII図'),
		// 複数の表示形式テスト用
		svgContent: z.string().describe('生のSVG文字列'),
		dataUriUTF8: z.string().describe('UTF-8エンコードされたデータURI'),
		dataUriBase64: z.string().describe('Base64エンコードされたデータURI'),
		htmlContent: z.string().describe('HTML形式のコンテンツ'),
		testResults: z
			.object({
				format: z.string(),
				description: z.string(),
			})
			.array()
			.describe('テスト用の表示形式情報'),
	}),
	execute: async ({ context }) => {
		return await generateBPMNImage(context.bpmnXml, context.format, context.filename);
	},
});

const generateBPMNImage = async (
	bpmnXml: string,
	format: 'html' | 'svg' = 'html',
	filename?: string,
): Promise<{
	imageUrl: string;
	filePath: string;
	dimensions: { width: number; height: number };
	asciiPreview: string;
	svgContent: string;
	dataUriUTF8: string;
	dataUriBase64: string;
	htmlContent: string;
	testResults: Array<{ format: string; description: string }>;
}> => {
	// 出力ディレクトリを作成（mastra-agentパッケージ内の generated フォルダ）
	const outputDir = path.join(process.cwd(), 'generated');
	await fs.mkdir(outputDir, { recursive: true });

	// ファイル名を生成
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const baseFilename = filename || 'bpmn-' + timestamp;
	const extension = 'html'; // 常にHTMLファイルを生成
	const outputPath = path.join(outputDir, baseFilename + '.' + extension);

	// 常にインタラクティブなBPMNビューアーを作成
	const bpmnViewerHTML = createBPMNViewerHTML(bpmnXml);
	await fs.writeFile(outputPath, bpmnViewerHTML);

	// ASCII図も生成
	const asciiPreview = generateASCIIPreview(bpmnXml);

	// 複数の表示形式を生成してテスト
	const lightweightSVG = createLightweightBPMNSVG(bpmnXml);
	const simpleSVG = createSimpleBPMNSVG(bpmnXml); // より軽量なテスト用SVG

	// 異なるエンコーディング方式でデータURIを生成
	const dataUriUTF8 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(simpleSVG);
	const dataUriBase64 = 'data:image/svg+xml;base64,' + Buffer.from(simpleSVG).toString('base64');
	const wrappedSVG = '<div style="border: 1px solid #ddd; padding: 10px;">' + simpleSVG + '</div>';

	// テスト結果情報
	const testResults = [
		{ format: 'svgContent', description: 'Raw SVG string with colors and styling' },
		{ format: 'dataUriUTF8', description: 'UTF-8 encoded data URI' },
		{ format: 'dataUriBase64', description: 'Base64 encoded data URI' },
		{ format: 'htmlContent', description: 'SVG wrapped in HTML div' },
		{ format: 'asciiPreview', description: 'Text-based ASCII diagram' },
	];

	return {
		imageUrl: 'file://' + outputPath,
		filePath: outputPath,
		dimensions: { width: 800, height: 600 },
		asciiPreview,
		svgContent: lightweightSVG,
		dataUriUTF8,
		dataUriBase64,
		htmlContent: wrappedSVG,
		testResults,
	};
};

const createBPMNViewerHTML = (bpmnXml: string): string => {
	return [
		'<!DOCTYPE html>',
		'<html>',
		'<head>',
		'  <meta charset="UTF-8">',
		'  <title>BPMN Viewer</title>',
		'  <script src="https://unpkg.com/bpmn-js@18.6.3/dist/bpmn-viewer.development.js"></script>',
		'  <style>',
		'    body {',
		'      margin: 0;',
		'      padding: 20px;',
		'      font-family: Arial, sans-serif;',
		'      background: white;',
		'    }',
		'    .bjs-container {',
		'      background: white;',
		'      border: 1px solid #ccc;',
		'      height: 80vh;',
		'      width: 100%;',
		'    }',
		'    .error {',
		'      color: red;',
		'      padding: 20px;',
		'      background: #ffe6e6;',
		'      border: 1px solid red;',
		'      margin: 10px 0;',
		'    }',
		'  </style>',
		'</head>',
		'<body>',
		'  <div id="canvas" class="bjs-container"></div>',
		'  <script>',
		'    const bpmnXML = `' + bpmnXml.replace(/`/g, '\\`') + '`;',
		'    const viewer = new window.BpmnJS({',
		'      container: "#canvas"',
		'    });',
		'    viewer.importXML(bpmnXML)',
		'      .then(function(result) {',
		'        console.log("BPMN図の読み込み成功");',
		'        const canvas = viewer.get("canvas");',
		'        canvas.zoom("fit-viewport");',
		'      })',
		'      .catch(function(err) {',
		'        console.error("BPMN図の読み込み失敗:", err);',
		'        document.getElementById("canvas").innerHTML =',
		"          '<div class=\"error\">BPMN図の読み込みに失敗しました: ' + err.message + '</div>';",
		'      });',
		'  </script>',
		'</body>',
		'</html>',
	].join('\n');
};

const generateASCIIPreview = (bpmnXml: string): string => {
	const startEvents = (bpmnXml.match(/<bpmn:startEvent[^>]*name="([^"]*)"[^>]*\/>/g) || []).map(
		(match) => match.match(/name="([^"]*)"/)?.[1] || 'Start',
	);

	const tasks = (bpmnXml.match(/<bpmn:userTask[^>]*name="([^"]*)"[^>]*\/>/g) || []).map(
		(match) => match.match(/name="([^"]*)"/)?.[1] || 'Task',
	);

	const endEvents = (bpmnXml.match(/<bpmn:endEvent[^>]*name="([^"]*)"[^>]*\/>/g) || []).map(
		(match) => match.match(/name="([^"]*)"/)?.[1] || 'End',
	);

	let ascii = '\n';
	ascii += '╔══════════════════════════════════════════╗\n';
	ascii += '║           📊 BPMN プロセスフロー           ║\n';
	ascii += '╚══════════════════════════════════════════╝\n';
	ascii += '\n';

	let currentLine = '';

	// 開始イベント
	if (startEvents.length > 0) {
		const startName =
			startEvents[0].length > 8 ? startEvents[0].substring(0, 8) + '...' : startEvents[0];
		currentLine += '🟢 ' + startName;
	}

	// タスク
	tasks.forEach((task) => {
		const taskName = task.length > 10 ? task.substring(0, 10) + '...' : task;
		if (currentLine.length > 0) {
			currentLine += ' ─► ';
		}
		currentLine += '📋 ' + taskName;
	});

	// 終了イベント
	if (endEvents.length > 0) {
		const endName = endEvents[0].length > 8 ? endEvents[0].substring(0, 8) + '...' : endEvents[0];
		if (currentLine.length > 0) {
			currentLine += ' ─► ';
		}
		currentLine += '🔴 ' + endName;
	}

	ascii += currentLine + '\n';
	ascii += '\n';
	ascii += '💡 詳細: 生成されたHTMLファイルで完全なBPMN図をご覧ください\n';
	ascii += '🔍 機能: ズーム、パン、標準BPMN記法での表示';

	return ascii;
};

// テスト用のシンプルなSVG生成（最小限の要素でテスト）
const createSimpleBPMNSVG = (bpmnXml: string): string => {
	const svgContent = [
		'<svg width="400" height="120" xmlns="http://www.w3.org/2000/svg" style="background: white; border: 1px solid #ddd;">',
		'  <circle cx="50" cy="60" r="20" fill="#4CAF50" stroke="#333" stroke-width="2"/>',
		'  <text x="50" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="white">開始</text>',
		'  <line x1="70" y1="60" x2="120" y2="60" stroke="#333" stroke-width="2"/>',
		'  <polygon points="115,55 125,60 115,65" fill="#333"/>',
		'  <rect x="130" y="40" width="80" height="40" rx="5" fill="#2196F3" stroke="#333" stroke-width="2"/>',
		'  <text x="170" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="white">処理</text>',
		'  <line x1="210" y1="60" x2="260" y2="60" stroke="#333" stroke-width="2"/>',
		'  <polygon points="255,55 265,60 255,65" fill="#333"/>',
		'  <circle cx="280" cy="60" r="20" fill="#f44336" stroke="#333" stroke-width="3"/>',
		'  <text x="280" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="white">終了</text>',
		'  <text x="200" y="20" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">テスト用BPMN図</text>',
		'</svg>',
	];
	return svgContent.join('\n');
};

// Mastraプレイグラウンド用の軽量BPMN SVG生成（インライン表示用）
const createLightweightBPMNSVG = (bpmnXml: string): string => {
	// 簡略化されたバージョン - 基本的なフロー図のみ
	return [
		'<svg width="600" height="140" xmlns="http://www.w3.org/2000/svg" style="background: white; border: 1px solid #ddd;">',
		'  <text x="300" y="25" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">📊 BPMN Process Flow</text>',
		'  <circle cx="80" cy="80" r="20" fill="#e8f5e8" stroke="#4CAF50" stroke-width="2"/>',
		'  <text x="80" y="85" text-anchor="middle" font-family="Arial" font-size="12">🟢</text>',
		'  <text x="80" y="105" text-anchor="middle" font-family="Arial" font-size="10">開始</text>',
		'  <line x1="100" y1="80" x2="180" y2="80" stroke="#666" stroke-width="2"/>',
		'  <polygon points="175,75 185,80 175,85" fill="#666"/>',
		'  <rect x="190" y="60" width="100" height="40" rx="5" fill="#f0f8ff" stroke="#2196F3" stroke-width="2"/>',
		'  <text x="240" y="75" text-anchor="middle" font-family="Arial" font-size="12">📋</text>',
		'  <text x="240" y="88" text-anchor="middle" font-family="Arial" font-size="10">タスク</text>',
		'  <line x1="290" y1="80" x2="370" y2="80" stroke="#666" stroke-width="2"/>',
		'  <polygon points="365,75 375,80 365,85" fill="#666"/>',
		'  <path d="M 400 60 L 420 80 L 400 100 L 380 80 Z" fill="#fff3e0" stroke="#FF9800" stroke-width="2"/>',
		'  <text x="400" y="83" text-anchor="middle" font-family="Arial" font-size="12">◆</text>',
		'  <text x="400" y="115" text-anchor="middle" font-family="Arial" font-size="10">判定</text>',
		'  <line x1="420" y1="80" x2="500" y2="80" stroke="#666" stroke-width="2"/>',
		'  <polygon points="495,75 505,80 495,85" fill="#666"/>',
		'  <circle cx="520" cy="80" r="20" fill="#ffebee" stroke="#f44336" stroke-width="3"/>',
		'  <text x="520" y="85" text-anchor="middle" font-family="Arial" font-size="12">🔴</text>',
		'  <text x="520" y="105" text-anchor="middle" font-family="Arial" font-size="10">終了</text>',
		'  <text x="300" y="130" text-anchor="middle" font-family="Arial" font-size="9">💡 完全な図は生成されたHTMLファイルをブラウザで開いてご確認ください</text>',
		'</svg>',
	].join('\n');
};
