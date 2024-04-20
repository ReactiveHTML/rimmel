import { Subscription } from "./types/futures";
import { Handler } from "./types/internal";

export const waitingElementHanlders = <Map<string, Handler<Element>[]>>new Map();
// TODO: Test and verify with WeakRef/FinalizationRegistry
export const handlers: WeakMap<Element, Handler<Element>[]> = new WeakMap();
export const subscriptions: Map<Element, Subscription[]> = new Map();
export const delegatedEvents = new Set();
