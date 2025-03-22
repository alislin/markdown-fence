function fence(hook: any, vm: any) {
  const FenceTag = {
    START: 'fence:start',
    END: 'fence:end',
    SPLIT: 'fence',
  };

  const FenceShortTag = {
    START: '>>>',
    END: '<<<',
    SPLIT: '---',
  };

  function markString(src: string) {
    return `<!-- ${src} -->`;
  }
  hook.afterEach(function (html: string, next: any) {
    const FENCE_START_MARK = markString(FenceTag.START);
    const FENCE_END_MARK = markString(FenceTag.END);
    const FENCE_SPLIT_MARK = markString(FenceTag.SPLIT);

    const FENCE_SHORT_START_MARK = markString(FenceShortTag.START);
    const FENCE_SHORT_END_MARK = markString(FenceShortTag.END);
    const FENCE_SHORT_SPLIT_MARK = markString(FenceShortTag.SPLIT);

    let newHtml = html;
    let startIndex = newHtml.indexOf(FENCE_START_MARK);

    while (startIndex !== -1) {
      const endIndex = newHtml.indexOf(FENCE_END_MARK, startIndex);
      if (endIndex === -1) {
        break;
      }

      const fenceContent = newHtml.substring(startIndex + FENCE_START_MARK.length, endIndex);
      const items = fenceContent.split(FENCE_SPLIT_MARK);

      const renderedItems = items.map(item => {
        return `<div class="fence-item">${item.trim()}</div>`;
      }).join('\n');

      newHtml = newHtml.substring(0, startIndex) +
        `<div class="fence-block">\n${renderedItems}\n</div>` +
        newHtml.substring(endIndex + FENCE_END_MARK.length);

      startIndex = newHtml.indexOf(FENCE_START_MARK);
    }

    // 处理 FenceShortTag
    let shortStartIndex = newHtml.indexOf(FENCE_SHORT_START_MARK);
    while (shortStartIndex !== -1) {
      const shortEndIndex = newHtml.indexOf(FENCE_SHORT_END_MARK, shortStartIndex);
      if (shortEndIndex === -1) {
        break;
      }

      const fenceContent = newHtml.substring(shortStartIndex + FENCE_SHORT_START_MARK.length, shortEndIndex);
      const items = fenceContent.split(FENCE_SHORT_SPLIT_MARK);

      const renderedItems = items.map(item => {
        return `<div class="fence-short-item">${item.trim()}</div>`;
      }).join('\n');

      newHtml = newHtml.substring(0, shortStartIndex) +
        `<div class="fence-short-block">\n${renderedItems}\n</div>` +
        newHtml.substring(shortEndIndex + FENCE_SHORT_END_MARK.length);

      shortStartIndex = newHtml.indexOf(FENCE_SHORT_START_MARK);
    }

    next(newHtml);
  });


}
