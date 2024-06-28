import type { Sink } from "../types/sink";
const READONLY = 'readonly';

export const ReadonlySink: Sink<Element> = (node: Element) => {
    // const set = node.setAttribute.bind(node, READONLY, READONLY);
    // const clear = node.removeAttribute.bind(node, READONLY);
    return (value?: unknown) => {
		node.readOnly = value;
        // value ? set() : clear();
    };
};
