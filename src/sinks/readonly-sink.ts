import type { Sink } from "../types/sink";

export const ReadonlySink: Sink<HTMLInputElement> = (node: HTMLInputElement) => {
    return (value: boolean) => {
		node.readOnly = value;
    };
};
