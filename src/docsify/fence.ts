function fence(hook: any, vm: any) {
  hook.afterEach(function (html: string, next: any) {
    const FENCE_START_MARK = '<!-- fence:start -->';
    const FENCE_END_MARK = '<!-- fence:end -->';
    const FENCE_SPLIT_MARK = '<!-- fence -->';

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

    next(newHtml);
  });
}
