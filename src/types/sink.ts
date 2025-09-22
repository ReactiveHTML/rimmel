import type { CSSClassName } from "./style";
import type { MaybeFuture } from "./futures";
import type { HTMLContainerElement, HTMLString } from './dom';
import type { FocusableElement } from './rml';
import { AttributeObject, DOMSubtreeObject, SinkBindingConfiguration } from "./internal";

/**
 * The mounted part of a Sink who performs the actual work, e.g.: DOM updates, console.logs, etc.
 * This is always created by a Sink first.
 */
export type SinkFunction = (values?: any) => void;

/**
 * Allowed types of DOM nodes that sinks can work on
 */
export type SinkableNode =
  | Element
  // | HTMLElement
  // | HTMLInputElement
  // | HTMLTextAreaElement
  // | HTMLSelectElement
  // | HTMLButtonElement
  | MathMLElement
  | SVGElement
  | Text
;

/**
 * A module responsible to render data coming from a source
 * @param T The type of HTML element the sink can be applied to
 */
export interface Sink<T extends SinkableNode> extends Function {
  // FIXME: move node as last parameter to facilitate currying
  (node: T, ...args: any[]): SinkFunction;
  // [Symbol.sink]?: string;
}

// TODO: use a Symbol instead of .sink?
export const isSink = (x: any): x is Sink<any> =>
  !!(x?.sink);

export type HTML = MaybeFuture<HTMLString>;

export type TextString = MaybeFuture<string>;

/**
 * A list of possible Sink types, the elements they can be used on and the type of data they can receive
 */
export type SinkElementTypes = {
  'attribute': {
    elements: HTMLElement | SVGElement | MathMLElement;
    types: number | string;
  };
  'checked': {
    elements: HTMLInputElement;
    types: boolean | 'true' | 'checked';
  };
  'class': {
    elements: HTMLElement | SVGElement;
    types: CSSClassName;
  };
  'closed': {
    elements: HTMLDialogElement;
    types: boolean | 'true' | 'closed';
  };
  'content': {
    elements: HTMLContainerElement;
    types: HTMLString;
  };
  'hidden': {
    elements: HTMLElement;
    types: boolean | 'true' | 'false' | 'until-found';
  };
  'textcontent': {
    elements: HTMLElement;
    types: HTMLString;
  };
  'rml:focus': {
    elements: FocusableElement;
    types: boolean ;
  };
  'rml:blur': {
    elements: FocusableElement;
    types: any ;
  };
  'disabled': {
    elements: HTMLButtonElement | HTMLFieldSetElement | HTMLOptGroupElement | HTMLOptionElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement;
    types: boolean | 'true' | 'disabled';
  };
  'mixin': {
    elements: HTMLElement | SVGElement | MathMLElement;
    types: AttributeObject;
  };
  'object': {
    elements: HTMLElement | SVGElement | MathMLElement;
    types: Object;
  };
  'readonly': {
    elements: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    types: boolean | 'true' | 'readonly';
  };
  'removed': {
    elements: HTMLElement | SVGElement | MathMLElement;
    types: boolean | 'true' | 'removed';
  };
  'subtree': {
    elements: HTMLContainerElement | SVGElement | MathMLElement;
    types: DOMSubtreeObject;
  };
  'text': {
    elements: HTMLElement;
    types: string | number;
  };
  'value': {
    elements: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    types: number | string;
  };
};

/**
 * A Sink Specifier that can be used to force a certain type of sink or provide a custom one
 * @param T The type of HTML element the sink can work on
 */
export type ExplicitSink<T extends keyof SinkElementTypes> =
  (source: MaybeFuture<SinkElementTypes[T]['types']>, ...data: any[]) =>
    SinkBindingConfiguration<T extends keyof SinkElementTypes ? SinkElementTypes[T]['elements'] : Element>
;
