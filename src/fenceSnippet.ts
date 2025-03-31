/*
 * @Author: Lin Ya
 * @Date: 2025-03-31 11:23:58
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-31 22:34:13
 * @Description: 语法代码补全
 */
import * as vscode from 'vscode';
export function fenceSnippetRegist() {
    const standard_provider = {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const triggerChars = '\\'; // 触发字符

            // const start = new vscode.Position(position.line, Math.max(0, position.character - 1));
            // const triggerPos = position.translate(0, -1);
            // const replaceRange = new vscode.Range(triggerPos, position);

            const lineText = document.lineAt(position).text;
            if (!lineText.startsWith(triggerChars)) {
                return [];
            }
            // 计算触发字符的起始位置
            const triggerStartPos = position.translate(0, -triggerChars.length);
            const range = new vscode.Range(triggerStartPos, position);

            const fenceStart = createCompletionItem(
                "fence:start",
                "<!-- fence:start -->\n$0\n<!-- fence:end -->",
                "Create a fence block container",
                range);
            const fenceSplit = createCompletionItem(
                "fence",
                "<!-- fence -->",
                "Insert a single fence split marker",
                range);
            const fenceEnd = createCompletionItem(
                "fence:end",
                "<!-- fence:end -->",
                "Insert an end-of-fence marker",
                range);
            const fenceStart_Short = createCompletionItem(
                ">>> (fence:start)",
                "<!-- >>> -->\n$0\n<!-- <<< -->",
                "Create a fence block container",
                range);
            const fenceSpit_Short = createCompletionItem(
                "--- (fence)",
                "<!-- --- -->",
                "Insert a single fence split marker",
                range);
            const fenceEnd_Short = createCompletionItem(
                "<<< (fence:end)",
                "<!-- <<< -->",
                "Insert an end-of-fence marker",
                range);

            const fenceStart_Main = createCompletionItem(
                "/>>> (fence:start)",
                "/>>>",
                "Create a fence block container",
                range);
            const fenceSplit_Main = createCompletionItem(
                "/--- (fence)",
                "/---",
                "Insert a single fence split marker",
                range);
            const fenceEnd_Main = createCompletionItem(
                "/<<< (fence:end)",
                "/<<<",
                "Insert an end-of-fence marker",
                range);


            return [
                fenceStart,
                fenceSplit,
                fenceEnd,
                fenceStart_Short,
                fenceSpit_Short,
                fenceEnd_Short,
                fenceStart_Main,
                fenceSplit_Main,
                fenceEnd_Main,
            ];
        }
    };

    vscode.languages.registerCompletionItemProvider('markdown', standard_provider, '\\');

    function createCompletionItem(key: string, snippet: string, doc: string, range: vscode.Range) {
        const triggerChars = '\\'; // 触发字符
        const fenceStart = new vscode.CompletionItem(triggerChars + key);
        fenceStart.insertText = new vscode.SnippetString(snippet);
        fenceStart.documentation = vscode.l10n.t(doc);
        fenceStart.range = range;
        fenceStart.kind = vscode.CompletionItemKind.Snippet;
        fenceStart.preselect = true;
        return fenceStart;
    }
}