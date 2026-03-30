/**
 * Create a secure object to be used as a small dictionary.
 * By secure we mean one with an empty prototype, immune to
 * prototype pollution attacks.
 * Consider using a Map() instead when the number of keys is expected
 * to be large or when used with polymorphic/megamorphic shapes
 */
export const ObjectMap = <T extends Record<string, any>>(obj: T) =>
	Object.assign(Object.create(null), obj)
;
