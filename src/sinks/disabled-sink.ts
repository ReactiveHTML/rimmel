import { Sink } from "../types/sink";

const disabled = 'disabled';
export const disabledSink: Sink = (node: HTMLElement) => {
    const set = node.setAttribute.bind(node, disabled, disabled);
    const unset = node.removeAttribute.bind(node, disabled);
    return (value: unknown) => {
        value
            ? set()
            : unset();
    };
};
