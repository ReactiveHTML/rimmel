import type { Sink } from "../types/sink";

export type ClassRecord = Record<string, string>;
export type ClassName = string;

export const ToggleClassSink = (node: Element, className: ClassName) =>
    node.classList.toggle.bind(node.classList, className);

// // set classes from an object {class-name: boolean}
// code-size optimised, but not as fast as classSink
// export const setClasses = (node: Element, classset: ClassRecord) =>
//     Object.entries(classset).forEach(([k, v]) =>
//         node.classList[v?'add':'remove'](k));


// enum setToggle {
//     add,
//     remove,
//     toggle,
// }

export const ClassObjectSink: Sink<Element> = (node: Element) => {
    const cl = node.classList;
    const add = cl.add.bind(cl);
    const remove = cl.remove.bind(cl);
    const toggle = cl.toggle.bind(cl);

    return (name: ClassName | ClassRecord) => {
        typeof name == 'string'
            ? add(name)
            // FIXME: is it safe to assume it's an object, at this point?
            : Object.entries(name ?? {})
                // TODO: support 3-state with toggle
                .forEach(([k, v]) => v ? add(k) : remove(k));
    };
};



//////////////////////////
export const ExperimentalClassObjectSink: Sink<Element> = (node: Element) => {
    const cl = node.classList;
    const add = cl.add.bind(cl);
    const remove = cl.remove.bind(cl);
    const toggle = cl.toggle.bind(cl);

    const actions = new Map<number | boolean | undefined, (name: ClassName) => void>([
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
                .forEach(([k, v]) => actions[v](k));
    };

};

