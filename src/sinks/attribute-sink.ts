import { isFunction } from '../utils/is-function';
import { DOMSinks } from '.';
import { MaybeFuture, Observable, Observer } from '../types/futures';
import { Sink, SinkFunction } from '../types/sink';
import { RMLEventAttributeName } from '../types/dom';

export const AttributeSink: Sink<HTMLElement> = (node: HTMLElement, attributeName: string) => {
    const setAttribute = node.setAttribute.bind(node, attributeName);
    return (value: string) => {
        setAttribute(value);
    };
};

const asap = (fn: SinkFunction, arg: MaybeFuture<unknown>) => {
    (<Observable<unknown>>arg).subscribe?.(fn) ??
    (<Promise<unknown>>arg).then?.(fn) ??
    fn(arg);
};

const SinkAnything = (node: HTMLElement, sinkType: string, v: MaybeFuture<unknown>) => {
    // Fall back to 'attribute' unless it's any of the others
    const sink = DOMSinks.get(sinkType) ?? AttributeSink;
    asap(sink(node, sinkType), v);
};

type EventListenerDeclarationWithOptions = [Function, EventListenerOptions];

const isSource = (k: RMLEventAttributeName, v: MaybeFuture<unknown> | EventListenerObject | EventListenerDeclarationWithOptions) =>
    k.substring(0, 2) == 'on' && (isFunction((<Observer<unknown>>v).next ?? v) || isFunction((<EventListenerDeclarationWithOptions>v)[0]));

export const AttributesSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (attributeset: MaybeFuture<Record<string, unknown>>) => {
        (Object.entries(attributeset) ?? [])
            .forEach(([k, v]) =>
                // TODO: toggle/remove event listener, if matches /^on/
                v == false || typeof v == 'undefined' ? node.removeAttribute(k)
                : k.substring(0, 2) == 'on' && isFunction(v.next ?? v) ? node.addEventListener(k.substring(2), v.next?.bind(v) ?? v, {capture: true})
                : SinkAnything(node, k, v)
            );
    };

    // if(k.substring(0, 2) == 'on' && typeof (v.next ?? v) == 'function') {
    //     console.log('EVENTXXXXX', k, v)
    //     node.addEventListener(k.substring(2), v.next?.bind(v) ?? v, {capture: true})
    // }
