import type { RMLEventName } from "./types/dom";
import type { Subscription } from "./types/futures";
import type { BindingConfiguration, SourceBindingConfiguration } from "./types/internal";

import { REF_TAG } from './constants';

export const waitingElementHanlders = <Map<string, BindingConfiguration[]>>new Map();
// TODO: Test and verify with WeakRef/FinalizationRegistry
export const delegatedEventHandlers: WeakMap<Element, SourceBindingConfiguration<RMLEventName>[]> = new WeakMap();
export const subscriptions: Map<Node, Subscription[]> = new Map();
export const delegatedEvents = new Set();

// FIXME: add a unique prefix to prevent collisions with different dupes of the library running in the same context/app
export const state = {
	refCount: 0,
}

export const newRef = () => REF_TAG +state.refCount++;
export const lastRef = () => REF_TAG +state.refCount;

