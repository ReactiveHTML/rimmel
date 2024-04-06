import { Sink } from "../types/sink";

export const CheckedSink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
    (checked: unknown) => {
        node.checked = !!checked
    };
