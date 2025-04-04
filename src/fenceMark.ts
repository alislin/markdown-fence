/*
 * @Author: Lin Ya
 * @Date: 2025-03-24 07:43:40
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-25 17:18:05
 * @Description: 语法标记定义
 */
// 定义类型
export type FenceStyle = 'standard' | 'short' | 'main';
export type FencePosition = 'start' | 'split' | 'end';

interface FenceMarkDefinition {
    type: FenceStyle;
    START: string;
    END: string;
    SPLIT: string;
    blockClass?: string;
    itemClass?: string;
}

interface FenceMarkWithPosition {
    type: FenceStyle;
    position: FencePosition;
    value: string;
    markString: string;  // 可能是原始值或经过 markString 处理的值
    blockClass: string;
    itemClass: string;
}

// 基础定义
const fenceDefinitions: Record<FenceStyle, FenceMarkDefinition> = {
    standard: {
        type: 'standard',
        START: 'fence:start',
        END: 'fence:end',
        SPLIT: 'fence',
        blockClass: 'fence-block',
        itemClass: 'fence-item'
    },
    short: {
        type: 'short',
        START: '>>>+',
        END: '<<<+',
        SPLIT: '---+',
        blockClass: 'fence-block',
        itemClass: 'fence-item'
    },
    main: {
        type: 'main',
        START: '/>{3,}',
        END: '/<{3,}',
        SPLIT: '/---+',
        blockClass: 'fence-block',
        itemClass: 'fence-item'
    }
};

// 标记字符串生成函数（不处理 main 类型）
function processMarkString(style: FenceStyle, value: string): string {
    return style === 'main' ? value : `<!-- *?${value} *?-->`;
}

// 创建多维数据结构
const fenceMarksByStyleAndPosition: Record<FenceStyle, Record<FencePosition, FenceMarkWithPosition>> = {} as any;

// 初始化数据结构
(Object.keys(fenceDefinitions) as FenceStyle[]).forEach(style => {
    const def = fenceDefinitions[style];

    fenceMarksByStyleAndPosition[style] = {
        start: {
            type: style,
            position: 'start',
            value: def.START,
            markString: processMarkString(style, def.START),
            blockClass: def.blockClass || 'fence-block',
            itemClass: def.itemClass || 'fence-item'
        },
        split: {
            type: style,
            position: 'split',
            value: def.SPLIT,
            markString: processMarkString(style, def.SPLIT),
            blockClass: def.blockClass || 'fence-block',
            itemClass: def.itemClass || 'fence-item'
        },
        end: {
            type: style,
            position: 'end',
            value: def.END,
            markString: processMarkString(style, def.END),
            blockClass: def.blockClass || 'fence-block',
            itemClass: def.itemClass || 'fence-item'
        }
    };
});

// 保持原有的 FenceMarks 数组导出
export const FenceMarks: FenceMarkDefinition[] = Object.values(fenceDefinitions).map(def => ({
    ...def,
    START: processMarkString(def.type, def.START),
    END: processMarkString(def.type, def.END),
    SPLIT: processMarkString(def.type, def.SPLIT),
    blockClass: def.blockClass || 'fence-block',
    itemClass: def.itemClass || 'fence-item'
}));

// 导出类型和关键对象
export type { FenceMarkDefinition, FenceMarkWithPosition };
export { fenceDefinitions, fenceMarksByStyleAndPosition };