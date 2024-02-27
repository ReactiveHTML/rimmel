import { Sink } from "../types/sink";

export type ClassRecord = Record<string, string>;
export type ClassName = string;

export const toggleClass = (node: HTMLElement, className: ClassName) =>
    (state: Boolean) => (state ? node.classList.add : node.classList.remove)(className);

// set classes from an object {class-name: boolean}
export const setClasses = (node: HTMLElement, classset: ClassRecord) =>
    Object.entries(classset).forEach(([k, v]) => node.classList[v?'add':'remove'](k));

export const classSink: Sink = (node: HTMLElement) => {
    const cl = node.classList;
    const add = cl.add.bind(cl);
    const remove = cl.remove.bind(cl);
    
    return (name: ClassName | ClassRecord) => {
        typeof name == 'string'
            ? add(name)
            // FIXME: is it safe to assume it's an object, at this point?
            : Object.entries(name)
                .forEach(([k, v]) => v ? add(k) : remove(k));
    };
};
