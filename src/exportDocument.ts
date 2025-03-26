import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';
import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';

// 类型增强声明
declare global {
	interface Window {
		mermaid?: {
			initialize: (config: object) => void;
			run: (options: {
				querySelector: string;
				suppressErrors?: boolean;
			}) => Promise<void>;
		};
	}
}
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
			const pageNumber = `<span class="pageNumber"></span>`;
			const totalPages = `<span class="totalPages"></span>`;
			const title = render.fileName;
			const keyList = { title, pageNumber, totalPages };

			const config = vscode.workspace.getConfiguration('markdown-fence');
			const exportData = config.get<ExportOptions>('export');

			const pdfPath = path.join(path.dirname(filePath), `${fileName}.pdf`);
			// 使用 Puppeteer 将 HTML 转换为 PDF
			const puppeteer = require('puppeteer');
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setContent(html);
			
			// const log = (x: any) => console.log(x);
			// await handleMermaidRendering(page, log);

			const paperSize = exportData?.size;
			const margin = exportData?.margin;
			let header = exportData?.header;
			let footer = exportData?.footer;

			header = replaceKeyValue(header, keyList);
			footer = replaceKeyValue(footer, keyList);
			const styleBlock = `width: 100%;font-size: 15rem;display:flex;justify-content: space-between;align-items: center;margin:0mm ${margin?.left || "5mm"}`;
			const headerBlock = `<div class="pdf-header" style="${styleBlock}">${header}</div>`;
			const footerBlock = `<div style="${styleBlock}">${footer}</div>`;

			await page.pdf({
				path: pdfPath,
				format: paperSize || 'A4',
				margin: { top: margin?.top || '10mm', right: margin?.right || '5mm', bottom: margin?.bottom || '10mm', left: margin?.left || '5mm' },
				headerTemplate: headerBlock,
				footerTemplate: footerBlock,
				displayHeaderFooter: header !== undefined || footer !== undefined,
				printBackground: true, // 启用背景打印，以便 CSS 样式生效
			});

			await browser.close();

			// 显示成功消息
			vscode.window.showInformationMessage(vscode.l10n.t(`Successfully exported PDF file to {0}`, pdfPath));
		} catch (error: any) {
			vscode.window.showErrorMessage(vscode.l10n.t(`Failed to export PDF file: {0}`, error.message));
		}

		return;
	}

	else if (format === "html") {
		try {
			const htmlPath = path.join(path.dirname(filePath), `${fileName}.html`);
			// 将 HTML 文件写入磁盘
			await fs.promises.writeFile(htmlPath, html, 'utf8');
			// 显示成功消息
			vscode.window.showInformationMessage(vscode.l10n.t(`Successfully exported HTML file to {0}`, htmlPath));

		} catch (error: any) {
			vscode.window.showErrorMessage(vscode.l10n.t(`Failed to export HTML file: {0}`, error.message));
		}
	}

	else {
		vscode.window.showErrorMessage(vscode.l10n.t('Only HTML and PDF formats are supported'));
		return;
	}
}


async function handleMermaidRendering(page: Page, log: any): Promise<void> {
	try {
		// 显式执行 Mermaid 渲染
		await page.evaluate(async () => {
			// log("1+++");
			// const document = window.document;

			try {
				// 等待 Mermaid 模块加载完成
				// @ts-ignore - 自定义元素类型检测
				await customElements.whenDefined('mermaid-js');

				// 类型安全的渲染检查
				const hasRendered = await new Promise<boolean>((resolve) => {
					const checkRender = () => {
						const elements = document.querySelectorAll('.language-mermaid');
						const allRendered = elements.length === 0 ||
							Array.from(elements).every(el => el.querySelector('svg'));

						if (allRendered) {
							resolve(true);
						} else {
							setTimeout(checkRender, 100);
						}
					};
					checkRender();
				});

				if (!hasRendered) {
					// 手动触发渲染
					// @ts-ignore - Mermaid 类型声明
					await window.mermaid?.run({
						querySelector: '.language-mermaid',
						suppressErrors: true
					});
				}
			} catch (e) {
				console.error(vscode.l10n.t('Mermaid rendering error:'), e);
			}
		});

		// 双重验证渲染结果
		await page.waitForFunction(() => {
			// const document = window.document;
			const elements = document.querySelectorAll('.language-mermaid');
			return elements.length === 0 ||
				Array.from(elements).every(el => {
					const svg = el.querySelector('svg');
					return svg && svg.childNodes.length > 0;
				});
		}, {
			timeout: 5000,
			polling: 200
		});

	} catch (error) {
		console.error(vscode.l10n.t('Error occurred while processing Mermaid:'), error);
		throw error;
	}
}

function replaceKeyValue(text: string | undefined, keyList: { [key: string]: string; }): string | undefined {
	if (!text) {
		return undefined;
	}

	Object.keys(keyList).forEach(key => {
		const keyword = `{${key}}`;
		text = text!.replace(new RegExp(keyword, 'g'), keyList[key]);
	});

	return text;
}

async function imageToBase64(imagePath: string, filePath: string): Promise<string> {
	try {
		// const data = await fs.promises.readFile(decodeURIComponent(encodedImagePath));
		const data = await loadImageFile(imagePath, filePath);
		const ext = path.extname(imagePath).toLowerCase();

		if (ext === '.svg') {
			const decoder = new TextDecoder('utf-8');
			return decoder.decode(data);
			// return data.toString('utf8'); // 直接读取 SVG 文件内容
		} else {
			const base64 = Buffer.from(data).toString("base64");
			// const base64 = data.toString('base64');
			const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
			return `data:${mimeType};base64,${base64}`;
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(vscode.l10n.t(`Failed to convert image to base64: {0}`, error.message));
		return '';
	}
}

async function loadImageFile(imagePath: string, filePath: string) {
	const fetch = await import('node-fetch').then(m => m.default);
	// 检测 encodedImagePath 是否网络文件，如果是网络文件使用node-fetch下载
	const decodedImagePath = decodeURIComponent(imagePath);
	if (decodedImagePath.startsWith('http://') || decodedImagePath.startsWith('https://')) {
		const response = await fetch(imagePath);
		const buffer = await response.arrayBuffer();
		return buffer;
	} else {
		let src = path.join(path.dirname(filePath), imagePath);
		const decodedImagePath = decodeURIComponent(src);
		return await fs.promises.readFile(decodedImagePath);
	}
}

async function markdownRender() {
	// 获取当前活动的文本编辑器
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage(vscode.l10n.t('No Markdown document is open'));
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage(vscode.l10n.t('The current document is not a Markdown document'));
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
				const ext = path.extname(decodeURIComponent(src)).toLowerCase();
				let replacement = '';

				if (ext === '.svg') {
					// 直接读取 SVG 文件内容
					replacement = await imageToBase64(src, filePath);
					return { match: match[0], replacement };
				} else {
					const base64 = await imageToBase64(src, filePath);
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
	<script type="module">
	import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
	  mermaid.initialize({
	    startOnLoad: false,
	    theme: document.body.classList.contains('vscode-dark') || document.body.classList.contains('vscode-high-contrast')
	        ? 'dark'
	        : 'default'
	  });
	  await mermaid.run({
  querySelector: '.language-mermaid',
});
	</script>
</html>`;
		return {
			fileName: fileName,
			filePath: filePath,
			html: fullHtml
		};
	}
	catch (error: any) {
		vscode.window.showErrorMessage(vscode.l10n.t(`Document generation failed: {0}`, error.message));
	}
}