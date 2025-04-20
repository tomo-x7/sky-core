import React from "react";

import { flatten, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";

type ItemProps = Omit<Toggle.ItemProps, "style" | "role" | "children"> & {
	children: React.ReactElement;
};

export type GroupProps = Omit<Toggle.GroupProps, "style" | "type"> & {
	multiple?: boolean;
};

export function Group({ children, multiple, ...props }: GroupProps) {
	const t = useTheme();
	return (
		<Toggle.Group type={multiple ? "checkbox" : "radio"} {...props}>
			<div
				style={{
					width: "100%",
					flexDirection: "row",
					borderRadius: 8,
					overflow: "hidden",
					...t.atoms.border_contrast_low,
					...{ borderWidth: 1 },
				}}
			>
				{children}
			</div>
		</Toggle.Group>
	);
}

export function Button({ children, ...props }: ItemProps) {
	return (
		<Toggle.Item
			{...props}
			style={{
				flexGrow: 1,
				flex: 1,
			}}
		>
			<ButtonInner>{children}</ButtonInner>
		</Toggle.Item>
	);
}

function ButtonInner({ children }: React.PropsWithChildren) {
	const t = useTheme();
	const state = Toggle.useItemContext();

	const { baseStyles, hoverStyles, activeStyles } = React.useMemo(() => {
		const base: React.CSSProperties[] = [];
		const hover: React.CSSProperties[] = [];
		const active: React.CSSProperties[] = [];

		hover.push(t.name === "light" ? t.atoms.bg_contrast_100 : t.atoms.bg_contrast_25);

		if (state.selected) {
			active.push({
				backgroundColor: t.palette.contrast_800,
			});
			hover.push({
				backgroundColor: t.palette.contrast_800,
			});

			if (state.disabled) {
				active.push({
					backgroundColor: t.palette.contrast_500,
				});
			}
		}

		if (state.disabled) {
			base.push({
				backgroundColor: t.palette.contrast_100,
			});
		}

		return {
			baseStyles: flatten(base),
			hoverStyles: flatten(hover),
			activeStyles: flatten(active),
		};
	}, [t, state]);

	return (
		<div
			style={{
				...{
					borderLeftWidth: 1,
					marginLeft: -1,
				},

				flexGrow: 1,
				paddingTop: 12,
				paddingBottom: 12,
				paddingLeft: 12,
				paddingRight: 12,
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				...baseStyles,
				...activeStyles,
				...((state.hovered || state.pressed) && hoverStyles),
			}}
		>
			{children}
		</div>
	);
}

export function ButtonText({ children }: { children: React.ReactNode }) {
	const t = useTheme();
	const state = Toggle.useItemContext();

	const textStyles = React.useMemo(() => {
		const text: React.CSSProperties[] = [];
		if (state.selected) {
			text.push(t.atoms.text_inverted);
		}
		if (state.disabled) {
			text.push({
				opacity: 0.5,
			});
		}
		return flatten(text);
	}, [t, state]);

	return (
		<Text
			style={{
				textAlign: "center",
				fontWeight: "600",
				...t.atoms.text_contrast_medium,
				...textStyles,
			}}
		>
			{children}
		</Text>
	);
}
