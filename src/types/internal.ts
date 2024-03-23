export { HandlerFunction } from "./dom";
import { RMLEventName } from "./dom";
import { MaybeFuture, Observable, Observer } from "./futures";

/**
 * A JSON entity
 */

export type JSON = string | number | boolean | null | JSONObject | JSON[];
/**
 * A JSON object
 */
interface JSONObject {
  [property: string]: JSON;
};

/**
 * An internal Rimmel representation of a RML template argument
 */
export type Handler = {
	type: string;
	handler: Function | Promise<unknown> | Observable<unknown> | Observer<unknown> | EventListenerOrEventListenerObject;
	eventName?: RMLEventName;
	attribute?: any;
	sink?: string;
	error?: EventListener;
	termination?: EventListener;
};

export type InlineAttributeHandler = Handler & {
	handler: JSONObject;
}

export type MaybeHandler = Handler | MaybeFuture<unknown>;
