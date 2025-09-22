import type { Sink } from '../types/sink';
import type { AttributeObject } from '../types/internal';
import type { MaybeFuture, Observer } from '../types/futures';
import type { RMLEventAttributeName, RMLEventName } from '../types/dom';

import { addListener } from '../lib/addListener';
import { asap } from '../lib/drain';
import { DatasetItemPreSink, DatasetObjectSink } from './dataset-sink';
import { isFunction } from '../utils/is-function';
import { isRMLEventListener, RMLEventListener } from '../types/event-listener';
import { sinkByAttributeName } from '../parser/sink-map';

type EventListenerDeclarationWithOptions = [Function, EventListenerOptions];

export type ElementAttribute =
	| 'className'
	| 'id'
	| 'nodeName'
	| 'nodeValue'
	| 'textContent'
	| 'innerHTML'
	| 'outerHTML'
	| 'namespaceURI'
	| 'localName'
	| 'tagName'
	| 'attributes'
	| 'childNodes'
	| 'firstChild'
	| 'lastChild'
	| 'nextSibling'
	| 'previousSibling'
	| 'parentNode'
	| 'parentElement'
	| 'baseURI'
	| 'isConnected'
	| 'ownerDocument'
	| 'style'
	| 'dataset'
	| 'classList'
	| 'scrollTop'
	| 'scrollLeft'
	| 'scrollWidth'
	| 'scrollHeight'
	| 'clientTop'
	| 'clientLeft'
	| 'clientWidth'
	| 'clientHeight'
	| 'offsetParent'
	| 'offsetTop'
	| 'offsetLeft'
	| 'offsetWidth'
	| 'offsetHeight'
	| 'onclick'
	| 'ondblclick'
	| 'onmousedown'
	| 'onmouseup'
	| 'onmouseover'
	| 'onmousemove'
	| 'onmouseout'
	| 'onmouseenter'
	| 'onmouseleave'
	| 'onkeydown'
	| 'onkeypress'
	| 'onkeyup'
	| 'onabort'
	| 'onbeforeinput'
	| 'oninput'
	| 'onchange'
	| 'onreset'
	| 'onsubmit'
	| 'onfocus'
	| 'onblur'
	| 'onfocusin'
	| 'onfocusout'
	| 'onload'
	| 'onloadeddata'
	| 'onloadedmetadata'
	| 'onloadstart'
	| 'onprogress'
	| 'onerror'
	| 'onresize'
	| 'onscroll'
	| 'onselect'
	| 'onwheel'
;

export type WritableElementAttribute =
	| 'className'
	| 'id'
	| 'innerHTML'
	| 'outerHTML'
	| 'scrollLeft'
	| 'scrollTop'
	| 'slot'
	| 'nodeValue'
	| 'textContent'
;

export type WritableHTMLElementAttribute =
	| 'accessKey'
	| 'contentEditable'
	| 'dir'
	| 'draggable'
	| 'hidden'
	| 'innerText'
	| 'lang'
	| 'spellcheck'
	| 'tabIndex'
	| 'title'
	| 'translate'
;

const isSource = (k: RMLEventAttributeName, v: MaybeFuture<unknown> | EventListenerObject | EventListenerDeclarationWithOptions) =>
	k.substring(0, 2) == 'on' && (isFunction((<Observer<unknown>>v).next ?? v) || isFunction((<EventListenerDeclarationWithOptions>v)[0]));

export const FixedAttributeSink: Sink<Element> = (node: Element, attributeName: string) =>
	// data => node.setAttribute(attributeName, data)
	node.setAttribute.bind(node, attributeName)
;

export const FixedAttributePreSink = (attributeName: string): Sink<Element> =>
	(node: Element) =>
		// data => node.setAttribute(attributeName, data)
		node.setAttribute.bind(node, attributeName)
;

export const ToggleAttributePreSink = (attributeName: string): Sink<Element> =>
	(node: Element) =>
		node.toggleAttribute.bind(node, attributeName)
;

/**
 * Set a boolean attribute via direct DOM property
 **/
export const BooleanAttributeSink: Sink<Element> =
	(node: Element, attributeName: WritableElementAttribute) =>
		(value: boolean) => (node[attributeName] as unknown) = value
;

/**
 * Set an attribute via direct DOM property, rather than setAttribute
 **/
export const DOMAttributeSink: Sink<Element> =
	(node: Element, attributeName: WritableElementAttribute) =>
		// node.setAttribute.bind(node, attributeName)
		(value: unknown) => (node[attributeName] as unknown) = value
;

/**
 * Set the value of a form's element, given its name
 **/
export const FormElementSink: Sink<HTMLFormElement> =
	(node: HTMLFormElement, elementName: string) =>
		(value: any) => {
			const e = (node.elements.namedItem(elementName));
			// TODO: add checkbox and radio...
			if(e) {
				if((e as HTMLInputElement).type == 'checkbox') {
					(e as HTMLInputElement).checked = value;
				} else if((e as HTMLInputElement).type == 'radio') {
					(e as HTMLInputElement).checked = (e as HTMLInputElement).value == value;
				} else {
					(e as HTMLInputElement | HTMLTextAreaElement).value = value;
				}
			}
		}
;

/**
 * An implicit sink for any DOM Attributes (the ones that can be set via node[attr] = value)
 * @example <div contenteditable="${stream}">...</div>
 **/
export const DOMAttributePreSink = (attributeName: WritableElementAttribute): Sink<Element> =>
	(node: Element) =>
		(value: unknown) => (node[attributeName] as unknown) = value
;

export const AttributeObjectSink = <T extends HTMLElement | SVGElement | MathMLElement>(node: T) =>
	(attributeobject: AttributeObject) => {
		(Object.entries(attributeobject) ?? [])
			.forEach(([k, v]) => {
				// TODO: toggle/remove event listener, if matches /^on/ (or /^off/ maybe?)
				// N.B.: keep v === false || v == 'false' for transpilers changing it to v == '0' || v == 0
				// which is no good, because 0 is no special value for non-boolean attributess. value="0"
				if(v == null || v === false || v == 'false' || v == undefined) {
					node.removeAttribute(k)
				} else if(isRMLEventListener(k, v)) { //if(k.startsWith('on') /* && isFunction((<Observer<any>><unknown>v).next ?? (<Promise<any>>v).then ?? v) */) {
					// addListener(node, <RMLEventName>k.substring(2), v);
					const e = k.replace(/^(rml:)?on/, '$1') as RMLEventName;
					addListener(node, e, v);
				} else {
					const sink: Sink<any> =
						k == 'dataset'
							? DatasetObjectSink :
						k.startsWith('data-')
							? <Sink<T>>DatasetItemPreSink(k.substring(5)) :
						node.tagName == 'FORM'
							? FormElementSink :
						sinkByAttributeName.get(k)
						?? FixedAttributeSink;
						//?? DOMAttributeSink;

					asap(sink(node, k), v); // TODO: use drain()
				}
			});
	}
;
