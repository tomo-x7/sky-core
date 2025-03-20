import { atoms, useAlf, useTheme } from "#/alf";
import { type TextProps, normalizeTextStyles, renderChildrenWithEmoji } from "#/alf/typography";
import { useOnLayout } from "#/components/hooks/useOnLayout";
export type { TextProps };
import { useTheme as useTheme2 } from "#/lib/ThemeContext";

/**
 * Our main text component. Use this most of the time.
 */
export function Text({
	children,
	emoji,
	style,
	selectable,
	title,
	dataSet,
	onLayout,
	type = "md",
	ellipsizeMode,
	...rest
}: TextProps) {
	//TODO numberOfLines,lineHeight,ellipsizeModeの実装
	const { fonts, flags } = useAlf();
	const t = useTheme();
	const t2 = useTheme2();
	const s = normalizeTextStyles(
		{ ...atoms.text_sm, ...t.atoms.text, ...t2.typography[type], ...style },
		{
			fontScale: fonts.scaleMultiplier,
			fontFamily: fonts.family,
			flags,
		},
	);
	const ref = useOnLayout(onLayout);

	const shared = {
		uiTextView: true,
		selectable,
		style: s,
		dataSet: Object.assign({ tooltip: title }, dataSet || {}),
		...rest,
	};

	return (
		<div contentEditable ref={ref} {...shared}>
			{renderChildrenWithEmoji(children, shared, emoji ?? false)}
		</div>
	);
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
	return (
		<Text
			{...attr}
			{...rest}
			style={{
				...atoms.text_md,
				...atoms.leading_normal,
				...style,
			}}
		/>
	);
}
