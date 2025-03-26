import * as vscode from 'vscode';

export async function insertFence() {
    console.log("method is empty.");
    const msg = vscode.l10n.t("Insert Fence Block");
    console.log("command title:" + msg);

}