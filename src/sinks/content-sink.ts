import { MaybeFuture, MaybeObservable, MaybePromise, Present } from "../types/futures";
import { Sink } from "../types/sink";

export const innerHTMLSink: Sink = (node: HTMLElement) =>
    (html: string) => {
        node.innerHTML = html
    };

export const appendHTMLSink: Sink = (node: HTMLElement) => {
	// const append = (str: string) => node.insertAdjacentHTML('beforeEnd', str)
	const appendFn = node.insertAdjacentHTML.bind(null, 'beforeEnd' as InsertPosition);

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
