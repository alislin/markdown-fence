import MarkdownIt from 'markdown-it';
import { FenceTag, markString } from './fenceMark';

interface FencePluginOptions {
  fenceStyle?: string;
}

export type { FencePluginOptions };

export default function fencePlugin(md: MarkdownIt, options: FencePluginOptions = {}) {
  const fenceBlockClass = 'fence-block';
  const fenceItemClass = 'fence-item';

  const FENCE_START_MARK = markString(FenceTag.START);
  const FENCE_END_MARK = markString(FenceTag.END);
  const FENCE_SPLIT_MARK = markString(FenceTag.SPLIT);

  md.block.ruler.before('fence', 'custom_fence', (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.slice(start, max);

    // 检测起始标记
    if (content.startsWith(`${FENCE_START_MARK}`)) {
      let currentLine = startLine;
      const items: string[] = [];
      let currentItem: string[] = [];

      // 扫描直到结束标记
      while (currentLine++ < endLine) {
        const lineStart = state.bMarks[currentLine] + state.tShift[currentLine];
        const lineEnd = state.eMarks[currentLine];
        const lineContent = state.src.slice(lineStart, lineEnd);

        if (lineContent.startsWith(`${FENCE_END_MARK}`)) {
          items.push(currentItem.join('\n'));
          break;
        }

        if (lineContent.startsWith(`${FENCE_SPLIT_MARK}`)) {
          items.push(currentItem.join('\n'));
          currentItem = [];
          continue;
        }

        currentItem.push(state.src.slice(state.bMarks[currentLine], state.eMarks[currentLine]));
      }

      // 生成 Token
      const token = state.push('custom_fence', 'div', 0);
      token.attrSet('class', fenceBlockClass);
      token.map = [startLine, currentLine];
      token.content = items.join(`\n${FENCE_SPLIT_MARK}\n`);
      token.block = true;

      state.line = currentLine + 1;
      return true;
    }
    return false;
  });

  md.renderer.rules.custom_fence = (tokens, idx) => {
    const content = tokens[idx].content;
    const items = content.split(`\n${FENCE_SPLIT_MARK}\n`);

    const renderedItems = items.map(item => {
      // 使用 markdown-it 单独解析每个区块
      return `<div class="${fenceItemClass}">${md.render(item.trim())}</div>`;
    }).join('\n');

    return `<div class="${fenceBlockClass}">\n${renderedItems}\n</div>`;
  };
}
