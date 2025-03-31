/*
 * @Author: Lin Ya
 * @Date: 2025-03-31 11:23:58
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-31 18:23:47
 * @Description: 语法代码补全
 */
import * as vscode from 'vscode';
export function fenceSnippetRegist(context: vscode.ExtensionContext) {
    const provider = {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            console.log("+++++");

            // 检测是否在 HTML 注释中键入 fence
            if (!/<!--.*fence.*-->/.test(linePrefix) && linePrefix.includes('<!--')) {
            }
            const fenceStart = new vscode.CompletionItem('fence:start');
            fenceStart.insertText = new vscode.SnippetString('<!-- fence:start -->\n$0\n<!-- fence:end -->');
            fenceStart.documentation = 'Create a fence block container';

            const simpleFence = new vscode.CompletionItem('fence');
            simpleFence.insertText = '<!-- fence -->';
            simpleFence.documentation = 'Insert a single fence split marker';

            const fenceEnd = new vscode.CompletionItem('fence:end');
            fenceEnd.insertText = '<!-- fence:end -->';
            fenceEnd.documentation = 'Insert an end-of-fence marker';

            return [fenceStart, simpleFence, fenceEnd];
        }
    };
    console.log("+++");

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'markdown' }, // 适用于所有文件类型
            provider,
            '/'
        )
    );
}