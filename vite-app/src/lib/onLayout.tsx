import { useEffect, useRef } from "react";

export function useOnLayout(callback: (rect: DOMRect) => void) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const element = ref.current;
		// 初期レイアウト取得
		callback(element.getBoundingClientRect());

		const observer = new ResizeObserver(() => {
			callback(element.getBoundingClientRect());
		});
		observer.observe(element);

		return () => observer.disconnect();
	}, [callback]);

	return ref;
}
