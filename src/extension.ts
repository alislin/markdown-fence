/*
 * @Author: Lin Ya
 * @Date: 2025-02-20 17:17:55
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-02-21 09:37:49
 * @Description: markdown split
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import fencePlugin from './fencePlugin';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 注册预览处理器
	// const disposable = vscode.workspace.registerTextDocumentContentProvider('markdown-fence', {
	// 	provideTextDocumentContent: (uri: vscode.Uri) => {
	// 		return renderMarkdown(uri.fsPath);
	// 	}
	// });

	// return
	// 注册导出命令
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.exportToHTML', async () => {
			await exportDocument('html');
		}),
		vscode.commands.registerCommand('extension.exportToPDF', async () => {
			await exportDocument('pdf');
		})
	);

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('markdownFence');
	context.subscriptions.push(diagnosticCollection);

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
				`存在未闭合的 fence 块 (开始标记: ${startMarkers.length}, 结束标记: ${endMarkers.length})`,
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
						'多余的结束标记',
						vscode.DiagnosticSeverity.Error
					));
				} else {
					stack.pop();
				}
			}
		});

		diagnosticCollection.set(document.uri, diagnostics);
	}

	// 增强 Markdown 预览
	return {
		extendMarkdownIt(md: MarkdownIt) {
			md.use(fencePlugin);
			return md;
		}
	};
}

async function exportDocument(format: 'html' | 'pdf') {
	// 实现导出逻辑
	console.log(`export ${format}`);
	
}

async function renderMarkdown(filePath: string): Promise<string> {
	try {
		// 读取原始 Markdown 内容
		const content = await fs.promises.readFile(filePath, 'utf8');

		// 创建带插件的 MarkdownIt 实例
		const md = new MarkdownIt().use(fencePlugin);

		// 获取样式内容
		// const cssPath = path.join(context.extensionPath, 'css', 'fence.css');
		const cssPath = path.join(__dirname, '../css/fence.css');
		const styles = await fs.promises.readFile(cssPath, 'utf8');
		console.log("css:", cssPath, styles);

		// 生成完整 HTML
		return `<!DOCTYPE html>
  <html>
  <head>
  	<base href="${vscode.Uri.file(path.dirname(filePath)).with({ scheme: 'vscode-resource' })}/">
	<style>${styles}</style>
  </head>
  <body>
	${md.render(content)}
  </body>
  </html>`;
	} catch (error) {
		console.error('样式加载失败:', error);
		// return `<!-- 样式加载失败 -->${md.render(content)}`;
		return `Error rendering markdown: ${error}`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
