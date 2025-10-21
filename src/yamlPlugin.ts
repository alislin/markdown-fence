// markdown-it-yaml-frontmatter.ts

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
}

interface MarkdownItEnv {
    frontmatter?: Record<string, any>;
    yaml?: string;
}

/**
 * 简单的YAML解析器（基础功能）
 * 由于不引入依赖，这里只实现基础解析
 */
class SimpleYAMLParser {
    /**
     * 解析YAML字符串为对象
     */
    static parse(yamlString: string): Record<string, any> {
        const result: Record<string, any> = {};
        const lines = yamlString.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                result[key] = this.parseValue(value.trim());
            }
        }

        return result;
    }

    /**
     * 解析值
     */
    private static parseValue(value: string): any {
        // 布尔值
        if (value === 'true') return true;
        if (value === 'false') return false;

        // 数字
        if (/^-?\d+$/.test(value)) return parseInt(value, 10);
        if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);

        // 数组（简单支持）
        if (value.startsWith('[') && value.endsWith(']')) {
            return value.slice(1, -1).split(',').map(item => this.parseValue(item.trim()));
        }

        // 字符串（移除引号）
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }

        return value;
    }
}

/**
 * YAML Front Matter 插件
 */
export default function yamlFrontMatterPlugin(md: any, options: YamlFrontMatterPluginOptions = {}) {
    const opts: Required<YamlFrontMatterPluginOptions> = {
        remove: true,
        delimiter: '---',
        ...options
    };

    // 存储原始解析器
    const originalParse = md.parse;

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

        // 如果需要移除YAML，则使用剩余内容进行解析
        const contentToParse = opts.remove ? content : src;

        return originalParse.call(this, contentToParse, env);
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

/**
 * 用于测试的辅助函数
 */
export const testUtils = {
    extractYamlFrontMatter,
    SimpleYAMLParser
};

// export default yamlFrontMatterPlugin;