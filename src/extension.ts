/*
 * @Author: Lin Ya
 * @Date: 2025-02-20 17:17:55
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-31 22:34:01
 * @Description: markdown fence
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import fencePlugin from './fencePlugin';
import { FencePluginOptions } from './fencePlugin';
import { exportDocument } from './exportDocument';
import { insertFence } from './insertFence';
import { fenceSnippetRegist } from './fenceSnippet';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 注册代码片段
	fenceSnippetRegist();

	// return
	// 注册导出命令
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.exportToHTML', async () => {
			await exportDocument('html');
		}),
		vscode.commands.registerCommand('extension.exportToPDF', async () => {
			await exportDocument('pdf');
		}),
		vscode.commands.registerCommand('extension.insertFence', async () => {
			await insertFence();
		})

	);

	// 文档变更监听器
	vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId === 'markdown') {
			updateFenceDiagnostics(event.document);
		}
	});

	// 初始化时检查已打开的文档
	vscode.workspace.textDocuments.forEach(doc => {
		if (doc.languageId === 'markdown') {
			updateFenceDiagnostics(doc);
		}
	});

	function updateFenceDiagnostics(document: vscode.TextDocument) {
		const diagnostics: vscode.Diagnostic[] = [];
		const text = document.getText();

		// 验证 fence 块闭合
		const startMarkers = [...text.matchAll(/<!--\s*fence:start\s*-->/g)];
		const endMarkers = [...text.matchAll(/<!--\s*fence:end\s*-->/g)];

		// 检查数量匹配
		if (startMarkers.length !== endMarkers.length) {
			const lastLine = document.lineAt(document.lineCount - 1);
			const range = new vscode.Range(
				lastLine.range.start,
				lastLine.range.end
			);

			diagnostics.push(new vscode.Diagnostic(
				range,
				vscode.l10n.t('There are unclosed fence blocks (start markers: {0},endmarkers:{1}).', startMarkers.length, endMarkers.length),
				vscode.DiagnosticSeverity.Error
			));
		}

		// 检查嵌套顺序
		let stack: number[] = [];
		const allMarkers = [...text.matchAll(/<!--\s*fence(:start|:end)?\s*-->/g)];

		allMarkers.forEach((match, index) => {
			if (match[0].includes(':start')) {
				stack.push(index);
			} else if (match[0].includes(':end')) {
				if (stack.length === 0) {
					const pos = document.positionAt(match.index!);
					diagnostics.push(new vscode.Diagnostic(
						new vscode.Range(pos, pos),
						vscode.l10n.t('Excess end markers'),
						vscode.DiagnosticSeverity.Error
					));
				} else {
					stack.pop();
				}
			}
		});

		const diagnosticCollection = vscode.languages.createDiagnosticCollection('markdownFence');
		diagnosticCollection.set(document.uri, diagnostics);
		context.subscriptions.push(diagnosticCollection);

	}

	// 增强 Markdown 预览
	return {
		extendMarkdownIt(md: MarkdownIt) {
			const config = vscode.workspace.getConfiguration('markdown-fence');
			const styles = config.get<FencePluginOptions>('styles');

			md.use(fencePlugin, styles);

			return md;
		}
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
