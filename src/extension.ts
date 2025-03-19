/*
 * @Author: Lin Ya
 * @Date: 2025-02-20 17:17:55
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-19 11:55:35
 * @Description: markdown fence
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
	// const disposable = vscode.workspace.registerTextDocumentContentProvider('markdown', {
	// 	provideTextDocumentContent: (uri: vscode.Uri) => {
	// 		return renderMarkdown(uri.fsPath);
	// 	}
	// });
	// context.subscriptions.push(disposable);

	// 注册代码片段
	const snippetProvider = vscode.languages.registerCompletionItemProvider(
		'markdown',
		{
			provideCompletionItems(document, position) {
				console.log(position);
				
				const fenceStartSnippet = new vscode.CompletionItem('fence:start');
				fenceStartSnippet.insertText = new vscode.SnippetString(
					'<!-- fence:start -->\n$1\n<!-- fence -->\n$2\n<!-- fence:end -->'
				);
				fenceStartSnippet.documentation = 'Create a fence block container';

				const fenceSplitSnippet = new vscode.CompletionItem('fence');
				fenceSplitSnippet.insertText = new vscode.SnippetString('<!-- fence -->');
				fenceSplitSnippet.documentation = 'Add a split point in fence block';

				return [fenceStartSnippet, fenceSplitSnippet];
			}
		},
		// ':' // 触发字符（根据需要调整）
	);

	// const snippetProvider = vscode.languages.registerCompletionItemProvider(
	// 	'markdown',
	// 	{
	// 	  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
	// 		// 获取光标前的文本
	// 		const linePrefix = document.lineAt(position).text.slice(0, position.character);
	// 		console.log(linePrefix);
			
	// 		// 匹配前缀（如 "fence:"）
	// 		if (linePrefix.endsWith('fence:')) {
	// 		  // 计算替换范围（覆盖 "fence:"）
	// 		  const startPos = position.translate(0, -6); // 向前移动6个字符（"fence:"的长度）
	// 		  const range = new vscode.Range(startPos, position);
	
	// 		  // 创建代码片段项
	// 		  const fenceStartSnippet = new vscode.CompletionItem('start');
	// 		  fenceStartSnippet.insertText = new vscode.SnippetString(
	// 			'<!-- fence:start -->\n$1\n<!-- fence -->\n$2\n<!-- fence:end -->'
	// 		  );
	// 		  fenceStartSnippet.range = range; // 设置替换范围
	// 		  fenceStartSnippet.documentation = 'Create a fence block container';
	
	// 		  return [fenceStartSnippet];
	// 		}
	
	// 		// 匹配其他前缀（如 "fence"）
	// 		if (linePrefix.endsWith('fence')) {
	// 		  const fenceSplitSnippet = new vscode.CompletionItem('split');
	// 		  fenceSplitSnippet.insertText = new vscode.SnippetString('<!-- fence -->');
	// 		  fenceSplitSnippet.documentation = 'Add a split point in fence block';
	// 		  return [fenceSplitSnippet];
	// 		}
	
	// 		return null;
	// 	  }
	// 	},
	// 	':'
	//   );

	context.subscriptions.push(snippetProvider);

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
	if (format !== 'html') {
		vscode.window.showErrorMessage('仅支持导出 HTML 格式');
		return;
	}

	// 获取当前活动的文本编辑器
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('没有打开的 Markdown 文档');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('当前文档不是 Markdown 文档');
		return;
	}

	const filePath = editor.document.uri.fsPath;
	const fileName = path.basename(filePath, '.md');
	const htmlPath = path.join(path.dirname(filePath), `${fileName}.html`);

	try {
		// 读取 Markdown 文档内容
		const content = await fs.promises.readFile(filePath, 'utf8');

		// 创建带插件的 MarkdownIt 实例
		const md = new MarkdownIt().use(fencePlugin);

		// 获取样式内容
		const cssPath = path.join(__dirname, '../css/fence.css');
		const styles = await fs.promises.readFile(cssPath, 'utf8');

		// 渲染 Markdown 为 HTML
				const htmlContent = md.render(content);
		
				// 获取 VSCode Markdown 样式
				const markdownStyles: any[] | undefined = vscode.workspace.getConfiguration('markdown').get('styles');
				const markdownStyleLinks = markdownStyles ? markdownStyles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n') : '';
		
				// 构建完整的 HTML 文件
				const fullHtml = `<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<title>${fileName}</title>
					<style>${styles}</style>
					${markdownStyleLinks}
				</head>
				<body>
					${htmlContent}
				</body>
				</html>`;
		
				// 将 HTML 文件写入磁盘
				await fs.promises.writeFile(htmlPath, fullHtml, 'utf8');

		// 显示成功消息
		vscode.window.showInformationMessage(`成功导出 HTML 文件到 ${htmlPath}`);
	} catch (error: any) {
		vscode.window.showErrorMessage(`导出 HTML 文件失败: ${error.message}`);
	}
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
