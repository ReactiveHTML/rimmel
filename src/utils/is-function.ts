export const isFunction = (fn: unknown): fn is Function =>
    fn instanceof Function;
