<!--
 * @Author: Lin Ya
 * @Date: 2025-03-22 22:51:05
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-22 22:51:11
 * @Description: file content
-->
# Fence Plugin 修改计划

## 目标

在 `src\fencePlugin.ts` 文件中，对于 fence-item 或 fence-short-item 包裹的内容，如果第一行为单独一行加粗的文本，并且随后有一个空行，那么将这种内容使用 `<div class="fence-title">` 包裹。

## 详细计划

1.  **获取 item 的第一行和第二行：**  使用 `item.split('\n')` 将 item 分割成多行，然后获取第一行和第二行。
2.  **检测加粗文本：**  使用正则表达式 `^\s*(\*\*|\_\_)(.+)(\*\*|\_\_)\s*$` 检测第一行是否为单独一行加粗的文本。
3.  **检测空行：**  检测第二行是否只包含换行符（`^\n$`）。
4.  **包裹标题：**  如果第一行符合加粗文本的条件，并且第二行是空行，则将第一行用 `<div class="fence-title">` 包裹。
5.  **拼接 item：**  将修改后的行重新拼接成 item。
6.  **渲染 item：**  将修改后的 item 传递给 `md.render()` 函数进行渲染。

## 流程图

```mermaid
graph TD
    A[分割 item 为多行] --> B{第一行是否为加粗文本？};
    B -- 是 --> C{第二行是否为空行？};
    B -- 否 --> E[直接渲染 item];
    C -- 是 --> D[用 <div class="fence-title"> 包裹第一行];
    C -- 否 --> E[直接渲染 item];
    D --> F[拼接 item];
    E --> F[拼接 item];
    F --> G[渲染 item];