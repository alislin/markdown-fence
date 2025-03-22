export const FenceTag = {
    START: 'fence:start',
    END: 'fence:end',
    SPLIT: 'fence',
};

export const FenceShortTag = {
    START: '>>>',
    END: '<<<',
    SPLIT: '---',
};

export function markString(src: string) {
    return `<!-- ${src} -->`;
}
