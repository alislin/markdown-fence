import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';

interface ExportOptions {
	size?: string;
	margin?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	},
	header?: string;
	footer?: string;
}

export async function exportDocument(format: 'html' | 'pdf') {
	const render = await markdownRender();
	if (!render || !render.html) {
		return;
	}
	const { fileName, filePath, html } = render;

	if (format === 'pdf') {
		try {
			const config = vscode.workspace.getConfiguration('markdown-fence');
			const exportData = config.get<ExportOptions>('export');

			const pdfPath = path.join(path.dirname(filePath), `${fileName}.pdf`);
			// 使用 Puppeteer 将 HTML 转换为 PDF
			const puppeteer = require('puppeteer');
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setContent(html);

			// 添加纸张尺寸参数设置
			// const paperSize = await vscode.window.showQuickPick(
			// 	['A4', 'Letter', 'Legal'],
			// 	{ placeHolder: '选择纸张尺寸' }
			// );
			const paperSize = exportData?.size;
			const margin = exportData?.margin;

			await page.pdf({ path: pdfPath, format: paperSize || 'A4', margin: { top: margin?.top || '10mm', right: margin?.right || '5mm', bottom: margin?.bottom || '10mm', left: margin?.left || '5mm' } });

			await browser.close();

			// 显示成功消息
			vscode.window.showInformationMessage(`成功导出 PDF 文件到 ${pdfPath}`);
		} catch (error: any) {
			vscode.window.showErrorMessage(`导出 PDF 文件失败: ${error.message}`);
		}

		return;
	}

	else if (format === "html") {
		try {
			const htmlPath = path.join(path.dirname(filePath), `${fileName}.html`);
			// 将 HTML 文件写入磁盘
			await fs.promises.writeFile(htmlPath, html, 'utf8');
			// 显示成功消息
			vscode.window.showInformationMessage(`成功导出 HTML 文件到 ${htmlPath}`);

		} catch (error: any) {
			vscode.window.showErrorMessage(`导出 HTML 文件失败: ${error.message}`);
		}
	}

	else {
		vscode.window.showErrorMessage('仅支持导出 HTML 和 PDF 格式');
		return;
	}
}

async function imageToBase64(imagePath: string): Promise<string> {
	try {
		const encodedImagePath = encodeURIComponent(imagePath);
		const data = await fs.promises.readFile(decodeURIComponent(encodedImagePath));
		const ext = path.extname(imagePath).toLowerCase();

		if (ext === '.svg') {
			return data.toString('utf8'); // 直接读取 SVG 文件内容
		} else {
			const base64 = data.toString('base64');
			const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
			return `data:${mimeType};base64,${base64}`;
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Failed to convert image to base64: ${error.message}`);
		return '';
	}
}

async function markdownRender() {
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
		const imgTags = [...htmlContent.matchAll(/<img src="(.*?)"(.*?>)/g)];

		// 并行将所有图片转换为 base64 编码
		const base64Images = await Promise.all(
			imgTags.map(async (match) => {
				const src = match[1];
				let imagePath = path.join(path.dirname(filePath), src);
				imagePath = decodeURIComponent(imagePath);
				const ext = path.extname(decodeURIComponent(imagePath)).toLowerCase();
				let replacement = '';

				if (ext === '.svg') {
					// 直接读取 SVG 文件内容
					replacement = await imageToBase64(imagePath);
					return { match: match[0], replacement };
				} else {
					const base64 = await imageToBase64(imagePath);
					replacement = `<img src="${base64}"${match[2]}`;
					return { match: match[0], replacement };
				}
			})
		);

		// 将图片替换到 HTML 中
		let newHtmlContent = htmlContent;
		base64Images.forEach((item) => {
			newHtmlContent = newHtmlContent.replace(item.match, item.replacement);
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
						${newHtmlContent}
					</body>
					<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
					<script>hljs.highlightAll();</script>
					</html>`;
		return {
			fileName: fileName,
			filePath: filePath,
			html: fullHtml
		};
	}
	catch (error: any) {
		vscode.window.showErrorMessage(`文档生成失败: ${error.message}`);
	}
}