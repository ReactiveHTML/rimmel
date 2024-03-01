const readonly = 'readonly';

export const readonlySink = (node: HTMLElement) => {
    const set = node.setAttribute.bind(node, readonly, readonly);
    const clear = node.removeAttribute.bind(node, readonly);
    return (value?: boolean) => {
        value ? set() : clear();
    }
};
