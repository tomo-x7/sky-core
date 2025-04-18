import { type Device, device } from "../storage";

const WEB_FONT_FAMILIES = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`;

const factor = 0.0625; // 1 - (15/16)
const fontScaleMultipliers: Record<Device["fontScale"], number> = {
	"-2": 1 - factor * 3,
	"-1": 1 - factor * 2,
	"0": 1 - factor * 1, // default
	"1": 1,
	"2": 1 + factor * 1,
};

export function computeFontScaleMultiplier(scale: Device["fontScale"]) {
	return fontScaleMultipliers[scale];
}

export function getFontScale() {
	return device.get(["fontScale"]) ?? "0";
}

export function setFontScale(fontScale: Device["fontScale"]) {
	device.set(["fontScale"], fontScale);
}

export function getFontFamily() {
	return device.get(["fontFamily"]) || "theme";
}

export function setFontFamily(fontFamily: Device["fontFamily"]) {
	device.set(["fontFamily"], fontFamily);
}

/*
 * Unused fonts are commented out, but the files are there if we need them.
 */
export function applyFonts(style: React.CSSProperties, fontFamily: "system" | "theme") {
	if (fontFamily === "theme") {
		style.fontFamily = "InterVariable";

		if (style.fontStyle === "italic") {
			style.fontFamily += "Italic";
		}

		// fallback families only supported on web
		style.fontFamily += `, ${WEB_FONT_FAMILIES}`;

		/**
		 * Disable contextual alternates in Inter
		 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant}
		 */
		style.fontVariant = (style.fontVariant?.split(" ") || []).concat("no-contextual").join(" ");
	} else {
		// fallback families only supported on web
		style.fontFamily = style.fontFamily || WEB_FONT_FAMILIES;

		/**
		 * Overridden to previous spacing for the `system` font option.
		 * https://github.com/bluesky-social/social-app/commit/2419096e2409008b7d71fd6b8f8d0dd5b016e267
		 */
		style.letterSpacing = 0.25;
	}
}
