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

// TODO: it's a dupe, extract it out...
const setStyle = (node: HTMLElement, kvp: CSSDeclaration) => {
    const style = node.style;
    Object.entries(kvp)
        .forEach(([k, v]) => style[k] = v);
}

const setClassX = (a: any, b: any) => {
    console.log('TODO');    
}

export const attributesSink = (node: HTMLElement) =>
    (attributeset: MaybeFuture<CSSDeclaration>) => {
        (Object.entries(attributeset) ?? [])
            .forEach(([k, v]) => {
                return typeof v == 'undefined' ? node.removeAttribute(k) // TODO: toggle/remove event listener, if matches /^on/
                : k.substring(0, 2) == 'on' && typeof (v.next ?? v) == 'function' ? node.addEventListener(k.substring(2), v.next?.bind(v) ?? v, {capture: true})
                : typeof v.subscribe == 'function' ? v.subscribe((DOMSinks.get(k) || attributeSink)(node, k))
                : typeof v.then == 'function' ? v.then((DOMSinks.get(k) || attributeSink)(node, k))
                : k == 'class' ? (v.then ? v.then(v=>setClassX(node, v)) : v.subscribe ? v.subscribe(v=>setClassX(node, v)) : setClassX(node, v))
                : k == 'style' ? setStyle(node, v)
                : k == 'value' ? (<HTMLInputElement>node).value = v
                : node.setAttribute(k, v)
            });
    };


    // if(k.substring(0, 2) == 'on' && typeof (v.next ?? v) == 'function') {
    //     console.log('EVENTXXXXX', k, v)
    //     node.addEventListener(k.substring(2), v.next?.bind(v) ?? v, {capture: true})
    // }
