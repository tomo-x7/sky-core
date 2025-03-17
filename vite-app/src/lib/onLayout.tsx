import { type RefObject, useEffect, useRef } from "react";
export function useOnLayout<T extends Element = HTMLDivElement>(
	callback: ((rect: DOMRect) => void) | undefined,
	ref: RefObject<T>,
): void;
export function useOnLayout<T extends Element = HTMLDivElement>(
	callback: ((rect: DOMRect) => void) | undefined,
): RefObject<T>;
export function useOnLayout<T extends Element = HTMLDivElement>(
	callback: ((rect: DOMRect) => void) | undefined,
	paramRef?: RefObject<T>,
) {
	const innerRef = useRef<T>(null);
	const ref = paramRef ?? innerRef;

	useEffect(() => {
		if (ref.current == null || callback == null) return;
		const element = ref.current;
		// 初期レイアウト取得
		callback(element.getBoundingClientRect());
		const observer = new ResizeObserver(() => {
			callback(element.getBoundingClientRect());
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref.current, callback]);
	if (paramRef == null) return innerRef;
}
