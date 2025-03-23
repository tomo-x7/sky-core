import createEmojiRegex from "emoji-regex";
import type React from "react";
import { Children } from "react";
import type { TypographyVariant } from "#/lib/ThemeContext";
import { type Alf, applyFonts, atoms } from ".";

/**
 * Util to calculate lineHeight from a text size atom and a leading atom
 *
 * Example:
 *   `leading(atoms.text_md, atoms.leading_normal)` // => 24
 */
export function leading<Size extends { fontSize?: number }, Leading extends { lineHeight?: number }>(
	textSize: Size,
	leading: Leading,
) {
	const size = textSize?.fontSize || atoms.text_md.fontSize;
	const lineHeight = leading?.lineHeight || atoms.leading_normal.lineHeight;
	return Math.round(size * lineHeight);
}

/**
 * Ensures that `lineHeight` defaults to a relative value of `1`, or applies
 * other relative leading atoms.
 *
 * If the `lineHeight` value is > 2, we assume it's an absolute value and
 * returns it as-is.
 */
export function normalizeTextStyles(
	styles: React.CSSProperties,
	{
		fontScale,
		fontFamily,
	}: {
		fontScale: number;
		fontFamily: Alf["fonts"]["family"];
	} & Pick<Alf, "flags">,
) {
	const s = styles;
	// should always be defined on these components
	s.fontSize = (Number.parseFloat(String(s.fontSize)) || atoms.text_md.fontSize) * fontScale;

	if (s?.lineHeight) {
		const lh = Number.parseFloat(String(s.lineHeight));
		if (!Number.isNaN(lh) && lh !== 0 && lh <= 2) {
			s.lineHeight = Math.round(s.fontSize * lh);
		}
	} else {
		s.lineHeight = s.fontSize;
	}

	applyFonts(s, fontFamily);

	return s;
}

export type StringChild = string | (string | null)[];
export type TextProps = {
	style?: React.CSSProperties;
	type?: TypographyVariant;
	children?: React.ReactNode;
	numberOfLines?: number;
	onLayout?: (rect: DOMRect) => void;
	lineHeight?: number;
	ellipsizeMode?: "tail" | string;
} & {
	/**
	 * Lets the user select text, to use the native copy and paste functionality.
	 */
	selectable?: boolean;
	/**
	 * Provides `data-*` attributes to the underlying `UITextView` component on
	 * web only.
	 */
	dataset?: Record<string, string | number | undefined>;
	/**
	 * Appears as a small tooltip on web hover.
	 */
	title?: string;
	/**
	 * Whether the children could possibly contain emoji.
	 */
	emoji?: boolean;
};

const EMOJI = createEmojiRegex();

export function childHasEmoji(children: React.ReactNode) {
	let hasEmoji = false;
	Children.forEach(children, (child) => {
		if (typeof child === "string" && createEmojiRegex().test(child)) {
			hasEmoji = true;
		}
	});
	return hasEmoji;
}

export function renderChildrenWithEmoji(children: React.ReactNode, props: Omit<TextProps, "children">, emoji: boolean) {
	return children;
}

const SINGLE_EMOJI_RE = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
export function isOnlyEmoji(text: string) {
	return text.length <= 15 && SINGLE_EMOJI_RE.test(text);
}
