import { MaybeFuture, MaybeObservable, MaybePromise, Present } from "../types/futures";
import { Sink } from "../types/sink";

export const InnerHTMLSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (html: string) => {
        node.innerHTML = html
    };

export const AppendHTMLSink: Sink<HTMLElement> = (node: HTMLElement, pos: InsertPosition = 'beforeend') => {
	const appendFn = node.insertAdjacentHTML.bind(node, pos);

    return (html: MaybeFuture<string>) => {
        (<MaybeObservable<string>>html).subscribe?.(appendFn) ?? (<MaybePromise<string>>html).then?.(appendFn) ?? appendFn(<Present<string>>html ?? '');
    };
}

export const InnerTextSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (str: string) => {
        node.innerText = str
    };

export const TextContentSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (str: string) => {
        node.textContent = str
    };
