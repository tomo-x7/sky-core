import { useMinimalShellMode } from "#/state/shell/minimal-mode";
import { useShellLayout } from "#/state/shell/shell-layout";

// Keep these separated so that we only pay for useAnimatedStyle that gets used.

export function useMinimalShellHeaderTransform() {
	const { headerMode } = useMinimalShellMode();
	const { headerHeight } = useShellLayout();

	const headerModeValue = headerMode.get();
	return {
		pointerEvents: headerModeValue === 0 ? "auto" : "none",
		opacity: (1 - headerModeValue) ** 2,
		transform: `translateY(${headerModeValue === 0 ? 0 : -headerHeight.get()}px)`,
		transition: "opacity 200ms,transform 200ms",
	} satisfies React.CSSProperties;
}

export function useMinimalShellFooterTransform() {
	const { footerMode } = useMinimalShellMode();
	const { footerHeight } = useShellLayout();

	const footerModeValue = footerMode.value;
	return {
		pointerEvents: footerModeValue === 0 ? "auto" : "none",
		opacity: (1 - footerModeValue) ** 2,
		transform: `translateY(${footerModeValue === 0 ? 0 : footerHeight.value}px)`,
		transition: "opacity 200ms,transform 200ms",
	} satisfies React.CSSProperties;
}

export function useMinimalShellFabTransform() {
	const { footerMode } = useMinimalShellMode();

	return {
		transform: `translateY(${footerMode.value === 0 ? -44 : 0}px)`,
	} satisfies React.CSSProperties;
}
