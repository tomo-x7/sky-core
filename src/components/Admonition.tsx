import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button as BaseButton, type ButtonProps } from "#/components/Button";
import { Text as BaseText } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as ErrorIcon } from "#/components/icons/CircleInfo";
import { Eye_Stroke2_Corner0_Rounded as InfoIcon } from "#/components/icons/Eye";
import { Leaf_Stroke2_Corner0_Rounded as TipIcon } from "#/components/icons/Leaf";
import { Warning_Stroke2_Corner0_Rounded as WarningIcon } from "#/components/icons/Warning";

export const colors = {
	warning: {
		light: "#DFBC00",
		dark: "#BFAF1F",
	},
};

type Context = {
	type: "info" | "tip" | "warning" | "error";
};

const Context = React.createContext<Context>({
	type: "info",
});

export function Icon() {
	const t = useTheme();
	const { type } = React.useContext(Context);
	const Icon = {
		info: InfoIcon,
		tip: TipIcon,
		warning: WarningIcon,
		error: ErrorIcon,
	}[type];
	const fill = {
		info: t.atoms.text_contrast_medium.color,
		tip: t.palette.primary_500,
		warning: colors.warning.light,
		error: t.palette.negative_500,
	}[type];
	return <Icon fill={fill} size="md" />;
}

export function Text({ children, style, ...rest }: { children?: React.ReactNode; style?: React.CSSProperties }) {
	return (
		<BaseText
			{...rest}
			style={{
				flex: 1,
				fontSize: 14,
				letterSpacing: 0,
				lineHeight: 1.3,
				paddingRight: 12,
				...style,
			}}
		>
			{children}
		</BaseText>
	);
}

export function Button({ children, ...props }: Omit<ButtonProps, "size" | "variant" | "color">) {
	return (
		<BaseButton size="tiny" variant="outline" color="secondary" {...props}>
			{children}
		</BaseButton>
	);
}

export function Row({ children }: { children: React.ReactNode }) {
	return <div style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>{children}</div>;
}

export function Outer({
	children,
	type = "info",
	style,
}: {
	children: React.ReactNode;
	type?: Context["type"];
	style?: React.CSSProperties;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const borderColor = {
		info: t.atoms.border_contrast_low.borderColor,
		tip: t.atoms.border_contrast_low.borderColor,
		warning: t.atoms.border_contrast_low.borderColor,
		error: t.atoms.border_contrast_low.borderColor,
	}[type];
	return (
		<Context.Provider value={{ type }}>
			<div
				style={{
					padding: gtMobile ? 12 : 8,
					borderRadius: 8,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.bg_contrast_25,
					borderColor,
					...style,
				}}
			>
				{children}
			</div>
		</Context.Provider>
	);
}

export function Admonition({
	children,
	type,
	style,
}: {
	children: React.ReactNode;
	type?: Context["type"];
	style?: React.CSSProperties;
}) {
	return (
		<Outer type={type} style={style}>
			<Row>
				<Icon />
				<Text>{children}</Text>
			</Row>
		</Outer>
	);
}
