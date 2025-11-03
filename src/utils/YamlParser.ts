/**
 * 简单的YAML解析器（增强版）
 * 支持中文、多行列表、复杂结构
 */
export class SimpleYAMLParser {
    /**
     * 解析YAML字符串为对象
     */
    static parse(yamlString: string): Record<string, any> {
        const result: Record<string, any> = {};
        const lines = yamlString.split('\n');

        let currentKey: string | null = null;
        let currentValue: any = null;
        let inMultiLineList = false;
        let listItems: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // 跳过文档分隔符
            if (trimmedLine === '---') continue;

            // 跳过空行和注释
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                // 如果是多行值中的空行，保留它
                if (currentKey !== null && !inMultiLineList) {
                    if (typeof currentValue === 'string') {
                        currentValue += '\n';
                    }
                }
                continue;
            }

            // 处理列表项
            if (trimmedLine.startsWith('- ')) {
                if (!inMultiLineList && currentKey) {
                    // 开始新的列表
                    inMultiLineList = true;
                    listItems = [];
                }
                if (inMultiLineList) {
                    listItems.push(trimmedLine.substring(2).trim());
                    continue;
                }
            } else if (inMultiLineList) {
                // 列表结束，提交当前列表
                result[currentKey!] = listItems.map(item => this.parseValue(item));
                currentKey = null;
                inMultiLineList = false;
                listItems = [];
            }

            // 提交之前的键值对（非列表情况）
            if (currentKey !== null && !inMultiLineList) {
                result[currentKey] = this.parseValue(currentValue);
                currentKey = null;
                currentValue = null;
            }

            // 解析键值对 - 支持中文和特殊字符
            const match = trimmedLine.match(/^([^:#\s][^:]*):\s*(.*)$/);

            if (match && !inMultiLineList) {
                const [, key, value] = match;
                currentKey = key.trim();

                if (value.trim()) {
                    currentValue = value.trim();
                } else {
                    // 空值或可能是多行值的开始
                    currentValue = '';
                }
            } else if (!inMultiLineList && currentKey && typeof currentValue === 'string') {
                // 处理多行字符串值（非列表）
                currentValue += '\n' + trimmedLine;
            }

        }

        // 处理最后未提交的数据
        if (inMultiLineList && currentKey) {
            result[currentKey] = listItems.map(item => this.parseValue(item));
        } else if (currentKey !== null) {
            result[currentKey] = this.parseValue(currentValue);
        }

        return result;
    }

    /**
     * 解析值 - 增强版，支持日期和更多类型
     */
    private static parseValue(value: string): any {
        if (value === undefined || value === null) return null;

        const trimmed = value.toString().trim();

        if (trimmed === '') return '';
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null' || trimmed === '~') return null;

        // 数字
        if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
        if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);

        // 日期格式 (YYYY-MM-DD 或 YYYY-MM-DD HH:mm)
        const dateRegex = /^\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?$/;
        if (dateRegex.test(trimmed)) {
            const date = new Date(trimmed);
            return isNaN(date.getTime()) ? trimmed : date;
        }

        // 数组
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return trimmed.slice(1, -1).split(',').map(item => this.parseValue(item.trim()));
        }

        // 嵌套对象
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                return JSON.parse(trimmed);
            } catch {
                return trimmed;
            }
        }

        // 引号字符串
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }

        return value;
    }
}