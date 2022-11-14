import { SinkFactory } from './types';
import { setClasses } from './util';

export const innerHTMLSink = (node: HTMLElement) => (html: string) => node.innerHTML = html;

export const innerTextSink = (node: HTMLElement) => (str: string) => node.innerText = str;

export const styleSink = (node: HTMLElement, key: string) => {
	const t = node.style //[key];
	return (kvp: { [key: string]: string }) => Object.entries(kvp).forEach(([k, v])=> t[k] = v);
};

export const attributeSink = (node: HTMLElement, key: string) => (str: string) => node.setAttribute(key, str);
// const eventHandlerSink= (node)      => (e, h) => node.addEventListener(e, h)
// set node attributes from an object {k: v, k2: v2}
//const attributesSink  = (node)      => attributeset => Object.entries(attributeset) .forEach(([k, v])=> typeof v == 'undefined' ? node.removeAttribute(k) : typeof v == 'function' ? node.addEventListener(k.replace(/^on/, ''), v) : node.setAttribute(k, v))
export const attributesSink = (node: HTMLElement) => (attributeset: { [key: string]: string }) => Object
	.entries(attributeset)
	.forEach(([k, v]: [string, any])=>
		typeof v == 'undefined'
			? node.removeAttribute(k)
			: k.substring(0, 2) == 'on' && typeof (v.next || v) == 'function'
				? node.addEventListener(k.replace(/^on/, ''), v.next ? v.next.bind(v) : v)
				: typeof v.subscribe == 'function'
					? v.subscribe((DOMSinks.get(k) || attributeSink)(node, k))
					: typeof v.then == 'function'
						? v.then((DOMSinks.get(k) || attributeSink)(node, k))
						: node.setAttribute(k, v))

export const classSink = (node: HTMLElement) => (name: string) => name && (typeof name == 'string' ? node.classList.add(name) : setClasses(node, name))

export const datasetSink = (node: HTMLElement, key: string) => (str: string) => node.dataset[key] = str;

export const datasetMultiSink = (node: HTMLElement, key: string) => (str: string) => node.dataset[key] = str;

// const terminationSink = (node: HTMLElement) => node.remove();

export const DOMSinks = new Map<string, SinkFactory>([
	['innerHTML',    innerHTMLSink],
	['innerText',    innerTextSink],
	['style',        styleSink],
	['attribute',    attributeSink],
	['attributeset', attributesSink],
	['class',        classSink],
	['dataset',      datasetSink],
	['multidataset', datasetMultiSink],
// ['termination',  terminationSink],
]);