/**
 * A JSON entity
 */
export type JSON = string | number | boolean | null | JSONObject | JSON[];

/**
 * A JSON object
 */
export interface JSONObject {
	[property: string]: JSON;
};

