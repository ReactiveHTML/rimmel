import { Sink } from "../types/sink";

const disabled = 'disabled';
export const disabledSink: Sink = (node: HTMLElement) =>
    (value: boolean) =>
        value
            ? node.setAttribute(disabled, disabled)
            : node.removeAttribute(disabled);
