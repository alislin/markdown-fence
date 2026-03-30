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

  while (true) {
    const result = findNextFenceBlock(remainder, marks, codeBlocks);
    if (!result) { break; }
    
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
    if (match && match.index !== undefined) {
      const matchIndex = match.index;
      if (firstMatchIndex === -1 || matchIndex < firstMatchIndex) {
        fenceType = mark;
        firstMatchIndex = matchIndex;
      }
    }
  }

  if (!fenceType || firstMatchIndex === -1) {
    return null;
  }

  const startMatch = testTagMatch(content, fenceType.START, codeBlocks, true)!;
  const startIndex = firstMatchIndex + startMatch[0].length;
  
  const endMatch = testTagMatch(content, fenceType.END, codeBlocks, true);
  if (!endMatch || endMatch.index === undefined) {
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
