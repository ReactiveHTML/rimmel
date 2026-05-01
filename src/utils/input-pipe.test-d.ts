import { expectType } from 'tsd';
import { map } from 'rxjs';

import type { Observer } from '../types/futures';
import { inputPipe } from './input-pipe';
import { korma } from './curry';

type InputObserver<I> = Observer<I> & { next: (value: I) => void };

const stringLength = inputPipe<Event, string, number>(
	map((event: Event) => (event.target as HTMLInputElement).value),
	map((value: string) => value.length),
);

expectType<(target: ((value: number) => void) | Observer<number> | undefined) => InputObserver<Event>>(stringLength);

const curried = korma<Event, string, number>([
	map((event: Event) => (event.target as HTMLInputElement).value),
	map((value: string) => value.length),
]);

expectType<(destination: ((value: number) => void) | Observer<number> | undefined) => InputObserver<Event>>(curried);
