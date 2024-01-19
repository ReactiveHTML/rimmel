import { Subscription } from "./types/futures";
import { Handler } from "./types/internal";
import { HTMLEventName } from "./types/dom";

export const waitingElementHanlders: Map<string, Handler[]> = new Map();
// TODO: Test and verify with WeakRef/FinalizationRegistry
export const handlers: WeakMap<HTMLElement, Handler[]> = new WeakMap();
export const subscriptions: Map<HTMLElement, Subscription[]> = new Map();
export const delegatedEvents = new Set();
