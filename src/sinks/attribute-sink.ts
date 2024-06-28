import { isFunction } from '../utils/is-function';
import { MaybeFuture, Observable, Observer } from '../types/futures';
import { Sink, SinkFunction } from '../types/sink';
import { RMLEventAttributeName } from '../types/dom';
import { AnySink } from './any-sink';
import { AttributeObject } from '../types/internal';

type EventListenerDeclarationWithOptions = [Function, EventListenerOptions];

const isSource = (k: RMLEventAttributeName, v: MaybeFuture<unknown> | EventListenerObject | EventListenerDeclarationWithOptions) =>
    k.substring(0, 2) == 'on' && (isFunction((<Observer<unknown>>v).next ?? v) || isFunction((<EventListenerDeclarationWithOptions>v)[0]));


export const FixedAttributeSink: Sink<Element> = (node: Element, attributeName: string) =>
    data => node.setAttribute(attributeName, data)
    //node.setAttribute.bind(node, attributeName)
;

export const FixedAttributePreSink = (attributeName: string): Sink<Element> =>
    (node: Element) =>
        data => node.setAttribute(attributeName, data)
        // node.setAttribute.bind(node, attributeName)
;


export const DOMAttributeSink: Sink<Element> =
	(node: Element, attributeName: string) =>
		(value: boolean) => node[attributeName] = !!value
;

/**
 * A sink for all boolean DOM attributes (the ones that can be set via node[attr] = value
 * which also support "false" for disabled
 **/
export const DOMAttributePreSink = (attributeName: string): Sink<Element> =>
    (node: Element) =>
        (value: boolean) => node[attributeName] = value
;



export const AttributeObjectSink: Sink<Element> = (node: Element) =>
    (attributeobject: AttributeObject) => {
        (Object.entries(attributeobject) ?? [])
            .forEach(([k, v]) =>
                // TODO: toggle/remove event listener, if matches /^on/ (or /^off/ maybe?)
                // N.B.: keep v === false || v == 'false' for transpilers changing it to v == '0' || v == 0
                v == null || v === false || v == 'false' || typeof v == 'undefined' ? node.removeAttribute(k)
                : k.startsWith('on') && isFunction(v.next ?? v.then ?? v) ? node.addEventListener(k.substring(2), (v.next ?? v.then)?.bind(v) ?? v, {capture: true})
                : AnySink(node, k, v)
            );
    };

    // if(k.substring(0, 2) == 'on' && typeof (v.next ?? v) == 'function') {
    //     console.log('EVENTXXXXX', k, v)
    //     node.addEventListener(k.substring(2), v.next?.bind(v) ?? v, {capture: true})
    // }
