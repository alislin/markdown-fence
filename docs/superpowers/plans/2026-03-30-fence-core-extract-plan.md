# Markdown Fence 核心逻辑抽取实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 抽取 fence 解析逻辑为独立核心模块，供 VS Code 扩展、docsify 和 Obsidian 插件复用

**Architecture:** 在 `src/core/` 下创建 `types.ts` 和 `parser.ts`，将现有 fencePlugin.ts 和 docsify/fence.ts 中的解析逻辑抽取并统一接口

**Tech Stack:** TypeScript, markdown-it, 现有 fenceMark.ts 定义的 FenceMarks

---

## 文件结构

```
src/core/
  types.ts      # 类型定义（FenceBlock, FenceItem, ParseOptions, ParseResult）
  parser.ts    # 核心解析函数（parseFenceBlocks, scanCodeBlockRanges, testTagMatch, isInCodeBlock）
```

---

## Task 1: 创建核心类型定义

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: 创建 types.ts**

```typescript
/*
 * @Author: Lin Ya
 * @Date: 2026-03-30
 * @Description: fence 核心类型定义
 */

export type FenceStyle = 'standard' | 'short' | 'main';
export type FencePosition = 'start' | 'split' | 'end';

export interface FenceMarkDefinition {
  type: FenceStyle;
  START: string;
  END: string;
  SPLIT: string;
  blockClass?: string;
  itemClass?: string;
}

export interface FenceBlock {
  type: FenceStyle;
  items: FenceItem[];
}

export interface FenceItem {
  title?: string;
  content: string;
  rawContent: string;
}

export interface CodeBlockRange {
  start: number;
  end: number;
}

export interface ParseOptions {
  styles?: FenceStyle[];
}

export interface ParseResult {
  blocks: FenceBlock[];
  remainder: string;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/core/types.ts
git commit -m "feat(core): add core types definition"
```

---

## Task 2: 创建核心解析器

**Files:**
- Create: `src/core/parser.ts`
- Test: `src/core/parser.test.ts`

- [ ] **Step 1: 创建 parser.ts**

```typescript
/*
 * @Author: Lin Ya
 * @Date: 2026-03-30
 * @Description: fence 核心解析逻辑
 */
import { FenceMarkDefinition, FenceBlock, FenceItem, CodeBlockRange, ParseOptions, ParseResult } from './types';
import { FenceMarks } from '../fenceMark';

export function parseFenceBlocks(content: string, options?: ParseOptions): ParseResult {
  const marks = options?.styles
    ? FenceMarks.filter(m => options.styles!.includes(m.type))
    : FenceMarks;

  const codeBlocks = scanCodeBlockRanges(content);
  const lines = content.split('\n');
  const blocks: FenceBlock[] = [];
  let remainder = content;

  while (true) {
    const result = findNextFenceBlock(remainder, marks, codeBlocks);
    if (!result) break;
    
    blocks.push(result.block);
    remainder = result.remainder;
  }

  return { blocks, remainder };
}

function findNextFenceBlock(content: string, marks: FenceMarkDefinition[], codeBlocks: CodeBlockRange[]): { block: FenceBlock; remainder: string } | null {
  let fenceType: FenceMarkDefinition | null = null;
  let firstMatchIndex = -1;

  for (const mark of marks) {
    const match = testTagMatch(content, mark.START, codeBlocks, true);
    if (match && (firstMatchIndex === -1 || match.index < firstMatchIndex)) {
      fenceType = mark;
      firstMatchIndex = match.index;
    }
  }

  if (!fenceType || firstMatchIndex === -1) {
    return null;
  }

  const startMatch = testTagMatch(content, fenceType.START, codeBlocks, true)!;
  const startIndex = firstMatchIndex + startMatch[0].length;
  
  const endMatch = testTagMatch(content, fenceType.END, codeBlocks, true);
  if (!endMatch) {
    return null;
  }
  const endIndex = endMatch.index;

  const blockContent = content.substring(startIndex, endIndex);
  const items = splitBySplitMark(blockContent, fenceType.SPLIT, codeBlocks);
  
  const fenceBlock: FenceBlock = {
    type: fenceType.type,
    items: items.map(rawContent => parseFenceItem(rawContent.trim()))
  };

  const remainder = content.substring(endIndex + endMatch[0].length);
  
  return { block: fenceBlock, remainder };
}

function parseFenceItem(rawContent: string): FenceItem {
  const lines = rawContent.split('\n');
  let title: string | undefined;
  
  if (lines.length > 1 && /^\s*(\*\*|\_\_)(.+)(\*\*|\_\_)\s*$/.test(lines[0]) && /^\s*$/.test(lines[1])) {
    const match = /^(\*\*|\_\_)(.+)(\*\*|\_\_)$/.exec(lines[0]);
    if (match && match[2]) {
      title = match[2];
      lines.shift();
      lines.shift();
    }
  }

  return {
    title,
    content: lines.join('\n').trim(),
    rawContent
  };
}

export function scanCodeBlockRanges(content: string): CodeBlockRange[] {
  const codeBlocks: CodeBlockRange[] = [];
  const rows = content.split('\n');
  let pos_start = 0;
  let code_flag = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (/^```/.test(row)) {
      if (code_flag) {
        codeBlocks.push({ start: pos_start, end: i });
      } else {
        pos_start = i;
      }
      code_flag = !code_flag;
    }
  }

  return codeBlocks;
}

