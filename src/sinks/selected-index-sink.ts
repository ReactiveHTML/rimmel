import { Sink } from "../types/sink";

export const SelectedIndexSink: Sink<HTMLSelectElement> = (node: HTMLSelectElement) =>
    (index: number) => node.selectedIndex = index;
