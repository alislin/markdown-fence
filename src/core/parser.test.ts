import * as assert from 'assert';
import { parseFenceBlocks, scanCodeBlockRanges, testTagMatch, isInCodeBlock } from './parser';

suite('scanCodeBlockRanges', () => {
  test('should detect code blocks', () => {
    const content = 'line0\n```\ncode\n```\nline3';
    const ranges = scanCodeBlockRanges(content);
    assert.deepStrictEqual(ranges, [{ start: 1, end: 3 }]);
  });

  test('should handle multiple code blocks', () => {
    const content = '```js\ncode1\n```\ntext\n```py\ncode2\n```';
    const ranges = scanCodeBlockRanges(content);
    assert.deepStrictEqual(ranges, [
      { start: 0, end: 2 },
      { start: 4, end: 6 }
    ]);
  });

  test('should return empty for no code blocks', () => {
    const content = 'plain text';
    assert.deepStrictEqual(scanCodeBlockRanges(content), []);
  });
});

suite('testTagMatch', () => {
  test('should match standard fence start', () => {
    const line = '<!-- fence:start -->';
    const mark = 'fence:start';
    const result = testTagMatch(line, mark, []);
    assert.notStrictEqual(result, null);
  });

  test('should not match in code block', () => {
    const line = '<!-- fence:start -->';
    const mark = 'fence:start';
    const codeBlocks = [{ start: 0, end: 2 }];
    const result = testTagMatch(line, mark, codeBlocks);
    assert.strictEqual(result, null);
  });
});

suite('isInCodeBlock', () => {
  test('should return true for line in code block', () => {
    const codeBlocks = [{ start: 1, end: 3 }];
    assert.strictEqual(isInCodeBlock(2, codeBlocks), true);
  });

  test('should return false for line outside code block', () => {
    const codeBlocks = [{ start: 1, end: 3 }];
    assert.strictEqual(isInCodeBlock(0, codeBlocks), false);
  });
});

suite('parseFenceBlocks', () => {
  test('should parse standard fence block', () => {
    const content = `<!-- fence:start -->
**Title 1**

Content 1

<!-- fence -->

**Title 2**

Content 2

<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].type, 'standard');
    assert.strictEqual(result.blocks[0].items.length, 2);
    assert.strictEqual(result.blocks[0].items[0].title, 'Title 1');
    assert.strictEqual(result.blocks[0].items[0].content, 'Content 1');
  });

  test('should return remainder when no fence found', () => {
    const content = 'plain text without fence';
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 0);
    assert.strictEqual(result.remainder, content);
  });
});
