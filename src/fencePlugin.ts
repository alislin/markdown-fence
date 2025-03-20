import MarkdownIt from 'markdown-it';

interface FencePluginOptions {
  // 可添加未来需要的配置项
}

export default function fencePlugin(md: MarkdownIt, options: FencePluginOptions = {}) {
  const FENCE_START = 'fence:start';
  const FENCE_END = 'fence:end';
  const FENCE_SPLIT = 'fence';

  md.block.ruler.before('fence', 'custom_fence', (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.slice(start, max);

    // 检测起始标记
    if (content.startsWith(`<!-- ${FENCE_START} -->`)) {
      let currentLine = startLine;
      const items: string[] = [];
      let currentItem: string[] = [];
      let inCodeBlock = false;

      // 扫描直到结束标记
      while (currentLine++ < endLine) {
        const lineStart = state.bMarks[currentLine] + state.tShift[currentLine];
        const lineEnd = state.eMarks[currentLine];
        const lineContent = state.src.slice(lineStart, lineEnd);
        let lineContentWithoutIndent = lineContent.trimStart();
        if (lineContentWithoutIndent.startsWith('```')) {
          // Toggle inCodeBlock flag
          inCodeBlock = !inCodeBlock;
        }

        if (!inCodeBlock) {
          if (lineContent.startsWith(`<!-- ${FENCE_END} -->`)) {
            items.push(currentItem.join('\n'));
            break;
          }

          if (lineContent.startsWith(`<!-- ${FENCE_SPLIT} -->`)) {
            items.push(currentItem.join('\n'));
            currentItem = [];
            continue;
          }
        }

        currentItem.push(lineContent);
      }

      // 生成 Token
      const token = state.push('custom_fence', 'div', 0);
      token.attrSet('class', 'fence-block');
      token.map = [startLine, currentLine];
      token.content = items.join(`\n<!-- ${FENCE_SPLIT} -->\n`);
      token.block = true;

      state.line = currentLine + 1;
      return true;
    }
    return false;
  });

  md.renderer.rules.custom_fence = (tokens, idx) => {
    const content = tokens[idx].content;
    const items = content.split(`\n<!-- ${FENCE_SPLIT} -->\n`);
    
    const renderedItems = items.map(item => {
      // 使用 markdown-it 单独解析每个区块
      return `<div class="fence-item">${md.render(item)}</div>`;
    }).join('\n');

    return `<div class="fence-block">\n${renderedItems}\n</div>`;
  };
}