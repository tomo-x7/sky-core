import { type ForwardedRef, useEffect, useMemo, useRef } from "react";

import { mergeRefs } from "#/lib/merge-refs";

type Props = {
	cursor?: string;
	outerRef?: ForwardedRef<HTMLDivElement>;
};

export function useDraggableScroll({ outerRef, cursor = "grab" }: Props = {}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const slider = ref.current;
		if (!slider) {
			return;
		}
		let isDragging = false;
		let isMouseDown = false;
		let startX = 0;
		let scrollLeft = 0;

		const mouseDown = (e: MouseEvent) => {
			isMouseDown = true;
			startX = e.pageX - slider.offsetLeft;
			scrollLeft = slider.scrollLeft;

			slider.style.cursor = cursor;
		};

		const mouseUp = () => {
			if (isDragging) {
				slider.addEventListener("click", (e) => e.stopPropagation(), { once: true });
			}

			isMouseDown = false;
			isDragging = false;
			slider.style.cursor = "default";
		};

		const mouseMove = (e: MouseEvent) => {
			if (!isMouseDown) {
				return;
			}

			// Require n pixels momement before start of drag (3 in this case )
			const x = e.pageX - slider.offsetLeft;
			if (Math.abs(x - startX) < 3) {
				return;
			}

			isDragging = true;
			e.preventDefault();
			const walk = x - startX;
			slider.scrollLeft = scrollLeft - walk;
		};

		slider.addEventListener("mousedown", mouseDown);
		window.addEventListener("mouseup", mouseUp);
		window.addEventListener("mousemove", mouseMove);

		return () => {
			slider.removeEventListener("mousedown", mouseDown);
			window.removeEventListener("mouseup", mouseUp);
			window.removeEventListener("mousemove", mouseMove);
		};
	}, [cursor]);

	const refs = useMemo(() => mergeRefs(outerRef ? [ref, outerRef] : [ref]), [outerRef]);

	return {
		refs,
	};
}
