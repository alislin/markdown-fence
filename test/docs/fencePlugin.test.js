// test.js
console.log("Tests started");
import * as assert from "assert";
import MarkdownIt from "markdown-it";
import fencePlugin from "../../src/fencePlugin";;

describe("fencePlugin", () => {
  it("should render the correct HTML", () => {
    const md = new MarkdownIt().use(fencePlugin);

    const result = md.render("<!-- fence:start -->## 这是左边开始的内容1. 第一行2. 第二行<!-- fence -->横向分隔<!-- fence:end -->");

    // 正确结果
    const check_result = `<div class="fence-block"><div class="fence-item"><h2>这是左边开始的内容</h2><ol><li>第一行</li><li>第二行</li></ol></div><div class="fence-item"><p>横向分隔</p></div></div>`;
    console.log("result:", result);
    console.log("check_result:", check_result);
    console.log("result:", result);
    assert.strictEqual(result, check_result);
    assert.strictEqual(result, "1");
  });
});
console.log("Tests finished");