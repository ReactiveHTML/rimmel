import { sinkByAttributeName } from '.';
import { MaybeFuture, Observable } from '../types/futures';
import { SinkFunction } from '../types/sink';
import { DOMAttributeSink } from './attribute-sink';
import { DatasetItemPreSink, DatasetObjectSink } from './dataset-sink';
import { asap } from '../lib/drain';

/**
 * A generic sink for anything that can be sinked to an Element
**/
export const AnySink = (node: HTMLElement | SVGElement | MathMLElement, sinkType: string, v: MaybeFuture<unknown>) => {
    // Fall back to 'attribute' unless it's any of the others
    // when someone emits an object called 'dataset' they mean
    // a dataset kvp for a DatasetObjectSink
    const sink =
        sinkType == 'dataset' ? DatasetObjectSink
        :  sinkType.startsWith('data-') ? DatasetItemPreSink(sinkType.substring(5))
        : sinkByAttributeName.get(sinkType)
        ?? DOMAttributeSink;

    asap(sink(node, sinkType), v); // TODO: use drain()
};
