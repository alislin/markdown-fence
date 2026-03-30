/*
 * @Author: Lin Ya
 * @Date: 2026-03-30
 * @Description: fence 核心类型定义
 */

import type { FenceStyle, FencePosition, FenceMarkDefinition } from '../fenceMark';

export type { FenceStyle, FencePosition, FenceMarkDefinition };

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
