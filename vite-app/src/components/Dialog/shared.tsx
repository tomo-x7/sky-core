import type React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";

export function Header({
	renderLeft,
	renderRight,
	children,
	style,
}: {
	renderLeft?: () => React.ReactNode;
	renderRight?: () => React.ReactNode;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				...a.relative,
				...a.w_full,
				...a.py_sm,
				...a.flex_row,
				...a.justify_center,
				...a.align_center,
				...{ minHeight: 50 },
				...a.border_b,
				...t.atoms.border_contrast_medium,
				...t.atoms.bg,
				...{ borderTopLeftRadius: a.rounded_md.borderRadius },
				...{ borderTopRightRadius: a.rounded_md.borderRadius },
				...style,
			}}
		>
			{renderLeft && (
				<div
					style={{
						...a.absolute,
						...{ left: 6 },
					}}
				>
					{renderLeft()}
				</div>
			)}
			{children}
			{renderRight && (
				<div
					style={{
						...a.absolute,
						...{ right: 6 },
					}}
				>
					{renderRight()}
				</div>
			)}
		</div>
	);
}

export function HeaderText({
	children,
	style,
}: {
	children?: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<Text
			style={{
				...a.text_lg,
				...a.text_center,
				...a.font_bold,
				...style,
			}}
		>
			{children}
		</Text>
	);
}
