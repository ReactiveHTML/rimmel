export { HandlerFunction } from "./dom";
import { HTMLEventName } from "./dom";
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
	handler: Promise<unknown> | Observable<unknown> | Observer<unknown> | HandlerFunction;
	eventName?: HTMLEventName;
	attribute?: any;
	error?: any;
	termination?: any;
};

export type InlineAttributeHandler = Handler & {
	handler: JSONObject;
}

export type MaybeHandler = MaybeFuture<unknown>;
