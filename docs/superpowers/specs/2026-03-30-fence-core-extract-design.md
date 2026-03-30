# Markdown Fence 核心逻辑抽取设计

## 背景

当前项目存在 fence 解析逻辑的代码重复：
- `src/fencePlugin.ts` - VS Code 扩展的 markdown-it 插件
- `src/docsify/fence.ts` - docsify 插件

两者处理相同的 fence 语法，解析逻辑高度相似但未复用。同时，计划开发 Obsidian 插件支持阅读模式渲染，需要同样的解析能力。

## 目标

抽取核心解析逻辑为独立模块，供 VS Code 扩展、docsify 插件和未来 Obsidian 插件复用。

## 设计

### 目录结构

```
src/core/
  types.ts      # 类型定义
  parser.ts     # 核心解析逻辑
```

### types.ts - 类型定义

从 `fenceMark.ts` 抽取并简化：

```typescript
export type FenceStyle = 'standard' | 'short' | 'main';
export type FencePosition = 'start' | 'split' | 'end';

export interface FenceMarkDefinition {
  type: FenceStyle;
  START: string;      // 处理后的正则字符串（已包含注释包装）
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
  title?: string;      // 提取的标题（加粗文本）
  content: string;     // 原始内容（不含标题）
  rawContent: string;  // 原始内容（含标题）
}

export interface ParseOptions {
  styles?: FenceStyle[];  // 可选：限制只解析特定样式
}
```

### parser.ts - 核心解析逻辑

```typescript
import { FenceMarkDefinition, FenceBlock, FenceItem, ParseOptions } from './types';
import { FenceMarks, fenceDefinitions } from '../fenceMark';

export interface ParseResult {
  blocks: FenceBlock[];
  remainder: string;  // 未解析的剩余内容
}

/**
 * 解析 Markdown 内容中的所有 fence 块
 * @param content 原始 Markdown 内容
 * @param options 解析选项
 * @returns 解析结果
 */
export function parseFenceBlocks(content: string, options?: ParseOptions): ParseResult;

/**
 * 检查指定位置是否在代码块范围内
 */
export function isInCodeBlock(lineIndex: number, codeBlocks: CodeBlockRange[]): boolean;

/**
 * 扫描内容中的代码块位置（行号）
 */
export function scanCodeBlockRanges(content: string): CodeBlockRange[];

/**
 * 测试一行是否匹配指定标记（排除代码块内的匹配）
 */
export function testTagMatch(line: string, mark: string, codeBlocks: CodeBlockRange[]): boolean;
```

### 现有代码改造

#### 1. fencePlugin.ts 改为使用核心模块

```typescript
// 移除原有的 scanCodePostItems, testTagMatch, isInCodePosItems
// 改为从 core/parser 导入
import { parseFenceBlocks, scanCodeBlockRanges, testTagMatch } from './core/parser';

// 保留 fencePlugin 函数签名不变
// 内部实现改为调用核心模块
```

#### 2. docsify/fence.ts 改为使用核心模块

docsify 版本处理的是已渲染的 HTML，需要额外处理：
- 扫描 `<code>...</code>` 标签而非代码块行号
- 将设计为可适配两种场景的接口

### 关键决策

1. **为何不直接复用 fenceMark.ts 的 FenceMarks？**
   - `fenceMark.ts` 包含 UI 相关的 `fenceMarksByStyleAndPosition` 结构
   - 核心模块应只依赖最小类型定义
   - 解析器接受 `FenceMarkDefinition[]` 数组，而非直接依赖 fenceMark.ts

2. **为何返回 remainder？**
   - 支持增量解析（处理多个 fence 块）
   - docsify 需要对剩余内容递归处理

3. **代码块检测的差异如何处理？**
   - VS Code/markdown-it：按行号和 ``` 标记检测
   - docsify：按 `<code>` HTML 标签检测
   - 解决方案：抽象为 `CodeBlockRange` 接口，两种实现都返回该结构

## 实现步骤

1. 创建 `src/core/types.ts`
2. 创建 `src/core/parser.ts`，实现核心解析逻辑
3. 重构 `fencePlugin.ts` 使用核心模块
4. 重构 `docsify/fence.ts` 使用核心模块
5. 运行测试验证重构正确性

## 风险与备选

- **风险**：docsify 处理的是 HTML 而非原始 Markdown，解析逻辑需要适配
- **备选**：如适配成本过高，可将 docsify 版本作为特例保留

## 验收标准

- [ ] `src/core/types.ts` 包含所有类型定义
- [ ] `src/core/parser.ts` 提供 `parseFenceBlocks` 等导出函数
- [ ] `fencePlugin.ts` 重构后功能不变
- [ ] `docsify/fence.ts` 重构后功能不变
- [ ] 现有测试通过
