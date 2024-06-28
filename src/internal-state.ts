import { RMLEventName } from "./types/dom";
import { Subscription } from "./types/futures";
import { BindingConfiguration, SourceBindingConfiguration } from "./types/internal";

export const waitingElementHanlders = <Map<string, BindingConfiguration[]>>new Map();
// TODO: Test and verify with WeakRef/FinalizationRegistry
export const delegatedEventHandlers: WeakMap<Element, SourceBindingConfiguration<RMLEventName>[]> = new WeakMap();
export const subscriptions: Map<Element, Subscription[]> = new Map();
export const delegatedEvents = new Set();
