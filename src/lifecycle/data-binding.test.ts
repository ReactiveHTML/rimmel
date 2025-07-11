import { addRef } from "../parser/parser";
import { MockElement } from "../test-support";
import { RMLEventName, Sink } from "../types";
import { SinkBindingConfiguration, SourceBindingConfiguration } from "../types/internal";
import { Rimmel_Bind_Subtree } from "./data-binding";
import * as addListenerModule from "../lib/addListener";
import { waitingElementHandlers } from "../internal-state";
import { beforeEach, expect, mock, describe, it } from "bun:test";
import { REF_TAG, RESOLVE_ATTRIBUTE } from "../constants";
import { Subject } from "rxjs";
import { RenderingScheduler } from "../types/schedulers";

// Mock the addListener module
mock.module("../lib/addListener", () => ({
    addListener: mock(() => { }),
}));

describe("Data Binding Lifecycle", () => {
    describe("Event Sources", () => {
        const mockListenerFunction = () => { };
        const mockListenerObserver = new Subject<Event>();
        const addListenerSpy = (addListenerModule.addListener as unknown as ReturnType<typeof mock>);

        beforeEach(() => {
            addListenerSpy.mockClear();
            waitingElementHandlers.clear();
        });

        it("uses addSource to register event listener functions", () => {
            const mockElement = MockElement();
            const eventName: RMLEventName = "click";

            const sourceBindingConfiguration = {
                type: "source",
                eventName: "click",
                listener: mockListenerFunction,
            } as SourceBindingConfiguration<RMLEventName>;

            const ref = `${REF_TAG}0`;
            mockElement.setAttribute(RESOLVE_ATTRIBUTE, ref);
            addRef(ref, sourceBindingConfiguration);

            Rimmel_Bind_Subtree(mockElement);

            expect(addListenerSpy).toHaveBeenCalledWith(mockElement, eventName, mockListenerFunction, undefined);
        });

        it("uses addSource to register event listener observers", () => {
            const mockElement = MockElement();
            const eventName: RMLEventName = "click";

            const sourceBindingConfiguration = {
                type: "source",
                eventName: "click",
                listener: mockListenerObserver,
            } as SourceBindingConfiguration<RMLEventName>;

            const ref = `${REF_TAG}0`;
            mockElement.setAttribute(RESOLVE_ATTRIBUTE, ref);
            addRef(ref, sourceBindingConfiguration);

            Rimmel_Bind_Subtree(mockElement);

            expect(addListenerSpy).toHaveBeenCalledWith(mockElement, eventName, mockListenerObserver, undefined);
        });

    });

    describe('Data Sinks', () => {

        describe('Promises', () => {
            it('should bind a promise to a sink', () => {
                const mockElement = MockElement();
                const promise = Promise.resolve("Hello World");

                const ref = `${REF_TAG}0`;
                mockElement.setAttribute(RESOLVE_ATTRIBUTE, ref);
                addRef(ref, {
                    type: 'sink',
                    t: 'textContent',
                    source: promise,
                    sink: (el) => (value) => { el.textContent = value; },
                } as SinkBindingConfiguration<MockElement>);

                Rimmel_Bind_Subtree(mockElement);

                return promise.then(() => {
                    expect(mockElement.textContent).toBe("Hello World");
                });
            });

        });

        describe('Observables', () => {
            it('should bind an observable to a sink', () => {
                const mockElement = MockElement();
                const observable = new Subject<string>();

                const ref = `${REF_TAG}0`;
                mockElement.setAttribute(RESOLVE_ATTRIBUTE, ref);
                addRef(ref, {
                    type: 'sink',
                    t: 'textContent',
                    source: observable,
                    sink: (el) => (value) => { el.textContent = value; },
                } as SinkBindingConfiguration<MockElement>);

                Rimmel_Bind_Subtree(mockElement);

                observable.next("Hello Observable");
                expect(mockElement.textContent).toBe("Hello Observable");

                observable.next("Updated Observable");
                expect(mockElement.textContent).toBe("Updated Observable");
            });

        });

        describe('Schedulers', () => {
        });

    });

});

describe('removeListener', () => {

    describe('When an element is removed', () => {
        it('unsubscribes observable listeners', () => {
            const mockElement = MockElement();
            const observable = new Subject<Event>();

            const ref = `${REF_TAG}0`;
            mockElement.setAttribute(RESOLVE_ATTRIBUTE, ref);
            addRef(ref, {
                type: 'source',
                eventName: 'click',
                listener: observable,
            } as SourceBindingConfiguration<RMLEventName>);

            Rimmel_Bind_Subtree(mockElement);

            // Simulate element removal
            mockElement.remove();

            // Expect the observable to have no subscribers
            expect(observable.observers.length).toBe(0);
        });

    });

});
