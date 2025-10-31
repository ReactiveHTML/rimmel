import { MockElement } from '../test-support';
import { ClassObjectSink, ToggleClassSink } from './class-sink';

describe('Class Sink', () => {

	describe('Given a class string', () => {

		it('sets className on sink', () => {
			const el = MockElement({ className: 'class1 class2 class3' });
			const sink = ClassObjectSink(<HTMLElement>el);

			sink('class1');
			expect(el.className).toEqual('class1');
		});

		it('clears classes for empty strings on sink', () => {
			const el = MockElement({ className: 'class1 class2 class3' });
			const sink = ClassObjectSink(<HTMLElement>el);

			sink({
				class1: false,
				class2: 0,
				class3: '',
			});
			expect(el.className).toEqual('');
		});

	});


	describe('Given a class object', () => {

		describe('when a property of the object is a present value', () => {

			it('sets classes for truthy attributes on sink', () => {
				const el = MockElement();
				const sink = ClassObjectSink(<HTMLElement>el);

				sink({
					class1: true,
					class2: 1,
					class3: 'yes!',
				});
				expect(el.className).toContain('class1');
				expect(el.className).toContain('class2');
				expect(el.className).toContain('class3');
			});

			it('clears classes for falsy attributes on sink', () => {
				const el = MockElement({ className: 'class1 class2 class3' });
				const sink = ClassObjectSink(<HTMLElement>el);
				expect(el.className).toContain('class1');
				expect(el.className).toContain('class2');
				expect(el.className).toContain('class3');

				sink({
					class1: false,
					class2: 0,
					class3: '',
				});
				expect(el.className).not.toContain('class1');
				expect(el.className).not.toContain('class2');
				expect(el.className).not.toContain('class3');
			});

			it('should not add class when value is false', () => {
				const el = MockElement();
				const sink = ClassObjectSink(<HTMLElement>el);

				sink({
					dotted: false,
				});

				expect(el.className).not.toContain('dotted');
				expect(el.className).toEqual('');
			});

		});

		describe('when a property of the object is a future value', () => {

			describe('when it resolves/emits false', () => {

				it('should not add a class corresponding to the property name', async () => {
					const el = MockElement();
					const sink = ClassObjectSink(<HTMLElement>el);

					const dottedPromise = Promise.resolve(false);
					sink({
						dotted: dottedPromise,
					});

					await dottedPromise;

					expect(el.className).not.toContain('dotted');
					expect(el.className).toEqual('');
				});

			});

			describe('when it resolves/emits true', () => {

				it('should add a class corresponding to the property name', async () => {
					const el = MockElement();
					const sink = ClassObjectSink(<HTMLElement>el);

					const activePromise = Promise.resolve(true);
					sink({
						active: activePromise,
					});

					await activePromise;

					expect(el.className).toContain('active');
				});

			});

		});

	});

});

describe('Class Toggle Sink', () => {

	describe('Given a class object', () => {

		it('sets classes for truthy value on sink', () => {
			const el = MockElement();
			const sink = ToggleClassSink('class1')(<HTMLElement>el);

			sink(true);
			expect(el.className).toContain('class1');
		});

		it('clears classes for falsy values on sink', () => {
			const el = MockElement({ className: 'class1' });
			const sink = ToggleClassSink('class1')(<HTMLElement>el);

			sink(false);
			expect(el.className).not.toContain('class1');
		});

	});

});


//////////////////////////////////////

// it('sets classes for properties set to true on sink', () => {
//     const el = MockElement();
//     const sink = ClassObjectSink(<HTMLElement>el);

//     sink({
//         class1: true,
//     });
//     expect(el.className).toContain('class1');
// });

// it('clears classes for properties set to false on sink', () => {
//     const el = MockElement({ className: 'class1 class2 class3' });
//     const sink = ClassObjectSink(<HTMLElement>el);
//     sink({
//         class1: false,
//     });
//     expect(el.className).not.toContain('class1');
//     expect(el.className).toContain('class2');
//     expect(el.className).toContain('class3');
// });

// it('sets classes for properties set to 1 on sink', () => {
//     const el = MockElement();
//     const sink = ClassObjectSink(<HTMLElement>el);

//     sink({
//         class1: 1,
//     });
//     expect(el.className).toContain('class1');
// });

// it('clears classes for properties set to -1 on sink', () => {
//     const el = MockElement({ className: 'class1 class2 class3' });
//     const sink = ClassObjectSink(<HTMLElement>el);

//     sink({
//         class1: -1,
//     });
//     expect(el.className).not.toContain('class1');
//     expect(el.className).toContain('class2');
//     expect(el.className).toContain('class3');
// });

// it('toggles classes for properties set to 0 on sink', () => {
//     const el = MockElement({ className: 'class1 class2 class3' });
//     const sink = ClassObjectSink(<HTMLElement>el);
//     sink({
//         class1: 0,
//     });
//     expect(el.className).not.toContain('class1');
//     sink({
//         class1: 0,
//     });
//     expect(el.className).toContain('class1');
// });
