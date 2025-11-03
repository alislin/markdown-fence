// yamlParser.test.ts
import * as assert from 'assert';
import { SimpleYAMLParser } from './YamlParser';

// 测试数据生成器
function generateYAMLTestData() {
    return [
        {
            title: '基础键值对',
            input: `name: John Doe
age: 30
active: true`,
            expected: {
                name: 'John Doe',
                age: 30,
                active: true
            }
        },
        {
            title: '中文键名',
            input: `创建时间: 2025-10-10 14:22
项目: 教务管理
描述: 这是一个测试项目`,
            expected: {
                '创建时间': new Date('2025-10-10 14:22'),
                '项目': '教务管理',
                '描述': '这是一个测试项目'
            }
        },
        {
            title: '多行列表',
            input: `tags:
  - 需求
  - 开发
  - 测试
hobbies:
  - reading
  - swimming`,
            expected: {
                tags: ['需求', '开发', '测试'],
                hobbies: ['reading', 'swimming']
            }
        },
        {
            title: '包含文档分隔符',
            input: `---
创建时间: 2025-10-10 14:22
项目: 教务管理
tags:
  - 需求
  - 开发
---`,
            expected: {
                '创建时间': new Date('2025-10-10 14:22'),
                '项目': '教务管理',
                tags: ['需求', '开发']
            }
        },
        {
            title: '数字和布尔值',
            input: `count: 42
price: 99.99
enabled: true
disabled: false`,
            expected: {
                count: 42,
                price: 99.99,
                enabled: true,
                disabled: false
            }
        },
        {
            title: '空值和null',
            input: `empty_value:
null_value: null
undefined_value: ~`,
            expected: {
                empty_value: '',
                null_value: null,
                undefined_value: null
            }
        },
        {
            title: '数组语法',
            input: `colors: [red, green, blue]
numbers: [1, 2, 3]`,
            expected: {
                colors: ['red', 'green', 'blue'],
                numbers: [1, 2, 3]
            }
        },
        {
            title: '混合内容',
            input: `---
项目名称: 学生管理系统
版本: 1.0.0
开发人员:
  - 张三
  - 李四
技术栈: [JavaScript, TypeScript, Node.js]
上线时间: 2024-12-01
状态: 开发中
---`,
            expected: {
                '项目名称': '学生管理系统',
                '版本': '1.0.0',
                '开发人员': ['张三', '李四'],
                '技术栈': ['JavaScript', 'TypeScript', 'Node.js'],
                '上线时间': new Date('2024-12-01'),
                '状态': '开发中'
            }
        },
        {
            title: '数组列表',
            input: `---
创建时间: 2025-10-10 14:22
项目: 教务管理
业务优先级: 5
状态:
    - 进行中
痛点:
pageLevel: [2]
---`,
            expected: {
                "创建时间": new Date("2025-10-10 14:22"),
                "项目": "教务管理",
                "业务优先级": 5,
                "状态": ["进行中"],
                '痛点': '',
                "pageLevel": [2]
            }
        },
        {
            title: '复合列表',
            input: `创建时间: 2025-10-10 14:22
项目: 教务管理
tags:
  - 需求
version:
状态:
  - 进行中
description:
需求方:
需求人:
业务优先级: 5
优先级: 5
工作量预估:
前置任务:
追加需求: false
痛点:
pageLevel: [2]`,
            expected: {
                "创建时间": new Date("2025-10-10 14:22"),
                "项目": "教务管理",
                "tags": ['需求'],
                "version": '',
                "状态": ["进行中"],
                "description": '',
                "需求方": '',
                "需求人": '',
                "业务优先级": 5,
                "优先级": 5,
                "工作量预估": '',
                "前置任务": '',
                "追加需求": false,
                '痛点': '',
                "pageLevel": [2]
            }
        },
    ];
}

suite('YAML Parser Tests', () => {
    const testData = generateYAMLTestData();

    suiteTeardown(() => {
        console.log('All YAML parser tests completed!');
    });

    testData.forEach(testCase => {
        parseTest(testCase);
    });

    // 错误情况测试
    test('空字符串解析', () => {
        const result = SimpleYAMLParser.parse('');
        assert.deepStrictEqual(result, {});
    });

    test('只有注释的YAML', () => {
        const yaml = `# 这是一个注释
# 这是另一个注释`;
        const result = SimpleYAMLParser.parse(yaml);
        assert.deepStrictEqual(result, {});
    });

    test('只有文档分隔符', () => {
        const yaml = `---
---`;
        const result = SimpleYAMLParser.parse(yaml);
        assert.deepStrictEqual(result, {});
    });

    function parseTest(testCase: { title: string, input: string, expected: any }) {
        const { title, input, expected } = testCase;

        test(title, () => {
            const result = SimpleYAMLParser.parse(input);

            // 特殊处理日期对象的比较
            const normalizedResult = normalizeObject(result);
            const normalizedExpected = normalizeObject(expected);

            assert.deepStrictEqual(
                normalizedResult,
                normalizedExpected,
                `Test failed for: ${title}`
            );
        });
    }
});

/**
 * 标准化对象，用于比较（主要是处理日期对象）
 */
function normalizeObject(obj: any): any {
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(item => normalizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const normalized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            normalized[key] = normalizeObject(value);
        }
        return normalized;
    }

    return obj;
}

/**
 * 性能测试
 */
suite('YAML Parser Performance Tests', () => {
    test('大文件解析性能', () => {
        const largeYaml = generateLargeYAML(1000); // 生成1000行的YAML

        const startTime = Date.now();
        const result = SimpleYAMLParser.parse(largeYaml);
        const endTime = Date.now();

        assert.ok(Object.keys(result).length > 0, '应该成功解析大文件');
        assert.ok(endTime - startTime < 1000, `解析应在1秒内完成，实际耗时: ${endTime - startTime}ms`);
    });
});

/**
 * 生成大型YAML用于性能测试
 */
function generateLargeYAML(lineCount: number): string {
    let yaml = '---\n';
    for (let i = 0; i < lineCount; i++) {
        yaml += `key_${i}: value_${i}\n`;
        if (i % 10 === 0) {
            yaml += `list_${i}:\n`;
            for (let j = 0; j < 5; j++) {
                yaml += `  - item_${j}\n`;
            }
        }
    }
    yaml += '---';
    return yaml;
}