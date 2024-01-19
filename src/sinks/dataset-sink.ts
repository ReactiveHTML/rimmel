import { Sink } from "../types/sink";

type HTMLAttribute = string;

export const datasetSink: Sink = (node: HTMLElement, key: HTMLAttribute) =>
    (str: string)  =>
        node.dataset[key] = str;

export const datasetMultiSink: Sink = (node: HTMLElement, key: HTMLAttribute) =>
    (str: string) =>
        node.dataset[key] = str;
