import { Subject, filter, map } from 'rxjs';
import { korma } from './curry';

describe('korma', () => {

	describe('When no target is provided', () => {

		it('Returns a partially-applied reverse pipeline', async () => {
			const { promise, resolve } = Promise.withResolvers()

			const a = 2;
			const b = 3;
			const target = jest.fn(resolve);
			const stream = new Subject<number>();

			const increment = korma([
				map((x: number) => x + b),
			]);

			const reverseStream = increment(stream);

			stream.subscribe(target);
			reverseStream.next(a);
			await promise;

			return expect(target).toHaveBeenCalledWith(a+b);
		});

		describe('When a pipeline with multiple operators is provided', () => {

			it('Applies all operators correctly', async () => {
				const { promise, resolve } = Promise.withResolvers()

				const a = 2;
				const b = 3;
				const target = jest.fn(resolve);
				const stream = new Subject<number>();

				const increment = korma<number, number>([
					filter(n => !!n),
					map(x => x+b),
					map(x => x),
				]);

				const reverseStream = increment(stream);

				stream.subscribe(target);
				reverseStream.next(a);
				await promise;

				return expect(target).toHaveBeenCalledWith(a+b);
			});

		});

	});

	describe('When a target is provided', () => {

		it('Returns a reverse-piped Observer', async () => {
			const { promise, resolve } = Promise.withResolvers()

			const a = 2;
			const b = 3;
			const target = jest.fn(resolve);
			const stream = new Subject<number>();

			const reverseStream = korma(
				[map((x: number) => x + b)],
				stream,
			);

			stream.subscribe(target);
			reverseStream.next(a);
			await promise;

			return expect(target).toHaveBeenCalledWith(a+b);
		});

		describe('When a pipeline with multiple operators is provided', () => {

			it('Applies all operators correctly', async () => {
				const { promise, resolve } = Promise.withResolvers()

				const a = 2;
				const b = 3;
				const target = jest.fn(resolve);
				const stream = new Subject<number>();

				const reverseStream = korma(
					[
						filter((x: number) => Boolean(x)),
						map((x: number) => x + b),
						map((x: number) => x),
					], stream,
				);

				stream.subscribe(target);
				reverseStream.next(a);
				await promise;

				return expect(target).toHaveBeenCalledWith(a+b);
			});

		});

	});

});
