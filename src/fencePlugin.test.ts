import * as assert from 'assert';
import MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';

const testData = [
  {
    title: "标准渲染 [standard]",
    input: `<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->
`,
    except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`
  },
  {
    title: "标准渲染-标题栏-1 [standard]",
    input: `<!-- fence:start -->
**title**

left
<!-- fence -->
right
<!-- fence:end -->
`,
    except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><divclass="fence-title">title</div><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`
  },
  {
    title: "标准渲染-标题栏-2 [standard]",
    input: `<!-- fence:start -->
**title1**

left
<!-- fence -->
**title2**

right
<!-- fence:end -->
`,
    except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><divclass="fence-title">title1</div><p>left</p></div><divclass="fence-item"><divclass="fence-title">title2</div><p>right</p></div></div>`
  },
];

suite('Fence Plugin Tests', () => {
  suiteTeardown(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  const md = new MarkdownIt();
  md.use(fencePlugin);

  testData.forEach(testCase => {
    renderTest(testCase);
  });

  function renderTest(testCase: { title: string, input: string, except: string }) {
    const { title, input, except } = testCase;
    test(title, () => {
      const result = md.render(input);
      console.log(title, normalizeString(result));

      assert.strictEqual(normalizeString(result), normalizeString(except), `Test failed for : ${title}`);
    });
  }
});

function normalizeString(str: string) {
  return str.replace(/\s/g, '');
}
