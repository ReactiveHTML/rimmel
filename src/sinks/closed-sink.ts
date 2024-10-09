import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { ExplicitSink, Sink } from "../types/sink";

import { SINK_TAG } from "../constants";

/**
 * A sink that closes a <dialog> when called
 * @param dialogBox An HTMLDialogElement
 * @returns 
 */
export const ClosedSink: Sink<HTMLDialogElement> = (dialogBox: HTMLDialogElement) =>
    dialogBox.close.bind(dialogBox)
;

/**
 * An explicit sink that closes a <dialog> when called
 * @param node An HTMLDialogElement
 * @returns 
 */
export const Closed: ExplicitSink<'closed'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'closed'>) =>
    <SinkBindingConfiguration<HTMLDialogElement>>({
        type: SINK_TAG,
		t: 'Closed',
        source,
        sink: ClosedSink,
    })
;
