import type { Sink } from "../types/sink";

const disabled = 'disabled';
export const DisabledSink: Sink<HTMLButtonElement | HTMLFieldSetElement | HTMLOptGroupElement | HTMLOptionElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement> = (node: Element) => {
    // const set = node.setAttribute.bind(node, disabled, disabled);
    // const unset = node.removeAttribute.bind(node, disabled);
    return (value: unknown) => {
		node.disabled = value;
        //value
        //    ? set()
        //    : unset();
    };
};

