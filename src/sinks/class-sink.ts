import type { CSSClassName } from "../types/style";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

import { SINK_TAG } from "../constants";
import { asap } from "../lib/drain";

export type ClassRecord = Record<string, string>;
export type ClassName = string;
export type ElementsSupportingClass = Record<string, string>;

export const ToggleClassSink = (className: ClassName): Sink<HTMLElement | SVGElement> =>
  (node: HTMLElement | SVGElement) =>
    node.classList.toggle.bind(node.classList, className)
;

export const ClassNameSink: Sink<HTMLElement> = (node: HTMLElement) =>
  (str: CSSClassName) =>
    node.className = str
;

export const ClassObjectSink: Sink<Element> = (node: Element) => {
  const cl = node.classList;
  const set = (str: string) => node.className = str;
  const add = cl.add.bind(cl);
  const remove = cl.remove.bind(cl);
  const toggle = cl.toggle.bind(cl);

  return (name: ClassName | ClassRecord | ((ClassName | ClassRecord)[])) => {
    typeof name == 'string'
      ? name.includes(' ')
        ? set(name)
        : add(name)
      // FIXME: is it safe to assume it's an object, at this point?
      : (<(ClassName | ClassRecord)[]>[]).concat(name).forEach(obj => Object.entries(obj)
          // TODO: support 3-state with toggle
          .forEach(([k, v]) => asap(v ? add : remove, k))
        )
  };
};

//////////////////////////
export const ExperimentalClassObjectSink: Sink<Element> = (node: Element) => {
  const cl = node.classList;
  const add = cl.add.bind(cl);
  const remove = cl.remove.bind(cl);
  const toggle = cl.toggle.bind(cl);

  const actions = new Map<string | number | boolean | undefined, (name: ClassName) => void>([
    [true, add],
    [false, remove],
    [undefined, remove],
    [-1, remove],
    [0, toggle],
    [NaN, toggle],
    [1, add],
  ]);

  return (name: ClassName | ClassRecord) => {
    typeof name == 'string'
      ? add(name)
      // FIXME: is it safe to assume it's an object, at this point?
        : Object.entries(name ?? {})
        // .forEach(([k, v]) => v ? add(k) : remove(k));
        .forEach(([k, v]) => actions.get(v)?.(k));
  };

};

/**
 * A specialised sink to toggle individual classes on a given element
 * @description Will toggle the specified class name on the specified element, whenever the source emits. The actual value of the source will be ignored, as it's the emissions which will cause the class toggling.
 * @param source A present or future string
 * @param className The class name to toggle
 * @returns RMLTemplateExpression A template expression for the "className" attribute
 * @example <div class="${ClassName(stringPromise)}">
 * @example <div class="${ClassName(stringObservable)}">
**/
export const ToggleClass: ExplicitSink<'class'> = (source: RMLTemplateExpressions.Any, className: CSSClassName) =>
    <SinkBindingConfiguration<HTMLElement | SVGElement>>({
        type: SINK_TAG,
        source,
        sink: ToggleClassSink(className),
    })
;

/**
 * A specialised sink for the "className" HTML attribute
 * @description Will set the whole className of an element to the string emitted by the source
 * @param source A present or future string
 * @returns RMLTemplateExpression A template expression for the "className" attribute
 * @example <div class="${ClassName(stringPromise)}">
 * @example <div class="${ClassName(stringObservable)}">
**/
export const ClassName: ExplicitSink<'class'> = (source: RMLTemplateExpressions.ClassName) =>
    <SinkBindingConfiguration<HTMLElement | SVGElement>>({
        type: SINK_TAG,
        source,
        sink: ClassNameSink,
    })
;
