import { DOMSinks } from '.';
import { CSSDeclaration } from '../types/css';
import { MaybeFuture } from '../types/futures';

export const attributeSink = (node: HTMLElement, attributeName: string) =>
    (value: string) => {
        node.setAttribute(attributeName, value);
    };

const setClassNowOrLater = (node: HTMLElement, v: MaybeFuture<ClassName | ClassRecord>) => {
    v.subscribe?.(v=>setClassX(node, v)) ??
    v.then?.(v=>setClassX(node, v)) ??
    setClassX(node, v);
};

export const attributesSink = (node: HTMLElement) =>
    (attributeset: MaybeFuture<CSSDeclaration>) => {
        (Object.entries(attributeset) ?? [])
            .forEach(([k, v]) =>
                typeof v == 'undefined' ? node.removeAttribute(k) // TODO: toggle/remove event listener, if matches /^on/
                : typeof v.subscribe == 'function' ? v.subscribe((DOMSinks.get(k) || attributeSink)(node, k))
                : typeof v.then == 'function' ? v.then((DOMSinks.get(k) || attributeSink)(node, k))
                : k == 'class' ? (v.then ? v.then(v=>setClassX(node, v)) : v.subscribe ? v.subscribe(v=>setClassX(node, v)) : setClassX(node, v))
                : k == 'style' ? setStyles(node, v)
                : k.substr(0, 2) == 'on' && typeof (v.next || v) == 'function' ? node.addEventListener(k.replace(/^on/, ''), v.next ? v.next.bind(v) : v, {capture: true})
                : k == 'value' ? node.value = v
                : node.setAttribute(k, v)
            );
    };
