interface Keyboard {
	dismiss: () => void;
}
export const Keyboard: Keyboard = {
	dismiss() {
		if (document.activeElement instanceof HTMLElement || document.activeElement instanceof SVGElement) {
			document.activeElement.blur();
		}
	},
};
