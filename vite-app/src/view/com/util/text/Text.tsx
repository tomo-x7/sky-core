import React from "react";
import { StyleSheet, type TextProps } from "react-native";
import { UITextView } from "react-native-uitextview";

import { applyFonts, useAlf } from "#/alf";
import { type StringChild, childHasEmoji, renderChildrenWithEmoji } from "#/alf/typography";
import { type TypographyVariant, useTheme } from "#/lib/ThemeContext";
import { lh, s } from "#/lib/styles";
import { isIOS, isWeb } from "#/platform/detection";

export type CustomTextProps = Omit<TextProps, "children"> & {
	type?: TypographyVariant;
	lineHeight?: number;
	title?: string;
	dataSet?: Record<string, string | number>;
	selectable?: boolean;
} & (
		| {
				emoji: true;
				children: StringChild;
		  }
		| {
				emoji?: false;
				children: TextProps["children"];
		  }
	);

export { Text_DEPRECATED as Text };
/**
 * @deprecated use Text from Typography instead.
 */
function Text_DEPRECATED({
	type = "md",
	children,
	emoji,
	lineHeight,
	style,
	title,
	dataSet,
	selectable,
	...props
}: React.PropsWithChildren<CustomTextProps>) {
	const theme = useTheme();
	const { fonts } = useAlf();

	const typography = theme.typography[type];
	const lineHeightStyle = lineHeight ? lh(theme, type, lineHeight) : undefined;

	const flattened = StyleSheet.flatten([s.black, typography, lineHeightStyle, style]);

	applyFonts(flattened, fonts.family);

	// should always be defined on `typography`
	// @ts-ignore
	if (flattened.fontSize) {
		// @ts-ignore
		flattened.fontSize = Math.round(
			// @ts-ignore
			flattened.fontSize * fonts.scaleMultiplier,
		);
	}

	const textProps = {
		uiTextView: selectable && isIOS,
		selectable,
		style: flattened,
		dataSet: isWeb ? Object.assign({ tooltip: title }, dataSet || {}) : undefined,
		...props,
	};

	return <UITextView {...textProps}>{renderChildrenWithEmoji(children, textProps, emoji ?? false)}</UITextView>;
}
