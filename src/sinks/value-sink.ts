import { Sink } from "../types/sink";

export const valueSink: Sink = (node: HTMLInputElement) =>
    (str: string) => {
        node.value = str;
    }
