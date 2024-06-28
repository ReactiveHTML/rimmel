import { sinkByAttributeName } from '.';
import { MaybeFuture } from '../types/futures';
import { DOMAttributeSink, FixedAttributeSink } from './attribute-sink';
import { DatasetObjectSink } from './dataset-sink';

export const asap = (fn: SinkFunction, arg: MaybeFuture<unknown>) => {
    (<Observable<unknown>>arg).subscribe?.(fn) ??
    (<Promise<unknown>>arg).then?.(fn) ??
    fn(arg);
};

export const AnySink = (node: Element, sinkType: string, v: MaybeFuture<unknown>) => {
    // Fall back to 'attribute' unless it's any of the others
    // when someone emits an object called 'dataset' they mean
    // a dataset kvp for a DatasetObjectSink
    const sink = sinkType == 'dataset'
        ? DatasetObjectSink
        : sinkByAttributeName.get(sinkType) ?? DOMAttributeSink;

    asap(sink(node, sinkType), v); // TODO: use drain()
};
