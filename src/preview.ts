import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function injectStyles(context: vscode.ExtensionContext) {
    return (document: vscode.TextDocument, webview: vscode.Webview) => {
        const stylesPath = path.join(context.extensionPath, 'css', 'fence.css');
        const styles = fs.readFileSync(stylesPath, 'utf8');

        return `<!DOCTYPE html>
      <html>
        <head>
          <style>${styles}</style>
        </head>
        <body>
          ${document.getText()}
        </body>
      </html>`;
    };
}