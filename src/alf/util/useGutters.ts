import React from "react";

import { type Breakpoint, useBreakpoints } from "../breakpoints";

type Gutter = "compact" | "base" | "wide" | 0;

const gutters: Record<Exclude<Gutter, 0>, Record<Breakpoint | "default", number>> = {
	compact: {
		default: 8,
		gtPhone: 8,
		gtMobile: 12,
		gtTablet: 12,
	},
	base: {
		default: 16,
		gtPhone: 16,
		gtMobile: 20,
		gtTablet: 20,
	},
	wide: {
		default: 20,
		gtPhone: 20,
		gtMobile: 28,
		gtTablet: 28,
	},
};

type Gutters = {
	paddingTop: number;
	paddingRight: number;
	paddingBottom: number;
	paddingLeft: number;
};

export function useGutters([all]: [Gutter]): Gutters;
export function useGutters([vertical, horizontal]: [Gutter, Gutter]): Gutters;
export function useGutters([top, right, bottom, left]: [Gutter, Gutter, Gutter, Gutter]): Gutters;
export function useGutters([top, right, bottom, left]: Gutter[]) {
	const { activeBreakpoint } = useBreakpoints();
	if (right === undefined) {
		right = bottom = left = top;
	} else if (bottom === undefined) {
		bottom = top;
		left = right;
	}
	return React.useMemo(() => {
		return {
			paddingTop: top === 0 ? 0 : gutters[top][activeBreakpoint || "default"],
			paddingRight: right === 0 ? 0 : gutters[right][activeBreakpoint || "default"],
			paddingBottom: bottom === 0 ? 0 : gutters[bottom][activeBreakpoint || "default"],
			paddingLeft: left === 0 ? 0 : gutters[left][activeBreakpoint || "default"],
		};
	}, [activeBreakpoint, top, right, bottom, left]);
}
