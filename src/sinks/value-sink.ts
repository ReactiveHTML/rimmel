import { Sink } from "../types/sink";

export const ValueSink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
    (str: string) => {
        node.value = str;
    }
;
