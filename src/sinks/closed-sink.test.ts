import { MockElement } from '../test-support';
import { Closed, ClosedSink, CLOSED_SINK_TAG } from './closed-sink';
import { SINK_TAG } from '../constants';

// Mock HTMLDialogElement for testing
interface MockDialogElement extends HTMLElement {
    open: boolean;
    close: jest.MockedFunction<() => void>;
    show: jest.MockedFunction<() => void>;
    showModal: jest.MockedFunction<() => void>;
}

const MockDialogElement = (props?: Record<string, any>): MockDialogElement => {
    const closeSpy = jest.fn();
    const showSpy = jest.fn();
    const showModalSpy = jest.fn();
    
    return <MockDialogElement>{
        ...MockElement(props),
        open: false,
        close: closeSpy,
        show: showSpy,
        showModal: showModalSpy,
        tagName: 'DIALOG',
        ...props,
    };
};

describe('Closed Sink', () => {

    describe('Given a ClosedSink function', () => {

        it('creates a sink that calls dialog.close() when called', () => {
            const dialog = MockDialogElement();
            const sink = ClosedSink(dialog);

            expect(typeof sink).toBe('function');
            expect(dialog.close).not.toHaveBeenCalled();

            // Both true and false result in dialog.close() being called
            sink(true);
            expect(dialog.close).toHaveBeenCalledTimes(1);

            sink(false);
            expect(dialog.close).toHaveBeenCalledTimes(2);
        });

        describe('when truthy values are provided', () => {
            it('calls dialog.close() when given true', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(true);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given number 1', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(1);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given non-empty string', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink('string');

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given object', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink({});

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given array', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink([]);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });
        });

        describe('when falsy values are provided', () => {
            it('calls dialog.close() when given false', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(false);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given number 0', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(0);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given empty string', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink('');

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given null', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(null);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('calls dialog.close() when given undefined', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(undefined);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });
        });

        it('binds the close method correctly to dialog element', () => {
            const dialog = MockDialogElement();
            const sink = ClosedSink(dialog);

            sink(true);

            expect(dialog.close).toHaveBeenCalledWith();
            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

    });

    describe('Given a Closed explicit sink', () => {

        it('creates sink binding configuration with correct properties', () => {
            const source = true;
            const config = Closed(source);

            expect(config.type).toBe(SINK_TAG);
            expect(config.t).toBe(CLOSED_SINK_TAG);
            expect(config.source).toBe(source);
            expect(config.sink).toBe(ClosedSink);
        });

        it('preserves source reference in configuration', () => {
            const source = false;
            const config = Closed(source);

            expect(config.source).toBe(source);
        });

        it('handles boolean attribute values', () => {
            const trueConfig = Closed(true);
            const falseConfig = Closed(false);

            expect(trueConfig.source).toBe(true);
            expect(falseConfig.source).toBe(false);
        });

        it('handles promise sources', () => {
            const promiseSource = Promise.resolve(true);
            const config = Closed(promiseSource);

            expect(config.source).toBe(promiseSource);
        });

        it('handles observable sources', () => {
            const { Subject } = require('rxjs');
            const subjectSource = new Subject();
            const config = Closed(subjectSource);

            expect(config.source).toBe(subjectSource);
        });

    });

    describe('Given dialog closing functionality', () => {

        it('closes dialog when sink receives truthy value', () => {
            const dialog = MockDialogElement();
            const config = Closed(true);
            const sink = config.sink(dialog);

            sink(config.source);

            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

        it('closes dialog when sink receives falsy value', () => {
            const dialog = MockDialogElement();
            const config = Closed(false);
            const sink = config.sink(dialog);

            sink(config.source);

            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

        describe('when called multiple times', () => {
            it('calls dialog.close() on each invocation regardless of input value', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                // Each call to sink() results in dialog.close() being called
                sink(true);
                expect(dialog.close).toHaveBeenCalledTimes(1);

                sink(false);
                expect(dialog.close).toHaveBeenCalledTimes(2);

                sink(1);
                expect(dialog.close).toHaveBeenCalledTimes(3);

                sink(0);
                expect(dialog.close).toHaveBeenCalledTimes(4);

                // Note: dialog.close() doesn't take parameters and always closes the dialog
                // There's no "unclose" functionality - each call just triggers close()
            });
        });

    });

    describe('Given boolean attribute value handling', () => {

        it('processes true boolean values', () => {
            const dialog = MockDialogElement();
            const sink = ClosedSink(dialog);

            sink(true);

            expect(dialog.close).toHaveBeenCalledWith();
        });

        it('processes false boolean values', () => {
            const dialog = MockDialogElement();
            const sink = ClosedSink(dialog);

            sink(false);

            expect(dialog.close).toHaveBeenCalledWith();
        });

        describe('when truthy non-boolean values are provided', () => {
            it('processes number 1', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(1);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes non-empty string', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink('string');

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes object', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink({});

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes array', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink([]);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });
        });

        describe('when falsy non-boolean values are provided', () => {
            it('processes number 0', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(0);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes empty string', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink('');

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes null', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(null);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });

            it('processes undefined', () => {
                const dialog = MockDialogElement();
                const sink = ClosedSink(dialog);

                sink(undefined);

                expect(dialog.close).toHaveBeenCalledTimes(1);
            });
        });

    });

    describe('Given future/promise sources', () => {

        it('handles resolved promise sources', async () => {
            const dialog = MockDialogElement();
            const promiseSource = Promise.resolve(true);
            const config = Closed(promiseSource);
            const sink = config.sink(dialog);

            sink(config.source);

            // Wait for promise to resolve
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

        it('handles rejected promise sources', async () => {
            const dialog = MockDialogElement();
            const promiseSource = Promise.reject(new Error('Test error'));
            const config = Closed(promiseSource);
            const sink = config.sink(dialog);

            sink(config.source);

            // Wait for promise to reject
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

    });

    describe('Given observable sources', () => {

        it('handles Subject sources', () => {
            const { Subject } = require('rxjs');
            const subject = new Subject();
            const config = Closed(subject);

            expect(config.source).toBe(subject);
            expect(config.type).toBe(SINK_TAG);
            expect(config.t).toBe(CLOSED_SINK_TAG);
        });

        it('handles BehaviorSubject sources', () => {
            const { BehaviorSubject } = require('rxjs');
            const behaviorSubject = new BehaviorSubject(false);
            const config = Closed(behaviorSubject);

            expect(config.source).toBe(behaviorSubject);
        });

    });

    describe('Given edge cases', () => {

        it('handles empty function calls', () => {
            const dialog = MockDialogElement();
            const sink = ClosedSink(dialog);

            sink();

            expect(dialog.close).toHaveBeenCalledTimes(1);
        });

        it('handles complex object sources', () => {
            const dialog = MockDialogElement();
            const complexSource = { nested: { value: true } };
            const config = Closed(complexSource);

            expect(config.source).toBe(complexSource);
        });

        it('handles array sources', () => {
            const dialog = MockDialogElement();
            const arraySource = [true, false, 1, 0];
            const config = Closed(arraySource);

            expect(config.source).toBe(arraySource);
        });

    });

    describe('Given sink configuration structure', () => {

        it('returns correct sink binding configuration type', () => {
            const source = true;
            const config = Closed(source);

            expect(config).toHaveProperty('type', SINK_TAG);
            expect(config).toHaveProperty('t', CLOSED_SINK_TAG);
            expect(config).toHaveProperty('source', source);
            expect(config).toHaveProperty('sink', ClosedSink);
        });

        it('maintains proper TypeScript types', () => {
            const source = true;
            const config = Closed(source);

            // These should compile without errors if types are correct
            expect(typeof config.type).toBe('string');
            expect(typeof config.t).toBe('string');
            expect(typeof config.sink).toBe('function');
        });

    });

    describe('Given integration scenarios', () => {

        it('works with multiple dialog elements', () => {
            const dialog1 = MockDialogElement();
            const dialog2 = MockDialogElement();
            
            const sink1 = ClosedSink(dialog1);
            const sink2 = ClosedSink(dialog2);

            sink1(true);
            sink2(false);

            expect(dialog1.close).toHaveBeenCalledTimes(1);
            expect(dialog2.close).toHaveBeenCalledTimes(1);
        });

        it('maintains separate close method bindings', () => {
            const dialog1 = MockDialogElement();
            const dialog2 = MockDialogElement();
            
            const sink1 = ClosedSink(dialog1);
            const sink2 = ClosedSink(dialog2);

            sink1(true);
            sink1(false);
            sink2(true);

            expect(dialog1.close).toHaveBeenCalledTimes(2);
            expect(dialog2.close).toHaveBeenCalledTimes(1);
        });

    });

});