export function testTagMatch(line: string, mark: string, codeBlocks: CodeBlockRange[], findAll: boolean = false): RegExpMatchArray | null {
  const regex = new RegExp(mark, findAll ? 'g' : '');
  const lineMark = new RegExp(`\`.*?${mark}.*?\``);
  
  if (findAll) {
    const results: RegExpMatchArray[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (!lineMark.test(line)) {
        results.push(match);
      }
    }
    return results.length > 0 ? results[0] : null;
  }
  
  const match = line.match(regex);
  if (match && !lineMark.test(line)) {
    return match;
  }
  return null;
}

export function isInCodeBlock(lineIndex: number, codeBlocks: CodeBlockRange[]): boolean {
  for (const codePos of codeBlocks) {
    if (lineIndex >= codePos.start && lineIndex <= codePos.end) {
      return true;
    }
  }
  return false;
}

function splitBySplitMark(content: string, splitMark: string, codeBlocks: CodeBlockRange[]): string[] {
  const results: string[] = [];
  const lines = content.split('\n');
  let currentItem: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!isInCodeBlock(i, codeBlocks) && testTagMatch(lines[i], splitMark, codeBlocks)) {
      if (currentItem.length > 0) {
        results.push(currentItem.join('\n'));
      }
      currentItem = [];
    } else {
      currentItem.push(lines[i]);
    }
  }

  if (currentItem.length > 0) {
    results.push(currentItem.join('\n'));
  }

  return results;
}
```

- [ ] **Step 2: 创建测试文件 parser.test.ts**

```typescript
import { parseFenceBlocks, scanCodeBlockRanges, testTagMatch, isInCodeBlock } from './parser';

describe('scanCodeBlockRanges', () => {
  test('should detect code blocks', () => {
    const content = 'line0\n```\ncode\n```\nline3';
    const ranges = scanCodeBlockRanges(content);
    expect(ranges).toEqual([{ start: 1, end: 3 }]);
  });

  test('should handle multiple code blocks', () => {
    const content = '```js\ncode1\n```\ntext\n```py\ncode2\n```';
    const ranges = scanCodeBlockRanges(content);
    expect(ranges).toEqual([
      { start: 0, end: 2 },
      { start: 4, end: 6 }
    ]);
  });

  test('should return empty for no code blocks', () => {
    const content = 'plain text';
    expect(scanCodeBlockRanges(content)).toEqual([]);
  });
});

describe('testTagMatch', () => {
  test('should match standard fence start', () => {
    const line = '<!-- fence:start -->';
    const mark = 'fence:start';
    const result = testTagMatch(line, mark, []);
    expect(result).not.toBeNull();
  });

  test('should not match in code block', () => {
    const line = '<!-- fence:start -->';
    const mark = 'fence:start';
    const codeBlocks = [{ start: 0, end: 2 }];
    const result = testTagMatch(line, mark, codeBlocks);
    expect(result).toBeNull();
  });
});

describe('isInCodeBlock', () => {
  test('should return true for line in code block', () => {
    const codeBlocks = [{ start: 1, end: 3 }];
    expect(isInCodeBlock(2, codeBlocks)).toBe(true);
  });

  test('should return false for line outside code block', () => {
    const codeBlocks = [{ start: 1, end: 3 }];
    expect(isInCodeBlock(0, codeBlocks)).toBe(false);
  });
});

