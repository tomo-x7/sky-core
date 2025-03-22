// This is a lighterweight alternative to `useAnimatedRef()` for imperative UI thread actions.
// Render it like <View ref={ref} />, then pass `ref.current` to `measureHandle()` and such.
export type MeasuredDimensions = {
	x: number;
	y: number;
	width: number;
	height: number;
	pageX: number;
	pageY: number;
};
// When using this version, you need to read ref.current on the JS thread, and pass it to UI.
export function measureHandle(element: HTMLElement | null): MeasuredDimensions | null {
	if (element !== null) {
		const rect = element.getBoundingClientRect();
		const pageX = rect.left + window.scrollX;
		const pageY = rect.top + window.scrollY;

		return {
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
			pageX,
			pageY,
		};
	} else {
		return null;
	}
}
