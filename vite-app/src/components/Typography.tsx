import { UITextView } from "react-native-uitextview";

import { atoms, flatten, useAlf, useTheme } from "#/alf";
import { type TextProps, normalizeTextStyles, renderChildrenWithEmoji } from "#/alf/typography";
export type { TextProps };

/**
 * Our main text component. Use this most of the time.
 */
export function Text({ children, emoji, style, selectable, title, dataSet, ...rest }: TextProps) {
	const { fonts, flags } = useAlf();
	const t = useTheme();
	const s = normalizeTextStyles([atoms.text_sm, t.atoms.text, flatten(style)], {
		fontScale: fonts.scaleMultiplier,
		fontFamily: fonts.family,
		flags,
	});

	const shared = {
		uiTextView: true,
		selectable,
		style: s,
		dataSet: Object.assign({ tooltip: title }, dataSet || {}),
		...rest,
	};

	return <UITextView {...shared}>{renderChildrenWithEmoji(children, shared, emoji ?? false)}</UITextView>;
}

function createHeadingElement({ level }: { level: number }) {
	return function HeadingElement({ style, ...rest }: TextProps) {
		const attr = {
			role: "heading",
			"aria-level": level,
		} as const;

		return <Text {...attr} {...rest} style={style} />;
	};
}

/*
 * Use semantic components when it's beneficial to the user or to a web scraper
 */
export const H1 = createHeadingElement({ level: 1 });
export const H2 = createHeadingElement({ level: 2 });
export const H3 = createHeadingElement({ level: 3 });
export const H4 = createHeadingElement({ level: 4 });
export const H5 = createHeadingElement({ level: 5 });
export const H6 = createHeadingElement({ level: 6 });
export function P({ style, ...rest }: TextProps) {
	const attr = {
		role: "paragraph",
	};
	// @ts-ignore
	return (
		<Text
			{...attr}
			{...rest}
			style={{
				...atoms.text_md,
				...atoms.leading_normal,
				...flatten(style),
			}}
		/>
	);
}
