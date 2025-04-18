import { useState } from "react";

export interface SharedValue<T> {
	readonly value: T;
	get(): T;
	set(value: T): void;
}
export function useSharedValue<T>(initValue: T): SharedValue<T> {
	const [value, setValue] = useState(initValue);
	return {
		value: value,
		get: () => value,
		set: (newValue) => setValue(newValue),
	};
}
