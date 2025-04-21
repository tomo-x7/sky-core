import type React from "react";

import { useTheme } from "#/alf";
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
				position: "relative",
				width: "100%",
				paddingTop: 8,
				paddingBottom: 8,
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				...{ minHeight: 50 },
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_medium,
				...t.atoms.bg,
				...{ borderTopLeftRadius: 12 },
				...{ borderTopRightRadius: 12 },
				...style,
			}}
		>
			{renderLeft && (
				<div
					style={{
						position: "absolute",
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
						position: "absolute",
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
				fontSize: 18,
				letterSpacing: 0,
				textAlign: "center",
				fontWeight: "600",
				...style,
			}}
		>
			{children}
		</Text>
	);
}
