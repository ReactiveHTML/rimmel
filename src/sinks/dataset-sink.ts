import type { Sink } from "../types/sink";

import { asap } from "../lib/drain";

type DatasetKey = string;

export const DatasetSink: Sink<HTMLElement> = (node: HTMLElement, key: DatasetKey) => {
	const { dataset } = node;
	return (str: string) => {
		dataset[key] = str;
	};
};

export const DatasetItemPreSink = (key: DatasetKey): Sink<HTMLElement> =>
	(node: HTMLElement) => {
		const { dataset } = node;
		return (str: string) => {
			dataset[key] = str;
		};
	}
;

export const DatasetObjectSink: Sink<HTMLElement | SVGElement | MathMLElement> = (node: HTMLElement | SVGElement | MathMLElement) => {
	const { dataset } = node;
	return (data: Record<DatasetKey, string | null | undefined>) => {
		for (const [key, str] of Object.entries(data ?? {})) {
			(str === undefined || str == null)
				? delete dataset[key]
				: asap((str: string) => dataset[key] = str, str);
		}
	};
};