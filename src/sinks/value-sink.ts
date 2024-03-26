import { Sink } from "../types/sink";

export const ValueSink: Sink = (node: HTMLInputElement) =>
    (str: string) => {
        node.value = str;
    }
