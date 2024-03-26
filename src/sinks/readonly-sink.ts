const readonly = 'readonly';

export const ReadonlySink = (node: HTMLElement) => {
    const set = node.setAttribute.bind(node, readonly, readonly);
    const clear = node.removeAttribute.bind(node, readonly);
    return (value?: unknown) => {
        value ? set() : clear();
    }
};
