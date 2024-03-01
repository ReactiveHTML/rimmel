import { MaybeFuture, MaybeObservable, MaybePromise, Present } from "../types/futures";
import { Sink } from "../types/sink";

export const innerHTMLSink: Sink = (node: HTMLElement) =>
    (html: string) => {
        node.innerHTML = html
    };

export const appendHTMLSink: Sink = (node: HTMLElement, pos: InsertPosition = 'beforeend') => {
	const appendFn = node.insertAdjacentHTML.bind(node, pos);

    return (html: MaybeFuture<string>) => {
        (<MaybeObservable<string>>html).subscribe?.(appendFn) ?? (<MaybePromise<string>>html).then?.(appendFn) ?? appendFn(<Present<string>>html ?? '');
    };
}

export const innerTextSink: Sink = (node: HTMLElement) =>
    (str: string) => {
        node.innerText = str
    };

export const textContentSink: Sink = (node: HTMLElement) =>
    (str: string) => {
        node.textContent = str
    };
