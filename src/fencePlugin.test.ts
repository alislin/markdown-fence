import * as assert from 'assert';
import MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';
import fencePlugin from './fencePlugin';
import { generateTestData } from './test/fenceData';

const testData = generateTestData();

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
      // console.log(title, normalizeString(result));

      assert.strictEqual(normalizeString(result), normalizeString(except), `Test failed for : ${title}`);
    });
  }
});

function normalizeString(str: string) {
  return str.replace(/\s/g, '');
}
