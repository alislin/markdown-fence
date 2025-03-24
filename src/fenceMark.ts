export interface MarkDefine {
    START: string;
    END: string;
    SPLIT: string;
}

export interface MarkDefineWithType {
    type: string;
    START: string;
    END: string;
    SPLIT: string;
}

export const FenceTag: MarkDefine = {
    START: 'fence:start',
    END: 'fence:end',
    SPLIT: 'fence',
};

export const FenceShortTag: MarkDefine = {
    START: '>>>',
    END: '<<<',
    SPLIT: '---',
};

export function markString(src: string) {
    return `<!-- ${src} -->`;
}

function getMarkDataWithType(type: string, data: MarkDefine): MarkDefineWithType {
    return {
        type: type,
        START: markString(data.START),
        END: markString(data.END),
        SPLIT: markString(data.SPLIT),
    };
}

export const FenceMarks: MarkDefineWithType[] = [
    getMarkDataWithType('long', FenceTag),
    getMarkDataWithType('short', FenceShortTag)
];