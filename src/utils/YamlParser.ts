/**
 * 简单的YAML解析器（增强版）
 * 支持中文、多行列表、嵌套对象结构
 */
export class SimpleYAMLParser {
    /**
     * 解析YAML字符串为对象
     */
    static parse(yamlString: string): Record<string, any> {
        const lines = yamlString.split('\n');
        let index = 0;

        // 使用栈来跟踪嵌套层级
        const stack: Array<{ key: string; obj: any; indent: number }> = [];
        let root: Record<string, any> = {};

        while (index < lines.length) {
            const line = lines[index];
            const indent = this.getIndent(line);
            const trimmedLine = line.trim();

            // 跳过文档分隔符、空行和注释
            if (trimmedLine === '---' || !trimmedLine || trimmedLine.startsWith('#')) {
                index++;
                continue;
            }

            // 解析键值对
            const match = trimmedLine.match(/^([^:#\s][^:]*):\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                const cleanKey = key.trim();
                const cleanValue = value.trim();

                // 调整栈的深度
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                }

                // 创建当前对象
                let targetObj: any;
                if (stack.length === 0) {
                    // 根级别
                    targetObj = root;
                } else {
                    // 嵌套级别
                    targetObj = stack[stack.length - 1].obj;
                }

                if (cleanValue === '') {
                    // 空值，检查下一行是否是嵌套对象或列表
                    const nextLine = index + 1 < lines.length ? lines[index + 1] : '';
                    const nextTrimmed = nextLine.trim();
                    const nextIndent = this.getIndent(nextLine);

                    if (nextLine.trim() && nextIndent > indent) {
                        if (nextTrimmed.startsWith('- ')) {
                            // 下一行是列表项，创建列表
                            const listItems: any[] = [];
                            index++;
                            while (index < lines.length) {
                                const listLine = lines[index];
                                const listIndent = this.getIndent(listLine);

                                if (!listLine.trim()) {
                                    index++;
                                    continue;
                                }

                                if (listIndent <= indent) {
                                    break;
                                }

                                const listTrimmed = listLine.trim();
                                if (listTrimmed.startsWith('- ')) {
                                    const listItemValue = listTrimmed.substring(2).trim();
                                    listItems.push(this.parseValue(listItemValue));
                                } else {
                                    // 嵌套对象
                                    const nestedMatch = listTrimmed.match(/^([^:#\s][^:]*):\s*(.*)$/);
                                    if (nestedMatch) {
                                        const [, nestedKey, nestedValue] = nestedMatch;
                                        const nestedObj: Record<string, any> = {};
                                        nestedObj[nestedKey.trim()] = this.parseValue(nestedValue.trim());
                                        listItems.push(nestedObj);
                                    }
                                }

                                index++;
                            }
                            targetObj[cleanKey] = listItems;
                            continue;
                        } else {
                            // 下一行是嵌套内容，创建对象
                            const newObj: Record<string, any> = {};
                            targetObj[cleanKey] = newObj;
                            stack.push({ key: cleanKey, obj: newObj, indent: indent });
                        }
                    } else {
                        // 空字符串
                        targetObj[cleanKey] = '';
                    }
                } else if (cleanValue.startsWith('|') || cleanValue.startsWith('>')) {
                    // 多行字符串
                    const isFolded = cleanValue.startsWith('>');
                    const marker = cleanValue[0];
                    let multiLineValue = cleanValue.substring(1).trim();

                    index++;
                    while (index < lines.length) {
                        const nextLine = lines[index];
                        const nextIndent = this.getIndent(nextLine);

                        if (!nextLine.trim() || nextIndent <= indent) {
                            break;
                        }

                        multiLineValue += '\n' + nextLine.substring(indent);
                        index++;
                    }

                    targetObj[cleanKey] = multiLineValue;
                    continue;
                } else if (cleanValue.startsWith('- ')) {
                    // 内联列表
                    const listItems: any[] = [];
                    const itemValue = cleanValue.substring(2).trim();
                    if (itemValue) {
                        listItems.push(this.parseValue(itemValue));
                    }
                    targetObj[cleanKey] = listItems;
                } else {
                    // 普通值
                    targetObj[cleanKey] = this.parseValue(cleanValue);
                }
            }

            index++;
        }

        return root;
    }

    /**
     * 计算行的缩进空格数
     */
    private static getIndent(line: string): number {
        let count = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === ' ') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    /**
     * 解析值 - 增强版，支持日期和更多类型
     */
    private static parseValue(value: string): any {
        if (value === undefined || value === null) {
            return null;
        }

        const trimmed = value.toString().trim();

        if (trimmed === '') {
            return '';
        }
        if (trimmed === 'true') {
            return true;
        }
        if (trimmed === 'false') {
            return false;
        }
        if (trimmed === 'null' || trimmed === '~') {
            return null;
        }

        // 数字
        if (/^-?\d+$/.test(trimmed)) {
            return parseInt(trimmed, 10);
        }
        if (/^-?\d*\.\d+$/.test(trimmed)) {
            return parseFloat(trimmed);
        }

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