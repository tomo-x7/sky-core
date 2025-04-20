import type React from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Text } from "#/components/Typography";

export function FormContainer({
	titleText,
	children,
	style,
}: {
	titleText?: React.ReactNode;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	const { gtMobile } = useBreakpoints();
	const t = useTheme();
	return (
		<form
			style={{
				...a.gap_md,
				...a.flex_1,
				...flatten(!gtMobile && [a.px_lg, a.py_md]),
				...style,
			}}
		>
			{titleText && !gtMobile && (
				<Text
					style={{
						...a.text_xl,
						...a.font_bold,
						...t.atoms.text_contrast_high,
					}}
				>
					{titleText}
				</Text>
			)}
			{children}
		</form>
	);
}
