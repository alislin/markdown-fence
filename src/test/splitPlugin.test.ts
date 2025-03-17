/*
 * @Author: Lin Ya
 * @Date: 2025-02-21 10:13:24
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-02-21 10:13:47
 * @Description: 测试
 */
import MarkdownIt from "markdown-it";
import splitPlugin from "../splitPlugin";

const md = new MarkdownIt().use(splitPlugin);

const result = md.render(`
+++
烦烦烦
+++
横向分隔
+++
`);

console.log(result);