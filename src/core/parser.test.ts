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
    const mark = '<!-- *?fence:start *?-->';
    const result = testTagMatch(line, mark, []);
    assert.strictEqual(result, true);
  });

  test('should not match in code block', () => {
    const line = '<!-- fence:start -->';
    const mark = '<!-- *?fence:start *?-->';
    const codeBlocks = [{ start: 0, end: 2 }];
    const result = testTagMatch(line, mark, codeBlocks, 0);
    assert.strictEqual(result, false);
  });

  test('should not match inline code', () => {
    const line = '`<!-- fence:start -->`';
    const mark = '<!-- *?fence:start *?-->';
    const result = testTagMatch(line, mark, []);
    assert.strictEqual(result, false);
  });

  test('should match short style start', () => {
    const line = '<!-- >>> -->';
    const mark = '<!-- *?>>> *?-->';
    const result = testTagMatch(line, mark, []);
    assert.strictEqual(result, true);
  });

  test('should match main style start', () => {
    const line = '/>>> ';
    const mark = '/>{3,}';
    const result = testTagMatch(line, mark, []);
    assert.strictEqual(result, true);
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

  test('should parse short style fence block', () => {
    const content = `<!-- >>> -->
**Short Title 1**

Short Content 1

<!-- --- -->

**Short Title 2**

Short Content 2

<!-- <<< -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].type, 'short');
    assert.strictEqual(result.blocks[0].items.length, 2);
    assert.strictEqual(result.blocks[0].items[0].title, 'Short Title 1');
    assert.strictEqual(result.blocks[0].items[0].content, 'Short Content 1');
  });

  test('should parse main style fence block', () => {
    const content = `/>>> 
**Main Title 1**

Main Content 1

/--- 

**Main Title 2**

Main Content 2

/<<< `;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].type, 'main');
    assert.strictEqual(result.blocks[0].items.length, 2);
    assert.strictEqual(result.blocks[0].items[0].title, 'Main Title 1');
    assert.strictEqual(result.blocks[0].items[0].content, 'Main Content 1');
  });

  test('should parse fence block with code block inside', () => {
    const content = `<!-- fence:start -->
**Title with code**

\`\`\`javascript
const x = 1;
\`\`\`

<!-- fence -->

**Title 2**

Content 2

<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].items.length, 2);
    assert.strictEqual(result.blocks[0].items[0].title, 'Title with code');
    assert.ok(result.blocks[0].items[0].content.includes('const x = 1'));
  });

  test('should parse multiple fence blocks', () => {
    const content = `<!-- fence:start -->
**First Block**

First Content
<!-- fence:end -->

Some text between

<!-- fence:start -->
**Second Block**

Second Content
<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 2);
    assert.strictEqual(result.blocks[0].items[0].title, 'First Block');
    assert.strictEqual(result.blocks[1].items[0].title, 'Second Block');
    assert.strictEqual(result.remainder, '');
  });

  test('should not parse fence markers inside code blocks', () => {
    const content = `\`\`\`markdown
<!-- fence:start -->
some content
<!-- fence:end -->
\`\`\`

<!-- fence:start -->
**Real Block**

Real Content
<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].items[0].title, 'Real Block');
  });

  test('should handle short style fence markers inside code blocks', () => {
    const content = `\`\`\`
<!-- >>> -->
content
<!-- <<< -->
\`\`\`

<!-- >>> -->
**Real**

Real Content
<!-- <<< -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].items[0].title, 'Real');
  });

  test('should return empty remainder for content after last fence', () => {
    const content = `<!-- fence:start -->
**Title**

Content
<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.remainder, '');
  });

  test('should filter by style when options.styles is specified', () => {
    const content = `<!-- fence:start -->
**Standard**

Content
<!-- fence:end -->

/>>> 
**Main**

Main Content
/<<< `;
    const result = parseFenceBlocks(content, { styles: ['main'] });
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].type, 'main');
  });

  test('should handle fence block with no title', () => {
    const content = `<!-- fence:start -->
Just content

<!-- fence -->

More content

<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    assert.strictEqual(result.blocks.length, 1);
    assert.strictEqual(result.blocks[0].items[0].title, undefined);
    assert.strictEqual(result.blocks[0].items[0].content, 'Just content');
  });
});
