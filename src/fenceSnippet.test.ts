/*
 * @Author: Lin Ya
 * @Date: 2025-03-31 16:21:14
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-04-01 08:03:29
 * @Description: file content
 */
import * as assert from 'assert';
import * as vscode from 'vscode';

async function typeText(text: string) {
    await vscode.commands.executeCommand("default:type", {
        text: text
    });
}

suite("type complete", () => {
    let doc: vscode.TextDocument;
    let position: vscode.Position;



    test("fence:start", async () => {
        const inputStr = "test\n\n";
        const { doc } = await initDoc(inputStr);
        const position = new vscode.Position(3, 1);
        await typeText("\\");

        const completionList = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            doc.uri,
            position
        );
        // console.log("+++++++++++++", doc, position, completionList.items);
        const targetItem = completionList.items.find(item => item.label === '\\fence:start');
        // assert.strictEqual(
        //     (targetItem?.insertText as vscode.SnippetString)?.value,
        //     '<!-- fence:start -->\n$0\n<!-- fence:end -->'
        // );
    });

});


async function initDoc(content: string) {
    const doc = await vscode.workspace.openTextDocument({
        content: content,
        language: 'markdown'
    });
    // const position = new vscode.Position(0, content.length + 1);

    return { doc };
}
