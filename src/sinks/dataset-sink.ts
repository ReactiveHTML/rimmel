import { Sink } from "../types/sink";

type DatasetKey = string;

export const DatasetSink: Sink<HTMLElement> = (node: HTMLElement, key: DatasetKey) => {
    const { dataset } = node;
    return (str: string) => {
        dataset[key] = str;
    };
};

export const DatasetObjectSink: Sink<HTMLElement> = (node: HTMLElement) => {
    const { dataset } = node;
    return (data: Record<DatasetKey, string | undefined>) => {
        for (const [key, str] of Object.entries(data ?? {})) {
            str === undefined ? delete dataset[key] : dataset[key] = str;
        }
    };
};


// // with maybe future support
// export const ___DatasetObjectSink: Sink<HTMLElement> = (node: HTMLElement) => {
//     const { dataset } = node;
//     const doNow = (key, str) => str === undefined ? delete dataset[key] : dataset[key] = str
//     return (data: Record<DatasetKey, string | undefined>) => {
//         for (const [key, str] of Object.entries(data ?? {})) {
//             const doLater = doNow.bind(null, key)
//             str?.then?.(doLater) ?? str?.subscribe?.(doLater) ?? doNow(key, str);
//         }
//     };
// };