describe('parseFenceBlocks', () => {
  test('should parse standard fence block', () => {
    const content = `<!-- fence:start -->
**Title 1**

Content 1

<!-- fence -->

**Title 2**

Content 2

<!-- fence:end -->`;
    const result = parseFenceBlocks(content);
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('standard');
    expect(result.blocks[0].items.length).toBe(2);
    expect(result.blocks[0].items[0].title).toBe('Title 1');
    expect(result.blocks[0].items[0].content).toBe('Content 1');
  });

  test('should return remainder when no fence found', () => {
    const content = 'plain text without fence';
    const result = parseFenceBlocks(content);
    expect(result.blocks.length).toBe(0);
    expect(result.remainder).toBe(content);
  });
});
```

- [ ] **Step 3: 运行测试验证**

Run: `npm run test -- --grep "scanCodeBlockRanges|testTagMatch|isInCodeBlock|parseFenceBlocks"`

- [ ] **Step 4: 提交**

```bash
git add src/core/parser.ts src/core/parser.test.ts
git commit -m "feat(core): add fence parser implementation"
```

---

## Task 3: 重构 fencePlugin.ts 使用核心模块

**Files:**
- Modify: `src/fencePlugin.ts`

- [ ] **Step 1: 简化 fencePlugin.ts，使用核心解析器**

保留 markdown-it 插件接口，但内部使用核心解析器处理分栏内容生成：

```typescript
// src/fencePlugin.ts 改动：
// 1. 移除 scanCodePostItems, testTagMatch, isInCodePosItems 函数
// 2. 保留 fencePlugin 函数和 MarkdownIt 插件接口
// 3. 使用核心解析器的函数进行解析

import { scanCodeBlockRanges, testTagMatch, isInCodeBlock } from './core/parser';
```

具体改动：
- 移除 `scanCodePostItems` 函数（第133-154行），改用 `scanCodeBlockRanges`
- 移除 `testTagMatch` 函数（第157-164行），改用核心模块导出
- 移除 `isInCodePosItems` 函数（第166-173行），改用 `isInCodeBlock`
- `md.block.ruler.before('fence', 'code_block_begin', ...)` 中的 `scanCodePostItems` 改为 `scanCodeBlockRanges`

- [ ] **Step 2: 运行测试验证**

Run: `npm run test`

- [ ] **Step 3: 提交**

```bash
git add src/fencePlugin.ts
git commit -m "refactor(fencePlugin): use core parser functions"
```

---

## Task 4: 重构 docsify/fence.ts 使用核心模块

**Files:**
- Modify: `src/docsify/fence.ts`

- [ ] **Step 1: 分析 docsify 版本的差异**

docsify 版本处理的是**已渲染的 HTML**，关键差异：
- 扫描 `<code>...</code>` 标签而非行号
- 使用 HTML 位置而非行号

决定：docsify 版本需要保持其特殊的代码块检测逻辑（因为是 HTML 环境），但共享解析核心逻辑。

- [ ] **Step 2: 重构 docsify/fence.ts**

1. 保留 `scanCodePosItems`（扫描 HTML 中的 `<code>` 标签）
2. 保留 `isInCodePosItems`（检测 HTML 位置）
3. 导入并使用核心的 `parseFenceItem` 逻辑处理标题提取
4. 保留 `splitByMark` 函数（需适配 HTML 环境）

具体改动：
- 从 `src/core/parser` 导入共用的 `parseFenceItem` 逻辑
- 或将 `parseFenceItem` 作为独立函数抽取到核心模块

**注意**：如果适配成本过高，可以保留 docsify 版本的特殊性，后续 Obsidian 插件参考此经验。

- [ ] **Step 3: 运行测试验证**

docsify 插件需要手动测试或编写集成测试。

- [ ] **Step 4: 提交**

```bash
git add src/docsify/fence.ts
git commit -m "refactor(docsify): align with core parser interface"
```

---

## Task 5: 清理和验证

- [ ] **Step 1: 删除 packages 目录中的旧代码（如果存在冲突）**

```bash
rm -rf packages/fence-core packages/obsidian-plugin
```

- [ ] **Step 2: 运行 lint 检查**

Run: `npm run lint`

- [ ] **Step 3: 运行完整测试**

Run: `npm run test`

- [ ] **Step 4: 提交**

```bash
git commit -m "chore: cleanup and final verification"
```

---

## 验收标准

- [ ] `src/core/types.ts` 包含 FenceBlock, FenceItem, ParseOptions, ParseResult, CodeBlockRange
- [ ] `src/core/parser.ts` 导出 parseFenceBlocks, scanCodeBlockRanges, testTagMatch, isInCodeBlock
- [ ] `fencePlugin.ts` 重构后功能不变，测试通过
- [ ] `docsify/fence.ts` 重构后功能不变
- [ ] 现有测试全部通过
- [ ] Lint 检查通过
