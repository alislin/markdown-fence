/*
 * @Author: Lin Ya
 * @Date: 2025-03-19 21:38:00
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-22 23:43:19
 * @Description: fence 实现
 */
import MarkdownIt from 'markdown-it';
import { FenceMarks, MarkDefine } from './fenceMark';

interface FencePluginOptions {
  fenceStyle?: string;
}

export type { FencePluginOptions };

export default function fencePlugin(md: MarkdownIt, options: FencePluginOptions = {}) {

  md.block.ruler.before('fence', 'custom_fence', (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.slice(start, max);

    // 检测起始标记
    let currentLine = startLine;
    let fenceType: MarkDefine | null = null;

    for (const mark of FenceMarks) {
      if (content.startsWith(mark.START)) {
        fenceType = mark;
        break;
      }
    }

    if (fenceType) {
      const items: string[] = [];
      let currentItem: string[] = [];

      // 扫描直到结束标记
      while (currentLine++ < endLine) {
        const lineStart = state.bMarks[currentLine] + state.tShift[currentLine];
        const lineEnd = state.eMarks[currentLine];
        const lineContent = state.src.slice(lineStart, lineEnd);

        if (lineContent.startsWith(fenceType.END)) {
          items.push(currentItem.join('\n'));
          break;
        }

        if (lineContent.startsWith(fenceType.SPLIT)) {
          items.push(currentItem.join('\n'));
          currentItem = [];
          continue;
        }

        currentItem.push(state.src.slice(state.bMarks[currentLine], state.eMarks[currentLine]));
      }

      // 生成 Token
      const token = state.push('custom_fence', 'div', 0);
      token.attrSet('class', fenceType.blockClass!);
      token.attrSet('fence-type', fenceType.type);
      token.map = [startLine, currentLine];
      token.content = items.join(`\n${fenceType.SPLIT}\n`);
      token.block = true;

      state.line = currentLine + 1;
      return true;
    }
    return false;
  });

  md.renderer.rules.custom_fence = (tokens, idx) => {
    const content = tokens[idx].content;
    const blockClass = (tokens[idx].attrGet('class') || '').split(' ').map(x => x.trim());
    const types = (tokens[idx].attrGet('fence-type') || '').split(' ').map(x => x.trim());

    let fenceType: MarkDefine | undefined;
    fenceType = FenceMarks.find(x => types.includes(x.type))??FenceMarks[0];

    const itemClass = fenceType?.itemClass || '';
    const splitMark = fenceType?.SPLIT || '';
    const items = content.split(`\n${splitMark}\n`);

    const renderedItems = items.map(item => {
      // 使用 markdown-it 单独解析每个区块
      const lines = item.trim().split('\n');
      let titleHtml = '';
      if (lines.length > 1 && /^\s*(\*\*|\_\_)(.+)(\*\*|\_\_)\s*$/.test(lines[0]) && /^\s*$/.test(lines[1])) {
        // 移除加粗语法获取普通文本
        const match = /^(\*\*|\_\_)(.+)(\*\*|\_\_)$/.exec(lines[0]);
        if (match && match[2]) {
          const title = match[2].toString();
          titleHtml = `<div class="fence-title">${(title)}</div>`;
          lines.shift(); // 移除标题行
          lines.shift(); // 移除空行
        }
      }
      const contentHtml = md.render(lines.join('\n').trim());
      return `<div class="${itemClass}">${titleHtml}${contentHtml}</div>`;
    }).join('\n');

    return `<div class="${blockClass.join(" ")}" fence-type="${types.join(" ")}">\n${renderedItems}\n</div>`;
  };
}
