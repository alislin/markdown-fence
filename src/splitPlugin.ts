/*
 * @Author: Lin Ya
 * @Date: 2025-02-21 10:02:28
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-02-21 10:12:55
 * @Description: 分栏插件
 */
// splitPlugin.ts
import { PluginSimple } from "markdown-it";

const splitPlugin: PluginSimple = (md) => {
  // 添加块级规则
  md.block.ruler.before("paragraph", "fence_block", (state, startLine, endLine, silent) => {
    let haveEndMarker = false;
    let nextLine = startLine;

    // 检查是否以 "<!-- fence:start -->" 开始
    const startMarker = state.bMarks[startLine] + state.tShift[startLine];
    const endMarker = state.eMarks[startLine];
    const startText = state.src.substring(startMarker, endMarker).trim();

    if (startText !== "<!-- fence:start -->") return false;

    // 找到对应的结束标记 "<!-- fence:end -->"
    while (nextLine <= endLine) {
      const nextMarker = state.bMarks[nextLine] + state.tShift[nextLine];
      const nextEndMarker = state.eMarks[nextLine];
      const nextText = state.src.substring(nextMarker, nextEndMarker).trim();

      if (nextText === "<!-- fence:end -->") {
        haveEndMarker = true;
        break;
      }

      nextLine++;
    }

    if (!haveEndMarker) return false;

    // 如果 silent 模式，直接返回 true
    if (silent) return true;

    // 创建 split-block 容器
    const blockToken = state.push("fence_block_open", "fence-block", 1);
    blockToken.markup = "<!-- fence:start -->";
    blockToken.map = [startLine, nextLine + 1];

    // 处理内部内容
    let contentLines = state.getLines(startLine + 1, nextLine, state.blkIndent, true);
    contentLines = contentLines.split("\n<!-- fence -->\n").join("\n++++\n"); // 替换为可识别的分隔符
    const contentTokens = md.parse(contentLines, state.env);

    for (const token of contentTokens) {
      if (token.type === "paragraph_open") {
        token.tag = "div";
        token.attrs = [["class", "fence-item"]];
      }
    }

    state.tokens = state.tokens.concat(contentTokens);

    // 关闭 split-block 容器
    const closeToken = state.push("fence_block_close", "fence-block", -1);
    closeToken.markup = "<!-- fence:end -->";

    // 跳过处理过的行
    state.line = nextLine + 1;

    return true;
  });

  // 添加渲染规则
  md.renderer.rules.fence_block_open = () => '<div class="fence-block">\n';
  md.renderer.rules.fence_block_close = () => '</div>\n';
};

export default splitPlugin;