import { Sink } from "../types/sink";

type DatasetKey = string;

export const datasetSink: Sink = (node: HTMLElement, key: DatasetKey) => {
    const { dataset } = node;
    return (str: string) => {
        dataset[key] = str;
    };
};

export const datasetMultiSink: Sink = (node: HTMLElement) => {
    const { dataset } = node;
    return (data: Record<DatasetKey, string | undefined>) => {
        for (const [key, str] of Object.entries(data)) {
            str === undefined ? delete dataset[key] : dataset[key] = str;
        }
    };
};
