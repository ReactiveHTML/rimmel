import { Sink } from "../types/sink";

type DatasetKey = string;

export const DatasetSink: Sink<Element> = (node: Element, key: DatasetKey) => {
    const { dataset } = node;
    return (str: string) => {
        dataset[key] = str;
    };
};

export const DatasetObjectSink: Sink<Element> = (node: Element) => {
    const { dataset } = node;
    return (data: Record<DatasetKey, string | null | undefined>) => {
        for (const [key, str] of Object.entries(data ?? {})) {
            (str === undefined || str == null) ? delete dataset[key] : dataset[key] = str;
        }
    };
};

