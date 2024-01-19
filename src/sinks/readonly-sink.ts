const readonly = 'readonly';

export const readonlySink = (node: HTMLElement) =>
    (value: boolean) => value && node.setAttribute(readonly, readonly) || node.removeAttribute(readonly)
