/**
 * A single character
 **/
export type char =
	`${string}` extends `${infer C}${infer Rest}`
		? Rest extends ""
			? C
			: never
		: never
;

