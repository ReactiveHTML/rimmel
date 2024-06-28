import {MaybeFuture} from "./futures";
import type {HTMLString} from './dom';
import { AttributeObject, SinkBindingConfiguration } from "./internal";

/**
 * The mounted part of a Sink who performs the actual work, e.g.: DOM updates, console.logs, etc.
 * This is always created by a Sink first.
 */
export type SinkFunction = (values?: any) => void;

type ElementType =
    | Element
    | HTMLElement
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | HTMLButtonElement
;

/**
 * A module responsible to render data coming from a source
 * @param T The type of HTML element the sink can be applied to
 */
export interface Sink<T extends ElementType> extends Function {
    (node: T, ...args: any[]): SinkFunction;
    //(...args: [...any[], node: T]): SinkFunction;
    // [Symbol.sink]?: string;
}

// TODO: use a Symbol?
export const isSink = (x: any): x is Sink<any> => !!(x?.sink);

/**
 * A list of possible Sink types, the elements they can be used on and the type of data they can receive
 */
export type SinkElementTypes = {
    'attribute': {
        elements: HTMLElement;
        types: number | string;
    };
    'checked': {
        elements: HTMLInputElement;
        types: boolean | 'true' | 'checked';
    };
    'closed': {
        elements: HTMLDialogElement;
        types: boolean | 'true' | 'closed';
    };
    'content': {
        elements: HTMLElement;
        types: HTMLString;
    };
    'disabled': {
        elements: HTMLInputElement | HTMLButtonElement | HTMLFieldSetElement | HTMLOptGroupElement | HTMLOptionElement | HTMLSelectElement | HTMLTextAreaElement;
        types: boolean | 'true' | 'disabled';
    };
    'mixin': {
        elements: HTMLElement;
        types: AttributeObject;
    };
    'readonly': {
        elements: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        types: boolean | 'true' | 'readonly';
    };
    'text': {
        elements: HTMLElement;
        types: string;
    };
    'value': {
        elements: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        types: number | string;
    };
};

// /**
//  * A user-specified sink
//  * @param T The type of HTML element the sink can work on
//  */
// export type ExplicitSink<T extends keyof SinkElementTypes> =
// 		(source: MaybeFuture<SinkElementTypes[T]['types']>) =>
// 			Sink<T extends keyof SinkElementTypes
// 				? SinkElementTypes[T]['elements']
// 				: Element>;


/**
 * An explicitly specified sink, or otherwise a user-defined one.
 * @param T The type of HTML element the sink can work on
 */
export type ExplicitSink<T extends keyof SinkElementTypes> =
		(source: MaybeFuture<SinkElementTypes[T]['types']>) =>
            SinkBindingConfiguration<T extends keyof SinkElementTypes ? SinkElementTypes[T]['elements'] : Element>;
