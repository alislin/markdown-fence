import { SimpleYAMLParser } from "./utils/YamlParser";

// 扩展 YAML 配置接口
interface YamlFrontMatterPluginOptions {
    /**
     * 是否在渲染时移除YAML front matter
     * @default true
     */
    remove?: boolean;

    /**
     * 自定义YAML分隔符，默认为 '---'
     * @default '---'
     */
    delimiter?: string;

    /**
     * 强制分页的标题级别数组，如 [1, 2] 表示 h1 和 h2 前分页
     * @default []
     */
    pageLevel?: number[];
}

// 默认分页标记
const DEFAULT_PAGEBREAK_MARKDOWN = '<!-- pagebreak -->';
const DEFAULT_PAGEBREAK_HTML = '<div style="page-break-after: always;"></div>';

interface MarkdownItEnv {
    frontmatter?: Record<string, any>;
    yaml?: string;
}


// 改造后的插件逻辑
export default function yamlFrontMatterPlugin(md: any, options: YamlFrontMatterPluginOptions = {}) {
    const opts: Required<YamlFrontMatterPluginOptions> = {
        remove: true,
        delimiter: '---',
        pageLevel: [],
        ...options
    };

    // 存储原始解析器
    const originalParse = md.parse;
    const originalRender = md.render;

    // 1. 在解析阶段处理 YAML front matter 和标题分页
    md.parse = function (src: string, env: MarkdownItEnv) {
        // 重置环境变量
        if (env) {
            env.frontmatter = {};
            env.yaml = '';
        }

        const { content, frontmatter, yaml } = extractYamlFrontMatter(src, opts.delimiter);

        // 将解析的YAML数据存入env
        if (env && frontmatter) {
            env.frontmatter = frontmatter;
            env.yaml = yaml;
        }

        if (frontmatter) {
            opts.pageLevel = frontmatter.pageLevel ?? [];
        }

        // 如果需要移除YAML，则使用剩余内容进行解析
        const contentToParse = opts.remove ? content : src;

        // 根据 pageLevel 配置插入分页标记
        let processedContent = contentToParse;
        const linesStr = processedContent.replace(/\r/g, '\n');
        if (opts.pageLevel && opts.pageLevel.length > 0) {
            const lines = linesStr.split('\n');
            const newLines: string[] = [];
            // 扫描代码块位置
            const codeBlocks = scanCodePostItems(linesStr);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // 检查是否为标题行
                const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
                if (headingMatch) {
                    const headingLevel = headingMatch[1].length; // 获取标题级别数字（如 1, 2）

                    // 检查当前行是否在代码块内
                    const isInCodeBlock = isInCodePosItems(i, codeBlocks);

                    if (opts.pageLevel.includes(headingLevel) && !isInCodeBlock) {
                        newLines.push(DEFAULT_PAGEBREAK_MARKDOWN);
                    }
                }
                newLines.push(line);
            }

            processedContent = newLines.join('\n');
        }

        return originalParse.call(this, processedContent, env);
    };

    // 2. 在渲染阶段完成后替换分页标记
    md.render = function (src: string, env: MarkdownItEnv) {
        // 先调用原始渲染逻辑
        const renderedHtml = originalRender.call(this, src, env);

        // 替换分页标记为 HTML
        return renderedHtml.replace(
            new RegExp(DEFAULT_PAGEBREAK_MARKDOWN, 'g'),
            DEFAULT_PAGEBREAK_HTML
        );
    };
}

/**
 * 从markdown内容中提取YAML front matter
 */
function extractYamlFrontMatter(
    src: string,
    delimiter: string = '---'
): { content: string; frontmatter?: Record<string, any>; yaml?: string } {
    const lines = src.split('\n');

    // 检查是否以YAML分隔符开始
    if (lines.length < 2 || lines[0].trim() !== delimiter) {
        return { content: src };
    }

    let yamlEndIndex = -1;
    const yamlLines: string[] = [];

    // 查找结束分隔符
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === delimiter) {
            yamlEndIndex = i;
            break;
        }
        yamlLines.push(lines[i]);
    }

    // 如果没有找到结束分隔符，则没有有效的YAML front matter
    if (yamlEndIndex === -1) {
        return { content: src };
    }

    const yamlContent = yamlLines.join('\n');
    const remainingContent = lines.slice(yamlEndIndex + 1).join('\n');


    try {
        const frontmatter = SimpleYAMLParser.parse(yamlContent);
        return {
            content: remainingContent,
            frontmatter,
            yaml: yamlContent
        };
    } catch (error) {
        // 解析失败时，返回原始内容
        console.warn('YAML front matter parsing failed:', error);
        return { content: src };
    }
}

function scanCodePostItems(content: string) {
    let code_flag = false;
    let code_block: { start: number; end: number; }[] = [];
    const rows = content.split("\n");
    let pos_start = 0;
    let pos_end = 0;
    // 扫描所有标记，记录
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (/^```/.test(row)) {
            code_flag = !code_flag;
            if (code_flag) {
                pos_start = i;
            }
            else {
                pos_end = i;
                code_block.push({ start: pos_start, end: pos_end });
            }
        }
    }
    return code_block;
}

function isInCodePosItems(index: number, codePosItems: { start: number; end: number }[]): boolean {
    for (const codePos of codePosItems) {
        if (index >= codePos.start && index <= codePos.end) {
            return true;
        }
    }
    return false;
}
