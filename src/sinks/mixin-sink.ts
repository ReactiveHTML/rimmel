import { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import { ExplicitSink } from "../types/sink";
import { AttributeObjectSink } from "./attribute-sink";

import { SINK_TAG } from "../constants";

/**
 * A specialised sink to create a Mixin in the target element. Immediately on mount, if it's a plain object or whenever it emits any data.
 * @param source A present or future DOM Object whose properties and methods will be merged into the target element
 * @returns SinkBindingConfiguration an object that tells Rimmel what to mount where and how
 * @example <div ...${source}">
 * @example <div ...${Mixin(source)}">
 */
export const Mixin: ExplicitSink<'mixin'> = (source: RMLTemplateExpressions.Mixin) => {
    return <SinkBindingConfiguration<Element>>{
        type: SINK_TAG,
        source,
        sink: AttributeObjectSink,
    };
};
