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
    type: "long",
};

export const FenceShortTag: MarkDefine = {
    START: '>>>',
    END: '<<<',
    SPLIT: '---',
    type: "short",
    blockClass: "fence-short-block",
    itemClass: "fence-short-item",
};

export function markString(src: string) {
    return `<!-- ${src} -->`;
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
    getMarkDataWithType(FenceShortTag)
];