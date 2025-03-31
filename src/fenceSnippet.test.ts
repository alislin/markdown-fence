import * as assert from 'assert';
import * as vscode from 'vscode';

async function typeText(text: string) {
    await vscode.commands.executeCommand("default:type", {
        text: text
    });
}

suite("type complete", () => {
    // const targetItem = completions.items.find(item => item.label === 'fence:start');
    // assert.strictEqual(
    //     (targetItem?.insertText as vscode.SnippetString)?.value,
    //     '<!-- fence:start -->\n$0\n<!-- fence:end -->'
    // );
});

