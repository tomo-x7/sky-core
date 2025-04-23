import React from "react";

import type { Device } from "../storage";
import {
	computeFontScaleMultiplier,
	getFontFamily,
	getFontScale,
	setFontFamily as persistFontFamily,
	setFontScale as persistFontScale,
} from "./fonts";
import { light, themes } from "./theme";
import type { Theme, ThemeName } from "./types";

export * from "./breakpoints";
export * from "./fonts";
export * as tokens from "./tokens";
export * from "./types";
export * from "./util/flatten";
export * from "./util/themeSelector";
export * from "./util/useGutters";

export type Alf = {
	themeName: ThemeName;
	theme: Theme;
	themes: typeof themes;
	fonts: {
		scale: Exclude<Device["fontScale"], undefined>;
		scaleMultiplier: number;
		family: Device["fontFamily"];
		setFontScale: (fontScale: Exclude<Device["fontScale"], undefined>) => void;
		setFontFamily: (fontFamily: Device["fontFamily"]) => void;
	};
	/**
	 * Feature flags or other gated options
	 */

	flags: {};
};

/*
 * Context
 */
export const Context = React.createContext<Alf>({
	themeName: "light",
	theme: light,
	themes: themes,
	fonts: {
		scale: getFontScale(),
		scaleMultiplier: computeFontScaleMultiplier(getFontScale()),
		family: getFontFamily(),
		setFontScale: () => {},
		setFontFamily: () => {},
	},
	flags: {},
});

export function ThemeProvider({ children, theme: themeName }: React.PropsWithChildren<{ theme: ThemeName }>) {
	const [fontScale, setFontScale] = React.useState<Alf["fonts"]["scale"]>(() => getFontScale());
	const [fontScaleMultiplier, setFontScaleMultiplier] = React.useState(() => computeFontScaleMultiplier(fontScale));
	const setFontScaleAndPersist = React.useCallback<Alf["fonts"]["setFontScale"]>((fontScale) => {
		setFontScale(fontScale);
		persistFontScale(fontScale);
		setFontScaleMultiplier(computeFontScaleMultiplier(fontScale));
	}, []);
	const [fontFamily, setFontFamily] = React.useState<Alf["fonts"]["family"]>(() => getFontFamily());
	const setFontFamilyAndPersist = React.useCallback<Alf["fonts"]["setFontFamily"]>((fontFamily) => {
		setFontFamily(fontFamily);
		persistFontFamily(fontFamily);
	}, []);

	const value = React.useMemo<Alf>(
		() => ({
			themes,
			themeName: themeName,
			theme: themes[themeName],
			fonts: {
				scale: fontScale,
				scaleMultiplier: fontScaleMultiplier,
				family: fontFamily,
				setFontScale: setFontScaleAndPersist,
				setFontFamily: setFontFamilyAndPersist,
			},
			flags: {},
		}),
		[themeName, fontScale, setFontScaleAndPersist, fontFamily, setFontFamilyAndPersist, fontScaleMultiplier],
	);

	return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAlf() {
	return React.useContext(Context);
}

export function useTheme(theme?: ThemeName) {
	const alf = useAlf();
	return React.useMemo(() => {
		return theme ? alf.themes[theme] : alf.theme;
	}, [theme, alf]);
}
