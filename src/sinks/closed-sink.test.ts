import { MockElement, expectSinkBindingConfiguration } from '../test-support';
import { Closed, ClosedSink, CLOSED_SINK_TAG } from './closed-sink';

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

	describe('Given a true', () => {

		it('closes the dialog on sink', () => {
			const el: Partial<HTMLDialogElement> = MockDialogElement();
			const sink = ClosedSink(el as HTMLInputElement);

			sink(true);
			expect(el.close).toHaveBeenCalled();
		});

	});

	describe('Given a false', () => {

		it('closes the dialog on sink', () => {
			const el: Partial<HTMLDialogElement> = MockDialogElement();
			const sink = ClosedSink(el as HTMLInputElement);

			sink(true);
			expect(el.close).toHaveBeenCalled();
		});

	});

	describe('Given a Closed explicit sink', () => {

		// it('creates sink binding configuration with correct properties', () => {
		// 	const source = true;
		// 	const config = Closed(source);

		// 	expectSinkBindingConfiguration(config, SINK_TAG, CLOSED_SINK_TAG, source, ClosedSink);
		// });

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

		it('closes dialog when sink is invoked', () => {
			const dialog = MockDialogElement();
			const config = Closed(true);
			const sink = config.sink(dialog);

			sink();

			expect(dialog.close).toHaveBeenCalledTimes(1);
		});

	});

	describe('Given edge cases', () => {

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

		// it('returns correct sink binding configuration type', () => {
		// 	const source = true;
		// 	const config = Closed(source);

		// 	expectSinkBindingConfiguration(config, SINK_TAG, CLOSED_SINK_TAG, source, ClosedSink);
		// });

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

			sink1();
			sink2();

			expect(dialog1.close).toHaveBeenCalledTimes(1);
			expect(dialog2.close).toHaveBeenCalledTimes(1);
		});

	});

});
