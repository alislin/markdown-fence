// 遍历 ./docs/ 下的所有*.md文件

const fs = require("fs");
const path = require("path");
import MarkdownIt from 'markdown-it';
import fencePlugin from '../fencePlugin';

start("data-standard", { name: "standard", start: "fence:start", end: "fence:end", split: "fence" });
start("data-short", { name: "short", start: ">>>", end: "<<<", split: "---" });
start("data-main", { name: "main", start: "/>>>", end: "/<<<", split: "/---" });

function start(dfile: string, opt: { name: string, start: string, end: string, split: string }) {
  console.log("data start", dfile);

  const render_list: Block[] = [];
  const files = getFiles(path.resolve(__dirname, "../../test/docs"));
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = makeMark(loadFile(file), opt);
    // 替换标记

    const blocks = getBlocks(content);
    for (let j = 0; j < blocks.length; j++) {
      const block = blocks[j];
      const result = rendBlock(block);
      result.title = `[${opt.name}] - ${result.title}`;
      render_list.push(result);
    }
  }
  const rows = makeContent(render_list);
  const content = `const datas_${opt.name}=[${rows}];`;

  // 将 rows 写入文件dfile
  saveDate(path.resolve(__dirname, "./temp", dfile), content);
  console.log("finish!");
}

function makeMark(content: string, opt: { name: string, start: string, end: string, split: string }) {
  let start_reg = /\{\{fence:start\}\}/g;
  let end_reg = /\{\{fence:end\}\}/g;
  let split_reg = /\{\{fence\}\}/g;
  if (opt.name === "main") {
    start_reg = /<!--.*?\{\{fence:start\}\}.*? -->/g;
    end_reg = /<!--.*?\{\{fence:end\}\}.*? -->/g;
    split_reg = /<!--.*?\{\{fence\}\}.*? -->/g;
  }

  let m = content.replace(start_reg, opt.start);
  m = m.replace(end_reg, opt.end);
  m = m.replace(split_reg, opt.split);
  return m;
}

function loadFile(file: string) {
  // 读取.md文件，返回全文
  try {
    const filePath = path.resolve(__dirname, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading file ${file}: ${error}`);
    return null;
  }
}

function getFiles(dirPath: string) {
  // 遍历文件夹，获取所有的.md文件。返回文件列表
  const files: string[] = [];

  function traverseDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath);

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else if (path.extname(entry) === ".md" && entry.includes(".new.")>0) {
        files.push(fullPath);
      }
    }
  }

  traverseDir(dirPath);
  return files;
}

function getBlocks(content: string) {
  // 从content文本进行分块。
  // 按行进行检查，匹配`/##### (.+)/`的后面一行作为块开始，直到下一个`/##### (.+)/`或者是文本结束
  // 返回 分块列表。每块的定义为：{title:标题,content:块的所有文本}
  const blocks = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].replace("\r", "");
    const match = line.match(/^##### (.+)$/);

    if (match) {
      const title = match[1];
      i++; // Move to the next line, which is the start of the content
      let content = "";

      while (i < lines.length) {
        const nextLine = lines[i].replace("\r", "");
        const nextMatch = nextLine.match(/^##### (.+)$/);

        if (nextMatch) {
          break; // Next block found
        }

        content += nextLine + "\n";
        i++;
      }

      blocks.push({ title: title.trim(), input: content.trim() } as Block);
    } else {
      i++;
    }
  }

  return blocks;
}

function rendBlock(block: Block) {
  // 渲染一个块的内容
  // 调用markdownit，使用fencePlugin插件，渲染block
  // 返回 blockRender,定义为：{title:content.title,input:content.content,except:渲染结果}
  const md = new MarkdownIt();
  block.except = md.use(fencePlugin).render(block.input);
  return block;
}

function makeContent(contents: Block[]) {
  // content是rendBlock返回值组成的列表
  // 生成文本
  const result = contents
    .map(
      (x) => `
\{
    title:\`${x.title}\`,
    input:\`${x.input.replace(/\`/g, "\\\`")}\`,
    except:\`${x.except.replace(/\`/g, "\\\`")}\`,
\}
`
    )
    .join(",");
  return result;
}

function saveDate(file: string, data: string) {
  // 写入文件
  fs.writeFileSync(path.resolve(__dirname, file + ".ts"), data, "utf-8");
}

interface Block {
  title: string;
  input: string;
  except: string;
}
