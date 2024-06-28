import type { Source } from '../types/source';

import { Subject, map } from 'rxjs';

export const EventData: Source<InputEvent, string | null> = (target: RMLTemplateExpressions.SourceExpression<char>, attr?: string = 'data') => {
    const source = new Subject<InputEvent>();
    source.pipe(
        map(e => e[attr]),
    ).subscribe(target);
    return source;
};

export type Coords = [number, number];

export const PointerXY: Source<MouseEvent, Coords> = target => {
    const source = new Subject<MouseEvent>();
    source.pipe(
        map(e => <Coords>[e.clientX, e.clientY]),
    ).subscribe(target);
    return source;
};

export const LastTouchXY: Source<TouchEvent, Coords> = target => {
    const source = new Subject<TouchEvent>();
    source.pipe(
        map(e => {
            const t = [...e.touches].at(-1);
            return <Coords>[t?.clientX, t?.clientY];
        }),
    ).subscribe(target);
    return source;
};
