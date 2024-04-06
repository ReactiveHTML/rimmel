import { Sink } from "../types/sink";
const READONLY = 'readonly';

export const ReadonlySink: Sink<HTMLElement> = (node: HTMLElement) => {
    const set = node.setAttribute.bind(node, READONLY, READONLY);
    const clear = node.removeAttribute.bind(node, READONLY);
    return (value?: unknown) => {
        value ? set() : clear();
    };
};
