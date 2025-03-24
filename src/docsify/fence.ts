/*
 * @Author: Lin Ya
 * @Date: 2025-03-20 19:51:38
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-24 18:18:09
 * @Description: fence docsify plugin
 */
function fence(hook: any, vm: any) {
  interface MarkDefine {
    START: string;
    END: string;
    SPLIT: string;
    type: string;
    blockClass?: string;
    itemClass?: string;
  }

  const FenceTag: MarkDefine = {
    START: 'fence:start',
    END: 'fence:end',
    SPLIT: 'fence',
    type: "long",
  };

  const FenceShortTag: MarkDefine = {
    START: '>>>+',
    END: '<<<+',
    SPLIT: '---+',
    type: "short",
  };

  const FenceMainTag: MarkDefine = {
    START: '\/(&gt;){3,}',
    END: '\/(&lt;){3,}',
    SPLIT: '\/---+',
    type: "main",
    blockClass: "fence-block",
    itemClass: "fence-item",
  };

  function markString(src: string) {
    return `<!-- *?${src} *?-->`;
  }

  function getMarkDataWithType(data: MarkDefine): MarkDefine {
    return {
      type: data.type,
      START: markString(data.START),
      END: markString(data.END),
      SPLIT: markString(data.SPLIT),
      blockClass: data.blockClass ?? "fence-block",
      itemClass: data.itemClass ?? "fence-item",
    };
  }

  const FenceMarks: MarkDefine[] = [
    getMarkDataWithType(FenceTag),
    getMarkDataWithType(FenceShortTag),
    FenceMainTag,
  ];


  hook.afterEach(function (html: string, next: any) {
    const newHtml = render(html);
    next(newHtml);
  });



  function render(html: string) {
    let newHtml = "";
    let result = tagRender(html);
    while (result.hasNext) {
      newHtml += result.renderHtml;
      result = tagRender(result.remainHtml);
    }
    newHtml += result.renderHtml;
    return newHtml;
  }

  function scanCodePosItems(html: string): { start: number; end: number }[] {
    const codePosItems: { start: number; end: number }[] = [];
    const codeRegex = /<code[^>]*>.*?<\/code>/g;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(html)) !== null) {
      codePosItems.push({ start: codeMatch.index, end: codeMatch.index + codeMatch[0].length });
    }
    return codePosItems;
  }

  function isInCodePosItems(index: number, codePosItems: { start: number; end: number }[]): boolean {
    for (const codePos of codePosItems) {
      if (index >= codePos.start && index <= codePos.end) {
        return true;
      }
    }
    return false;
  }

  function getTagMatch(content: string, mark: string, codePosItems: { start: number; end: number }[]) {
    // 查找有效的标志（添加全局标志以支持连续匹配）
    const regex = new RegExp(mark, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) { // 循环所有匹配
      const index = match.index;
      if (index !== undefined) {
        if (!isInCodePosItems(index, codePosItems)) {
          return match; // 返回第一个不在代码块中的匹配
        }
      }
    }
    return undefined; // 未找到有效匹配
  }

  function tagRender(newHtml?: string) {
    if (!newHtml) {
      return { renderHtml: "", hasNext: false };
    }

    // 扫描全文，匹配所有的 <code[^>]*>.*?</code>，将匹配块的开始和结束位置记录到 codePosItems 中。
    const codePosItems = scanCodePosItems(newHtml);

    // 1. 找到起始标签
    let fenceType: MarkDefine | null = null;
    let firstMatchIndex = Infinity;
    for (const mark of FenceMarks) {
      const match = getTagMatch(newHtml, mark.START, codePosItems);
      if (match && match.index !== undefined && match.index < firstMatchIndex) {
        fenceType = mark;
        firstMatchIndex = match.index;
      }
    }

    // 2. 如果找到了起始标签，则进行解析
    if (fenceType) {
      let startIndex = 0;
      let endIndex = 0;

      // 找到起始标签的索引
      // const startRegex = new RegExp(fenceType.START);
      // const startMatch = newHtml.match(startRegex);
      const startMatch = getTagMatch(newHtml, fenceType.START, codePosItems);
      let startMatchLen = 0;
      if (startMatch) {
        startIndex = startMatch.index ?? 0;
        startMatchLen = startMatch[0].length;
        startIndex += startMatchLen;
      }

      // 找到结束标签的索引
      // const endRegex = new RegExp(fenceType.END);
      // const endMatch = newHtml.match(endRegex);
      const endMatch = getTagMatch(newHtml, fenceType.END, codePosItems);
      if (endMatch) {
        endIndex = endMatch.index ?? 0;
      } else {
        console.error(`未找到结束标签 ${fenceType.END}`);
        return { renderHtml: newHtml, hasNext: false };
      }

      // 3. 扫描直到结束标记
      if (startIndex !== -1 && endIndex !== -1) {
        const content = newHtml.substring(startIndex, endIndex);
        const splitMark = fenceType.SPLIT;
        // const items = content.split(new RegExp(splitMark));
        const items = splitByMark(content, splitMark);

        const renderedItems = items.map(item => {
          const lines = item.trim().split('\n');
          // let titleHtml = '';
          if (lines.length > 0 && /<p><strong>(.+?)<\/strong><\/p>/.test(lines[0])) {
            // 移除加粗语法获取普通文本
            const match = /<p><strong>(.+?)<\/strong><\/p>(.*)/.exec(lines[0]);
            if (match && match[1]) {
              const title = match[1].toString();
              // titleHtml = `<div class="fence-title">${(title)}</div>${match[2]}`;
              lines[0] = `<div class="fence-title">${(title)}</div>${match[2]}`;
              item = lines.join('\n');
            }
          }
          return `<div class="fence-item">${render(item.trim())}</div>`;
        }).join('\n');

        const renderHtml = newHtml.substring(0, startIndex - startMatchLen) +
          `<div class="fence-block">\n${renderedItems}\n</div>`;

        // 计算剩余文本开始位置
        endIndex += endMatch ? endMatch[0].length : 0;
        const remainHtml = newHtml.substring(endIndex);

        return { renderHtml: renderHtml, remainHtml: remainHtml, hasNext: endIndex > 0 && remainHtml.length > 0 };
      }
    }
    return { renderHtml: newHtml, hasNext: false };
  }

  function splitByMark(content: string, splitMark: string): string[] {
    // 扫描全文，匹配所有的 <code[^>]*>.*?</code>，将匹配块的开始和结束位置记录到 codePosItems 中。
    const codePosItems = scanCodePosItems(content);
    const result: string[] = [];

    // 查找有效的标志（添加全局标志以支持连续匹配）
    const regex = new RegExp(splitMark, 'g');
    let match;
    let lastStartIndex = 0;
    while ((match = regex.exec(content)) !== null) { // 循环所有匹配
      const index = match.index;
      if (index !== undefined) {
        if (!isInCodePosItems(index, codePosItems)) {
          // 不在代码块中的匹配
          result.push(content.substring(lastStartIndex, match.index));
          lastStartIndex = match.index + match[0].length;
        }
      }
    }
    result.push(content.substring(lastStartIndex, content.length));
    return result;
  }
}
