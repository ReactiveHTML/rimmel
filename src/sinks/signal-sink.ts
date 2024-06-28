import { BehaviorSubject } from 'rxjs';

export const Signal = <T>(initial: T) => {
    const state = new BehaviorSubject<T>(initial);

    const sink = new Proxy(state, {
        get(target, prop, receiver) {
            if (prop === Symbol.toPrimitive || prop === 'valueOf' || prop === 'toString') {
                return () => state.value;
            } else {
                return Reflect.get(target, prop, receiver);
            }
        }
    });

    const emitter = state.next.bind(state);

    return [sink, emitter] as const;
};
