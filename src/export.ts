import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import MarkdownIt from "markdown-it";
import fs from 'fs';
import path from 'path';
import fencePlugin from './fencePlugin';

export async function exportDocument(context: vscode.ExtensionContext, format: 'html' | 'pdf') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const md = new MarkdownIt().use(fencePlugin);
    const html = md.render(editor.document.getText());

    if (format === 'html') {
        const fullHtml = `<html>
      <head>
        <style>${fs.readFileSync(path.join(context.extensionPath, 'css', 'fence.css'), 'utf8')}</style>
      </head>
      <body>${html}</body>
    </html>`;

        // 保存 HTML 文件逻辑
    } else if (format === 'pdf') {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({ path: 'output.pdf', format: 'A4' });
        await browser.close();
    }
}