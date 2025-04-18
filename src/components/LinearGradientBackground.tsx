import type React from "react";
import { LinearGradient } from "#/components/LinearGradient";

import { gradients } from "#/alf/tokens";

export function LinearGradientBackground({
	style,
	gradient = "sky",
	children,
	start,
	end,
}: {
	style?: React.CSSProperties;
	gradient?: keyof typeof gradients;
	children?: React.ReactNode;
	start?: { x: number; y: number };
	end?: { x: number; y: number };
}) {
	const colors = gradients[gradient].values.map(([_, color]) => {
		return color;
	});

	assertValidColors(colors);

	return (
		<LinearGradient colors={colors} style={style} start={start} end={end}>
			{children}
		</LinearGradient>
	);
}

function assertValidColors(colors: string[]): asserts colors is [string, string, ...string[]] {
	if (colors.length < 2) {
		throw new Error("Gradient must have at least 2 colors");
	}
}
