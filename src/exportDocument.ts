import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import * as path from 'path';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';
import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import yamlFrontMatterPlugin from './yamlPlugin';

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
	html?: boolean;
	customCSS?: string;
	cssFiles?: string[];
	autoRotate?: boolean;
}

/**
 * 提取文档中的YAML frontmatter
 */
function extractFrontmatter(content: string): Record<string, any> {
	// 提取YAML frontmatter
	const yamlLines = content.split('\n');
	let yamlEndIndex = -1;
	const yamlLines_content: string[] = [];

	// 检查是否以YAML分隔符开始
	if (yamlLines.length >= 2 && yamlLines[0].trim() === '---') {
		for (let i = 1; i < yamlLines.length; i++) {
			if (yamlLines[i].trim() === '---') {
				yamlEndIndex = i;
				break;
			}
			yamlLines_content.push(yamlLines[i]);
		}
	}

	if (yamlEndIndex !== -1) {
		const yamlContent = yamlLines_content.join('\n');
		try {
			const { SimpleYAMLParser } = require('./utils/YamlParser');
			return SimpleYAMLParser.parse(yamlContent);
		} catch (error) {
			console.warn('Failed to parse YAML frontmatter:', error);
		}
	}

	return {};
}

export async function exportDocument(format: 'html' | 'pdf') {
	const config = vscode.workspace.getConfiguration('markdown-fence');
	const exportData = config.get<ExportOptions>('export');

	// 先读取文档内容并提取frontmatter
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

	// 读取内容并提取frontmatter
	const content = await fs.promises.readFile(filePath, 'utf8');
	const frontmatter = extractFrontmatter(content);

	// 合并配置：优先使用YAML中的设置，其次使用VS Code设置
	const yamlExportData = frontmatter || {};
	const finalExportData = {
		...exportData,
		...yamlExportData,
		// 如果YAML中定义了html，则覆盖VS Code设置
		html: yamlExportData.html !== undefined ? yamlExportData.html : exportData?.html,
		margin: {
			...exportData?.margin,
			...yamlExportData?.margin,
		},
		header: yamlExportData.header !== undefined ? yamlExportData.header : exportData?.header,
		footer: yamlExportData.footer !== undefined ? yamlExportData.footer : exportData?.footer,
		size: yamlExportData.size !== undefined ? yamlExportData.size : exportData?.size,
		customCSS: yamlExportData.customCSS !== undefined ? yamlExportData.customCSS : exportData?.customCSS,
		cssFiles: yamlExportData.cssFiles !== undefined ? yamlExportData.cssFiles : exportData?.cssFiles,
		autoRotate: yamlExportData.autoRotate !== undefined ? yamlExportData.autoRotate : exportData?.autoRotate,
	};

	// 现在传递合并后的配置给markdownRender
	const render = await markdownRender({ html: finalExportData?.html });
	if (!render || !render.html) {
		return;
	}
	const { html } = render;

	if (format === 'pdf') {
		try {
			// 加载额外CSS文件
			const additionalCss = await loadCssFiles(finalExportData.cssFiles || [], filePath);

			// 合并所有CSS
			const allStyles = [
				render.css,
				finalExportData.customCSS || '',
				additionalCss
			].filter(Boolean).join('\n');

			// 重新构建HTML，嵌入自定义CSS
			const finalHtml = html.replace(
				/<style>.*?<\/style>/s,
				`<style>${allStyles}</style>`
			);

			const pageNumber = `<span class="pageNumber"></span>`;
			const totalPages = `<span class="totalPages"></span>`;
			const title = render.fileName;
			const keyList = { title, pageNumber, totalPages };


			const pdfPath = path.join(path.dirname(filePath), `${fileName}.pdf`);
			// 使用 Puppeteer 将 HTML 转换为 PDF
			const puppeteer = require('puppeteer');
			const browser = await puppeteer.launch({
				headless: "new", // 使用新的 Headless 模式
				args: ['--no-sandbox', '--disable-setuid-sandbox'] // 解决 Linux 下的权限问题
			});
			const page = await browser.newPage();
			await page.setContent(finalHtml);

			const log = (x: any) => console.log(x);
			await handleMermaidRendering(page, log);

			// 获取导出配置参数
			const paperSize = finalExportData?.size;
			const margin = finalExportData?.margin;
			const autoRotate = finalExportData?.autoRotate !== false; // 默认启用
			let header = finalExportData?.header;
			let footer = finalExportData?.footer;

			// 调整图片尺寸以适应PDF页面
			await resizeImagesForPDF(page, header !== undefined || footer !== undefined, footer !== undefined, margin, autoRotate);

			// 添加额外的等待时间确保所有内容加载完成
			await page.waitForNetworkIdle({ idleTime: 500 });

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
			// 加载额外CSS文件
			const additionalCss = await loadCssFiles(finalExportData.cssFiles || [], filePath);

			// 合并所有CSS
			const allStyles = [
				render.css,
				finalExportData.customCSS || '',
				additionalCss
			].filter(Boolean).join('\n');

			// 重新构建HTML，嵌入自定义CSS
			const finalHtml = html.replace(
				/<style>.*?<\/style>/s,
				`<style>${allStyles}</style>`
			);

			const htmlPath = path.join(path.dirname(filePath), `${fileName}.html`);
			// 将 HTML 文件写入磁盘
			await fs.promises.writeFile(htmlPath, finalHtml, 'utf8');
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
		// 等待 Mermaid 脚本加载完成
		await page.waitForFunction(() => typeof window.mermaid !== 'undefined', {
			timeout: 10000
		});

		// 执行 Mermaid 渲染
		await page.evaluate(async () => {
			try {
				// 确保 Mermaid 已初始化
				if (window.mermaid) {
					await window.mermaid.run({
						querySelector: '.language-mermaid',
						suppressErrors: true
					});
				}
			} catch (e) {
				console.error('Mermaid rendering error:', e);
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

async function resizeImagesForPDF(
	page: Page,
	hasHeader: boolean,
	hasFooter: boolean,
	margin?: ExportOptions['margin'],
	autoRotate: boolean = true
): Promise<void> {
	try {
		// 等待图片加载完成
		await page.waitForSelector('img', { timeout: 10000 }).catch(() => {
			// 如果没有图片，直接返回
			return;
		});

		// 额外等待确保所有图片完全加载
		await new Promise(resolve => setTimeout(resolve, 1000));

		await page.evaluate(async (marginData) => {
			// 获取所有图片元素
			const images = document.querySelectorAll('img');

			if (images.length === 0) {
				return;
			}

			// 转换页边距值为数值（px）
			const parseMargin = (marginStr?: string): number => {
				if (!marginStr) {
					return 0;
				}
				const match = marginStr.match(/([\d.]+)\s*(mm|px|cm|in)?/);
				if (!match) {
					return 0;
				}
				const value = parseFloat(match[1]);
				const unit = match[2] || 'px';

				// 转换不同单位为px（假设96 DPI）
				switch (unit) {
					case 'mm': return value * 3.779527559;
					case 'cm': return value * 37.79527559;
					case 'in': return value * 96;
					default: return value;
				}
			};

			const leftMargin = parseMargin(marginData?.left);
			const rightMargin = parseMargin(marginData?.right);
			const topMargin = parseMargin(marginData?.top);
			const bottomMargin = parseMargin(marginData?.bottom);
			// 如果用户未设置边距（undefined），使用默认值；如果设置为0mm，使用0
			const effectiveLeftMargin = marginData?.left !== undefined ? leftMargin : parseMargin('10mm');
			const effectiveRightMargin = marginData?.right !== undefined ? rightMargin : parseMargin('10mm');
			const effectiveTopMargin = marginData?.top !== undefined ? topMargin : parseMargin('10mm');
			const effectiveBottomMargin = marginData?.bottom !== undefined ? bottomMargin : parseMargin('10mm');

			// 获取 body 的实际尺寸
			const bodyElement = document.body;
			const bodyStyle = window.getComputedStyle(bodyElement);
			const bodyWidth = bodyElement.clientWidth || parseFloat(bodyStyle.width) || window.innerWidth;
			const bodyHeight = bodyElement.clientHeight || parseFloat(bodyStyle.height) || window.innerHeight;
			const pageWidth = bodyWidth - effectiveLeftMargin - effectiveRightMargin;
			const pageHeight = bodyHeight - effectiveTopMargin - effectiveBottomMargin;

			const availableWidth = pageWidth * 0.9;
			const availableHeight = pageHeight * 0.9;

			// 遍历所有图片
			images.forEach((img) => {
				const image = img as HTMLImageElement;

				// 跳过隐藏的图片
				if (image.offsetWidth === 0 || image.offsetHeight === 0) {
					return;
				}

				// 检查图片是否完全加载
				if (!image.complete || image.naturalWidth === 0) {
					return;
				}

				// 获取原始尺寸
				const naturalWidth = image.naturalWidth;
				const naturalHeight = image.naturalHeight;

				// 判断图片方向（横向：宽>高，竖向：高>宽）
				const isImageLandscape = naturalWidth > naturalHeight;
				const isPageLandscape = availableWidth > availableHeight;

				// 计算页面面积
				const pageArea = availableWidth * availableHeight;

				let shouldRotate = false;
				let finalWidth: number;
				let finalHeight: number;

				// 如果图片方向与页面方向不匹配，且启用了自动旋转，评估旋转的效益
				if (isImageLandscape !== isPageLandscape && autoRotate) {
					// 计算旋转后的尺寸
					const rotatedWidth = naturalHeight;
					const rotatedHeight = naturalWidth;

					// 计算两种方式下的缩放比例和实际显示面积
					// 方式1：不旋转
					const noRotateWidthScale = availableWidth / naturalWidth;
					const noRotateHeightScale = availableHeight / naturalHeight;
					const noRotateScale = Math.min(noRotateWidthScale, noRotateHeightScale);
					const noRotateDisplayArea = (naturalWidth * noRotateScale) * (naturalHeight * noRotateScale);

					// 方式2：旋转
					const rotateWidthScale = availableWidth / rotatedWidth;
					const rotateHeightScale = availableHeight / rotatedHeight;
					const rotateScale = Math.min(rotateWidthScale, rotateHeightScale);
					const rotateDisplayArea = (rotatedWidth * rotateScale) * (rotatedHeight * rotateScale);

					// 计算面积利用率（实际显示面积 / 页面面积）
					const noRotateAreaRatio = noRotateDisplayArea / pageArea;
					const rotateAreaRatio = rotateDisplayArea / pageArea;

					// 只有当旋转后的面积利用率比不旋转高至少5%时，才进行旋转
					const improvementThreshold = 0.05;
					if (rotateAreaRatio > noRotateAreaRatio * (1 + improvementThreshold) && rotateAreaRatio > 0.7) {
						shouldRotate = true;
						finalWidth = rotatedWidth;
						finalHeight = rotatedHeight;
					} else {
						finalWidth = naturalWidth;
						finalHeight = naturalHeight;
					}
				} else {
					// 方向匹配，无需旋转
					finalWidth = naturalWidth;
					finalHeight = naturalHeight;
				}

				// 如果需要旋转，添加旋转样式
				if (shouldRotate) {
					image.style.transform = 'rotate(-90deg)';
					image.style.transformOrigin = 'center center';
					image.style.display = 'block';
					image.style.margin = '0 auto';
				}

				// 计算缩放比例
				const widthScale = availableWidth / finalWidth;
				const heightScale = availableHeight / finalHeight;

				// 如果图片超出宽度或高度，需要缩放
				if (widthScale < 1 || heightScale < 1) {
					let newWidth: number;
					let scale: number;

					// 计算图片宽高比和页面宽高比
					const imageAspectRatio = finalWidth / finalHeight;
					const pageAspectRatio = availableWidth / availableHeight;

					// 检查图片比例与页面比例的接近程度（差异小于15%）
					const aspectRatioDiff = Math.abs(imageAspectRatio - pageAspectRatio) / pageAspectRatio;

					if (aspectRatioDiff < 0.15) {
						// 图片比例接近页面比例，优先使用高度缩放以填满页面
						scale = heightScale;
						newWidth = finalWidth * scale;

						// 添加分页标记
						image.style.breakAfter = 'page';
						image.style.breakInside = 'avoid';
					} else {
						// 使用较小的缩放比例，确保图片完全适应页面
						scale = Math.min(widthScale, heightScale);
						newWidth = finalWidth * scale;
					}

					// 应用缩放样式
					image.style.maxWidth = newWidth + 'px';
					image.style.height = 'auto';
					image.style.width = newWidth + 'px';
				}
			});
		}, margin);

	} catch (error) {
		console.error('Error resizing images for PDF:', error);
		// 不抛出错误，避免中断 PDF 生成流程
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
			// 使用base64编码
			const base64 = Buffer.from(data).toString("base64");
			const mimeType = 'image/svg+xml';
			return `data:${mimeType};base64,${base64}`;

			// 使用svg源代码
			// const decoder = new TextDecoder('utf-8');
			// return decoder.decode(data);
		} else {
			const base64 = Buffer.from(data).toString("base64");
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

/**
 * 加载CSS文件内容，支持相对路径和URL
 */
async function loadCssFiles(cssFiles: string[], filePath: string): Promise<string> {
	if (!cssFiles || cssFiles.length === 0) {
		return '';
	}

	const fetch = await import('node-fetch').then(m => m.default);

	const cssContents = await Promise.all(
		cssFiles.map(async (cssFile) => {
			try {
				if (cssFile.startsWith('http://') || cssFile.startsWith('https://')) {
					// 从URL加载
					const response = await fetch(cssFile);
					if (response.ok) {
						return await response.text();
					} else {
						console.warn(vscode.l10n.t('Failed to load CSS from URL: {0}', cssFile));
						return '';
					}
				} else {
					// 从相对路径加载
					const absolutePath = path.isAbsolute(cssFile)
						? cssFile
						: path.join(path.dirname(filePath), cssFile);
					return await fs.promises.readFile(absolutePath, 'utf8');
				}
			} catch (error: any) {
				console.warn(vscode.l10n.t('Failed to load CSS file: {0}, error: {1}', cssFile, error.message));
				return '';
			}
		})
	);

	return cssContents.join('\n');
}

async function markdownRender(options?: MarkdownIt.Options) {
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
		const md = new MarkdownIt(options ?? {}).use(yamlFrontMatterPlugin, { remove: true }).use(fencePlugin);

		// 创建环境对象来存储frontmatter
		const env: any = {};

		// 渲染 Markdown 为 HTML
		let htmlContent = md.render(content, env);

		// Remove pre tag styles for mermaid code blocks
		htmlContent = htmlContent.replace(/<pre><code class="language-mermaid">/g, '<pre class="no-style"><code class="language-mermaid">');

		// 匹配所有 img 标签
		const imgTags = [...htmlContent.matchAll(/<img src="(.*?)"(.*?>)/g)];

		// 并行将所有图片转换为 base64 编码
		const base64Images = await Promise.all(
			imgTags.map(async (match) => {
				const src = match[1];
				const ext = path.extname(decodeURIComponent(src)).toLowerCase();
				let replacement = '';

				if (false && ext === '.svg') {
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

		// 获取样式内容
		const cssPath = path.join(__dirname, '../css/fence.css');
		const defaultStyles = await fs.promises.readFile(cssPath, 'utf8');

		// 构建完整的 HTML 文件
		const fullHtml = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>${fileName}</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
	<style>${defaultStyles}</style>
	${markdownStyleLinks}
</head>
<body>
	${newHtmlContent}
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>hljs.highlightAll();</script>
	<script type="module">
	import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
	window.mermaid = mermaid;
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
			html: fullHtml,
			frontmatter: env.frontmatter,
			css: defaultStyles
		};
	}
	catch (error: any) {
		vscode.window.showErrorMessage(vscode.l10n.t(`Document generation failed: {0}`, error.message));
	}
}
