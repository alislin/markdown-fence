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
  const blocks: FenceBlock[] = [];
  let remainder = content;
  let offset = 0;

  while (true) {
    const result = findNextFenceBlock(remainder, marks, codeBlocks, offset);
    if (!result) { break; }
    
    blocks.push(result.block);
    offset += remainder.split('\n').length - result.remainder.split('\n').length;
    remainder = result.remainder;
  }

  return { blocks, remainder };
}

function findNextFenceBlock(content: string, marks: FenceMarkDefinition[], codeBlocks: CodeBlockRange[], offset: number = 0): { block: FenceBlock; remainder: string } | null {
  const lines = content.split('\n');
  
  let fenceType: FenceMarkDefinition | null = null;
  let startLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const adjustedIndex = i + offset;
    if (isInCodeBlock(adjustedIndex, codeBlocks)) {
      continue;
    }
    for (const mark of marks) {
      if (testTagMatch(lines[i], mark.START, codeBlocks, adjustedIndex)) {
        fenceType = mark;
        startLineIndex = i;
        break;
      }
    }
    if (fenceType) {
      break;
    }
  }

  if (!fenceType || startLineIndex === -1) {
    return null;
  }

  const items: string[] = [];
  let currentItem: string[] = [];
  let endLineIndex = -1;

  for (let i = startLineIndex + 1; i < lines.length; i++) {
    const adjustedIndex = i + offset;
    if (isInCodeBlock(adjustedIndex, codeBlocks)) {
      currentItem.push(lines[i]);
      continue;
    }

    if (testTagMatch(lines[i], fenceType.END, codeBlocks, adjustedIndex)) {
      if (currentItem.length > 0) {
        items.push(currentItem.join('\n'));
      }
      endLineIndex = i;
      break;
    }

    if (testTagMatch(lines[i], fenceType.SPLIT, codeBlocks, adjustedIndex)) {
      items.push(currentItem.join('\n'));
      currentItem = [];
      continue;
    }

    currentItem.push(lines[i]);
  }

  if (endLineIndex === -1) {
    return null;
  }

  const fenceBlock: FenceBlock = {
    type: fenceType.type,
    items: items.map(rawContent => parseFenceItem(rawContent.trim()))
  };

  const remainder = lines.slice(endLineIndex + 1).join('\n');

  return { block: fenceBlock, remainder };
}

export function parseFenceItem(rawContent: string): FenceItem {
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

export function testTagMatch(line: string, mark: string, codeBlocks: CodeBlockRange[], lineIndex?: number): boolean {
  if (lineIndex !== undefined && isInCodeBlock(lineIndex, codeBlocks)) {
    return false;
  }
  const regex = new RegExp(mark);
  const lineMark = new RegExp(`\`.*?${mark}.*?\``);
  if (regex.test(line) && !lineMark.test(line)) {
    return true;
  }
  return false;
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
