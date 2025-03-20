function fence(hook: any, vm: any) {
  hook.afterEach(function (html: string, next: any) {
    const FENCE_START_MARK = '<!-- fence:start -->';
    const FENCE_END_MARK = '<!-- fence:end -->';
    const FENCE_SPLIT_MARK = '<!-- fence -->';

    const startIndex = html.indexOf(FENCE_START_MARK);
    if (startIndex === -1) {
      next(html);
      return;
    }

    const endIndex = html.indexOf(FENCE_END_MARK, startIndex);
    if (endIndex === -1) {
      next(html);
      return;
    }

    const fenceContent = html.substring(startIndex + FENCE_START_MARK.length, endIndex);
    const items = fenceContent.split(FENCE_SPLIT_MARK);

    const renderedItems = items.map(item => {
      return `<div class="fence-item">${item.trim()}</div>`;
    }).join('\n');

    const newHtml = html.substring(0, startIndex) +
      `<div class="fence-block">\n${renderedItems}\n</div>` +
      html.substring(endIndex + FENCE_END_MARK.length);

    next(newHtml);
  });
}
