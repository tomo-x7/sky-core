import React from "react";

import { useColorScheme } from "#/lib/useColorScheme";
import { useThemePrefs } from "../../state/shell";
import { dark, dim, light } from "../theme";
import type { ThemeName } from "../types";

export function useColorModeTheme(): ThemeName {
	const theme = useThemeName();

	React.useLayoutEffect(() => {
		updateDocument(theme);
	}, [theme]);

	return theme;
}

export function useThemeName(): ThemeName {
	const colorScheme = useColorScheme();
	const { colorMode, darkTheme } = useThemePrefs();

	return getThemeName(colorScheme, colorMode, darkTheme);
}

function getThemeName(
	colorScheme: "light" | "dark" | null | undefined,
	colorMode: "system" | "light" | "dark",
	darkTheme?: ThemeName,
) {
	if ((colorMode === "system" && colorScheme === "light") || colorMode === "light") {
		return "light";
	} else {
		return darkTheme ?? "dim";
	}
}

function updateDocument(theme: ThemeName) {
	if (typeof window !== "undefined") {
		const html = window.document.documentElement;
		const meta = window.document.querySelector('meta[name="theme-color"]');

		// remove any other color mode classes
		html.className = html.className.replace(/(theme)--\w+/g, "");
		html.classList.add(`theme--${theme}`);
		// set color to 'theme-color' meta tag
		meta?.setAttribute("content", getBackgroundColor(theme));
	}
}

export function getBackgroundColor(theme: ThemeName): string {
	switch (theme) {
		case "light":
			return light.atoms.bg.backgroundColor;
		case "dark":
			return dark.atoms.bg.backgroundColor;
		case "dim":
			return dim.atoms.bg.backgroundColor;
	}
}
