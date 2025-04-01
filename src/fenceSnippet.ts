/*
 * @Author: Lin Ya
 * @Date: 2025-03-31 11:23:58
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-31 22:34:13
 * @Description: 语法代码补全
 */
import * as vscode from 'vscode';
import { fenceMarksByStyleAndPosition, FencePosition, FenceStyle } from './fenceMark';

const { fenceItems, fenceItemsByStyleAndPosition } = initFenceSnippetItems();

const fenceItemsByStyle = groupFenceItemsByStyle();
const regexCache = createRegexCache();


export function fenceSnippetRegist() {
    const standard_provider = {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const triggerChars = '\\'; // 触发字符

            const lineText = document.lineAt(position).text;
            if (!lineText.startsWith(triggerChars)) {
                return [];
            }
            // 计算触发字符的起始位置
            const triggerStartPos = position.translate(0, -triggerChars.length);
            const range = new vscode.Range(triggerStartPos, position);

            const currentStyle = detectCurrentFenceStyle(document, position);
            const filteredItems = currentStyle ?? fenceItems;

            // 创建完成项
            const completionItems = filteredItems.map(item =>
                createCompletionItem(item.label, item.insertText, item.description, range)
            );

            return completionItems;
        }
    };

    vscode.languages.registerCompletionItemProvider('markdown', standard_provider, '\\');

}
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

function detectStyleInText(text: string): { style?: FenceStyle, pos?: FencePosition } {
    const result: { style?: FenceStyle, pos?: FencePosition } = { style: undefined, pos: undefined };
    for (const style in regexCache) {
        const styleRegexes = regexCache[style as FenceStyle];
        if (styleRegexes.start.test(text)) {
            result.style = style as FenceStyle;
            result.pos = "start" as FencePosition;
            return result;
        }
        else if (styleRegexes.split.test(text)) {
            result.style = style as FenceStyle;
            result.pos = "split" as FencePosition;
            return result;
        }
        else if (styleRegexes.end.test(text)) {
            result.style = style as FenceStyle;
            result.pos = "end" as FencePosition;
            return result;
        }


        // if (styleRegexes.start.test(text) ||
        //     styleRegexes.split.test(text) ||
        //     styleRegexes.end.test(text)) {
        //     return style as FenceStyle;
        // }
    }
    return result;
}

function detectCurrentFenceStyle(document: vscode.TextDocument, position: vscode.Position): FenceSnippetDefine[] | undefined {
    // 检查上方内容
    for (let line = position.line - 1; line >= Math.max(0, position.line - 10); line--) {
        const text = document.lineAt(line).text;
        const detectedStyle = detectStyleInText(text);
        // 如果没有标记或者是标记结尾，返回全部样式的开始
        if (!detectedStyle.style || detectedStyle.pos === "end") {
            return [
                fenceItemsByStyleAndPosition.main.start[0],
                fenceItemsByStyleAndPosition.standard.start[0],
                fenceItemsByStyleAndPosition.short.start[0]
            ];
        }
        else {
            // 否则返回对应样式的分隔
            return [fenceItemsByStyleAndPosition[detectedStyle.style].split[0]];
        }
        // if (detectedStyle) return detectedStyle;
    }

    // 检查下方内容
    for (let line = position.line + 1; line < Math.min(document.lineCount, position.line + 10); line++) {
        const text = document.lineAt(line).text;
        const detectedStyle = detectStyleInText(text);
        // 如果没有标记或者是标记开始，返回全部样式的开始
        if (!detectedStyle.style || detectedStyle.pos === "start") {
            return [
                fenceItemsByStyleAndPosition.main.start[0],
                fenceItemsByStyleAndPosition.standard.start[0],
                fenceItemsByStyleAndPosition.short.start[0]
            ];
        }
        else {
            // 否则返回对应样式的开始
            return [fenceItemsByStyleAndPosition[detectedStyle.style].start[0]];
        }
        // if (detectedStyle) return detectedStyle;
    }

    return undefined;
}

// 直接从 fenceMarksByStyleAndPosition 创建正则表达式缓存
function createRegexCache(): Record<FenceStyle, Record<FencePosition, RegExp>> {
    const cache: Partial<Record<FenceStyle, Record<FencePosition, RegExp>>> = {};

    for (const style in fenceMarksByStyleAndPosition) {
        const styleData = fenceMarksByStyleAndPosition[style as FenceStyle];
        cache[style as FenceStyle] = {
            start: new RegExp(styleData.start.markString),
            split: new RegExp(styleData.split.markString),
            end: new RegExp(styleData.end.markString)
        };
    }

    return cache as Record<FenceStyle, Record<FencePosition, RegExp>>;
}


