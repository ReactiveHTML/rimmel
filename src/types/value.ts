import { HTMLFieldElement } from "./dom";
import { MaybeFuture } from "./futures";

type ValueOf<T> = T extends HTMLInputElement ? string | number :
    T extends HTMLOptionElement ? string :
    T extends HTMLTextAreaElement ? string :
    T extends HTMLProgressElement ? number :
    T extends HTMLButtonElement ? string :
    string // Default to string for other cases
;

/**
 * An attribute object that represents the "value" of HTML elements that can have one.
 */
export type ValueAttribute<T extends HTMLFieldElement> = {
    value: MaybeFuture<ValueOf<T>>;
};
