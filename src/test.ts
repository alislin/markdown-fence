// test.ts
import MarkdownIt from "markdown-it";
import fencePlugin from "./fencePlugin";


const md = new MarkdownIt().use(fencePlugin);

const result = md.render(`
<!-- fence:start -->
## 这是左边开始的内容
1. 第一行
2. 第二行
<!-- fence -->
横向分隔
<!-- fence:end -->
`);

console.log(result);