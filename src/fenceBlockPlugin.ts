import MarkdownIt, { StateBlock } from 'markdown-it';

export default function fenceBlockPlugin(md: MarkdownIt): void {
    md.block.ruler.before('fence', 'fence_block', (state, startLine, endLine, silent) => {
        let marker, token, content, i, l, lines, line;

        marker = state.bMarks[startLine] + state.tShift[startLine];
        if (marker !== 0x3A /* : */) { return false; }

        // We definitely have an indented line here
        // We scan the next few lines looking for a matching marker
        // That signifies the end of the code block
        lines = endLine - startLine;

        if (state.eMarks[startLine] < marker) { return false; }
        if (silent) { return true; }

        // Search the end of the block
        for (i = 1; i <= lines; i++) {
            if (state.sCount[startLine + i] < 4 && state.bMarks[startLine + i] + state.tShift[startLine + i] >= marker) {
                // This line is outside the block
                break;
            }
        }

        endLine = startLine + i;

        content = state.getLines(startLine + 1, endLine, state.tShift[startLine], true);

        // Now we know where the block ends, we can parse it
        token = state.push('fence_block_open', 'div', 1);
        token.markup = '::';
        token.block = true;
        token.attrSet('class', 'fence-block');

        // Parse the content of the block
        const contentLines = content.split('\n');
        let itemContent = '';
        let inItem = false;

        for (const line of contentLines) {
            if (line.startsWith('## ')) {
                if (inItem) {
                    pushFenceItemToken(state, itemContent);
                    itemContent = '';
                }
                inItem = true;
            } else if (line === '横向分隔') {
                if (inItem) {
                    pushFenceItemToken(state, itemContent);
                    itemContent = '';
                }
                state.push('fence_separator', 'hr', 0);
                continue;
            }

            if (inItem) {
                itemContent += line + '\n';
            }
        }

        if (inItem) {
            pushFenceItemToken(state, itemContent);
        }

        token = state.push('fence_block_close', 'div', -1);
        token.markup = '::';
        token.block = true;

        state.line = endLine;
        return true;
    });

    function pushFenceItemToken(state: StateBlock, content: string) {
        const token = state.push('fence_item', 'div', 0);
        token.attrSet('class', 'fence-item');
        token.content = content.trim();
    }

    md.renderer.rules.fence_block_open = (tokens, idx) => {
        return `<div class="${tokens[idx].attrGet('class')}">`;
    };

    md.renderer.rules.fence_block_close = () => {
        return '</div>';
    };

    md.renderer.rules.fence_item = (tokens, idx) => {
        return `<div class="${tokens[idx].attrGet('class')}">${tokens[idx].content}</div>`;
    };

    md.renderer.rules.fence_separator = () => {
        return '<hr>';
    };
}