import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';

export async function exportDocument(format: 'html' | 'pdf') {
	if (format === 'pdf') {
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
		const pdfPath = path.join(path.dirname(filePath), `${fileName}.pdf`);

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

			// 匹配所有 img 标签
			const imgTags = [...htmlContent.matchAll(/<img src="(.*?)"/g)];

			// 并行将所有图片转换为 base64 编码
			const base64Images = await Promise.all(
				imgTags.map(async (match) => {
					const src = match[1];
					const base64 = await imageToBase64(path.join(path.dirname(filePath), src));
					return { match: match[0], base64 };
				})
			);

			// 将 base64 编码的图片替换到 HTML 中
			let newHtmlContent = htmlContent;
			base64Images.forEach((item) => {
				newHtmlContent = newHtmlContent.replace(item.match, `<img src="${item.base64}"`);
			});

			// 获取 VSCode Markdown 样式
			const markdownStyles: any[] | undefined = vscode.workspace.getConfiguration('markdown').get('styles');
			const markdownStyleLinks = markdownStyles ? markdownStyles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n') : '';

			// 构建完整的 HTML 文件
			const fullHtml = `<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<title>${fileName}</title>
					<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
					<style>${styles}</style>
					${markdownStyleLinks}
				</head>
				<body>
					${htmlContent}
				</body>
				<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
				<script>hljs.highlightAll();</script>
				</html>`;

			// 使用 Puppeteer 将 HTML 转换为 PDF
			const puppeteer = require('puppeteer');
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setContent(fullHtml);

			// 添加纸张尺寸参数设置
			const paperSize = await vscode.window.showQuickPick(
				['A4', 'Letter', 'Legal'],
				{ placeHolder: '选择纸张尺寸' }
			);

			await page.pdf({ path: pdfPath, format: paperSize || 'A4' });

			await browser.close();

			// 显示成功消息
			vscode.window.showInformationMessage(`成功导出 PDF 文件到 ${pdfPath}`);
		} catch (error: any) {
			vscode.window.showErrorMessage(`导出 PDF 文件失败: ${error.message}`);
		}

		return;
	}

	if (format !== 'html') {
		vscode.window.showErrorMessage('仅支持导出 HTML 和 PDF 格式');
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

async function imageToBase64(imagePath: string): Promise<string> {
	try {
		const data = await fs.promises.readFile(imagePath);
		const base64 = data.toString('base64');
		const mimeType = path.extname(imagePath) === '.png' ? 'image/png' : 'image/jpeg';
		return `data:${mimeType};base64,${base64}`;
	} catch (error: any) {
		vscode.window.showErrorMessage(`Failed to convert image to base64: ${error.message}`);
		return '';
	}
}