function groupFenceItemsByStyle(): Record<FenceStyle, FenceSnippetDefine[]> {
    const result: Partial<Record<FenceStyle, FenceSnippetDefine[]>> = {};

    for (const item of fenceItems) {
        if (!result[item.style]) {
            result[item.style] = [];
        }
        result[item.style]!.push(item);
    }

    return result as Record<FenceStyle, FenceSnippetDefine[]>;
}


interface FenceSnippetDefine {
    style: FenceStyle;
    position: FencePosition;
    label: string;
    insertText: string;
    description: string;
    matcher?: string;
}

function initFenceSnippetItems() {
    // 组织数据 - 先按样式分组，再按位置分组
    const fenceItems: FenceSnippetDefine[] = [
        // 标准格式
        {
            style: 'standard',
            position: 'start',
            label: "fence:start",
            insertText: "<!-- fence:start -->\n$0\n<!-- fence:end -->",
            description: "Create a fence block container",
            matcher: fenceMarksByStyleAndPosition.standard.start.markString,
        },
        {
            style: 'standard',
            position: 'split',
            label: "fence",
            insertText: "<!-- fence -->",
            description: "Insert a single fence split marker",
            matcher: fenceMarksByStyleAndPosition.standard.split.markString,
        },
        {
            style: 'standard',
            position: 'end',
            label: "fence:end",
            insertText: "<!-- fence:end -->",
            description: "Insert an end-of-fence marker",
            matcher: fenceMarksByStyleAndPosition.standard.end.markString,
        },

        // 短格式
        {
            style: 'short',
            position: 'start',
            label: ">>> short(fence:start)",
            insertText: "<!-- >>> -->\n$0\n<!-- <<< -->",
            description: "Create a fence block container",
            matcher: fenceMarksByStyleAndPosition.short.start.markString,
        },
        {
            style: 'short',
            position: 'split',
            label: "--- short(fence)",
            insertText: "<!-- --- -->",
            description: "Insert a single fence split marker",
            matcher: fenceMarksByStyleAndPosition.short.split.markString,
        },
        {
            style: 'short',
            position: 'end',
            label: "<<< short(fence:end)",
            insertText: "<!-- <<< -->",
            description: "Insert an end-of-fence marker",
            matcher: fenceMarksByStyleAndPosition.short.end.markString,
        },

        // 主格式
        {
            style: 'main',
            position: 'start',
            label: "/>>> main(fence:start)",
            insertText: "/>>>\n$0\n/<<<",
            description: "Create a fence block container",
            matcher: fenceMarksByStyleAndPosition.main.start.markString,
        },
        {
            style: 'main',
            position: 'split',
            label: "/--- main(fence)",
            insertText: "/---",
            description: "Insert a single fence split marker",
            matcher: fenceMarksByStyleAndPosition.main.split.markString,
        },
        {
            style: 'main',
            position: 'end',
            label: "/<<< main(fence:end)",
            insertText: "/<<<",
            description: "Insert an end-of-fence marker",
            matcher: fenceMarksByStyleAndPosition.main.end.markString,
        }
    ];

    // 创建分组数据结构
    const fenceItemsByStyleAndPosition: Record<FenceStyle, Record<FencePosition, FenceSnippetDefine[]>> = {
        standard: { start: [], split: [], end: [] },
        short: { start: [], split: [], end: [] },
        main: { start: [], split: [], end: [] }
    };

    // 填充分组数据
    fenceItems.forEach(item => {
        fenceItemsByStyleAndPosition[item.style][item.position].push(item);
    });
    return { fenceItems, fenceItemsByStyleAndPosition };
}

// // 创建完成项
// const completionItems = fenceItems.map(item =>
//     createCompletionItem(item.label, item.insertText, item.description, range)
// );

// // 使用示例：
// // 获取所有标准格式的开始标签
// const standardStarts = fenceItemsByStyleAndPosition.standard.start;
// // 获取所有短格式的分隔标签
// const shortSplits = fenceItemsByStyleAndPosition.short.split;
// // 获取所有主格式的结束标签
// const mainEnds = fenceItemsByStyleAndPosition.main.end;