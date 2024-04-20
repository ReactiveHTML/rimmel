import { MaybeFuture } from "./futures";

type ValueOf<T> = T extends HTMLInputElement ? string | number :
    T extends HTMLOptionElement ? string :
    T extends HTMLTextAreaElement ? string :
    T extends HTMLProgressElement ? number :
    T extends HTMLButtonElement ? string :
    string // Default to string for other cases
;

/**
 * An attribute object that represents the "value" of different HTML elements.
 */
export type ValueAttribute<T extends HTMLElement> = {
    value: MaybeFuture<ValueOf<T>>;
};
