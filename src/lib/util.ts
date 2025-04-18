export function hasOwn<T extends object>(
	obj: T,
	prop: string | number | symbol,
): obj is T & Record<typeof prop, unknown> {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}
