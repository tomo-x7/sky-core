import { useMemo } from "react";

import { type PaletteColor, type PaletteColorName, useTheme } from "../ThemeContext";

export interface UsePaletteValue {
	colors: PaletteColor;
	view: React.CSSProperties;
	viewLight: React.CSSProperties;
	btn: React.CSSProperties;
	border: React.CSSProperties;
	borderDark: React.CSSProperties;
	text: React.CSSProperties;
	textLight: React.CSSProperties;
	textInverted: React.CSSProperties;
	link: React.CSSProperties;
	icon: React.CSSProperties;
}
export function usePalette(color: PaletteColorName): UsePaletteValue {
	const theme = useTheme();
	return useMemo(() => {
		const palette = theme.palette[color];
		return {
			colors: palette,
			view: {
				backgroundColor: palette.background,
			},
			viewLight: {
				backgroundColor: palette.backgroundLight,
			},
			btn: {
				backgroundColor: palette.backgroundLight,
			},
			border: {
				borderColor: palette.border,
			},
			borderDark: {
				borderColor: palette.borderDark,
			},
			text: {
				color: palette.text,
			},
			textLight: {
				color: palette.textLight,
			},
			textInverted: {
				color: palette.textInverted,
			},
			link: {
				color: palette.link,
			},
			icon: {
				color: palette.icon,
			},
		};
	}, [theme, color]);
}
