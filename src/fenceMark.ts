/*
 * @Author: Lin Ya
 * @Date: 2025-03-24 07:43:40
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-25 08:22:49
 * @Description: 语法标记定义
 */
export interface MarkDefine {
    START: string;
    END: string;
    SPLIT: string;
    type: string;
    blockClass?: string;
    itemClass?: string;
}

export const FenceTag: MarkDefine = {
    START: 'fence:start',
    END: 'fence:end',
    SPLIT: 'fence',
    type: "standard",
};

export const FenceShortTag: MarkDefine = {
    START: '>>>+',
    END: '<<<+',
    SPLIT: '---+',
    type: "short",
};

export const FenceMainTag: MarkDefine = {
    START: '\/>{3,}',
    END: '\/<{3,}',
    SPLIT: '\/---+',
    type: "main",
    blockClass: "fence-block",
    itemClass: "fence-item",
};

export function markString(src: string) {
    return `<!-- *?${src}? *-->`;
}

function getMarkDataWithType(data: MarkDefine): MarkDefine {
    return {
        type: data.type,
        START: markString(data.START),
        END: markString(data.END),
        SPLIT: markString(data.SPLIT),
        blockClass: data.blockClass ?? "fence-block",
        itemClass: data.itemClass ?? "fence-item",
    };
}

export const FenceMarks: MarkDefine[] = [
    getMarkDataWithType(FenceTag),
    getMarkDataWithType(FenceShortTag),
    FenceMainTag,
];