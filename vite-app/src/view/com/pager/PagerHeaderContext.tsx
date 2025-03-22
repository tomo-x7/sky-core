import React from "react";
import type { SharedValue } from "#/state/SharedValue";

export const PagerHeaderContext = React.createContext<{
	scrollY: SharedValue<number>;
	headerHeight: number;
} | null>(null);

/**
 * Passes information about the scroll position and header height down via
 * context for the pager header to consume.
 *
 * @platform ios, android
 */
export function PagerHeaderProvider({
	scrollY,
	headerHeight,
	children,
}: {
	scrollY: SharedValue<number>;
	headerHeight: number;
	children: React.ReactNode;
}) {
	const value = React.useMemo(() => ({ scrollY, headerHeight }), [scrollY, headerHeight]);
	return <PagerHeaderContext.Provider value={value}>{children}</PagerHeaderContext.Provider>;
}

export function usePagerHeaderContext() {
	return null;
}
