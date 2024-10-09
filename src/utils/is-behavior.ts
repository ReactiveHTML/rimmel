import { type BehaviorSubject } from "../types/futures";

export const isBehavior = (x: unknown): x is BehaviorSubject<unknown> =>
    !! (<BehaviorSubject<unknown>>x).value;
