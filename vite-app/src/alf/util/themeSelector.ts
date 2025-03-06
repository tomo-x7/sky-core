import type { ThemeName } from "../types";

export function select<T>(name: ThemeName, options: Record<ThemeName, T>) {
	switch (name) {
		case "light":
			return options.light;
		case "dark":
			return options.dark || options.dim;
		case "dim":
			return options.dim || options.dark;
		default:
			throw new Error(`select(theme, options) received unknown theme ${name}`);
	}
}
