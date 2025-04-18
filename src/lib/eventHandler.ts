export function stopPropagation<T extends { stopPropagation: () => void }>(handler: null): (ev: T) => void;
export function stopPropagation<T extends { stopPropagation: () => void }, U>(handler: (ev: T) => U): (ev: T) => U;
export function stopPropagation<T extends { stopPropagation: () => void }, U>(
	handler: ((ev: T) => U) | null,
): (ev: T) => U | void {
	return (ev) => {
		ev.stopPropagation();
		return handler?.(ev);
	};
}

export function preventDefault<T extends { preventDefault: () => void }>(handler: null): (ev: T) => void;
export function preventDefault<T extends { preventDefault: () => void }, U>(handler: (ev: T) => U): (ev: T) => U;
export function preventDefault<T extends { preventDefault: () => void }, U>(
	handler: ((ev: T) => U) | null,
): (ev: T) => U | void {
	return (ev) => {
		ev.preventDefault();
		return handler?.(ev);
	};
}
