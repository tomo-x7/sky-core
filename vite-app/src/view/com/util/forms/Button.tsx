import React, { useEffect, useState } from "react";

import { flatten } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { useTheme } from "#/lib/ThemeContext";
import { choose } from "#/lib/functions";

export type ButtonType =
	| "primary"
	| "secondary"
	| "default"
	| "inverted"
	| "primary-outline"
	| "secondary-outline"
	| "primary-light"
	| "secondary-light"
	| "default-light";

// Augment type for react-native-web (see https://github.com/necolas/react-native-web/issues/1684#issuecomment-766451866)
// declare module "react-native" {
// 	interface PressableStateCallbackType {
// 		hovered?: boolean;
// 		focused?: boolean;
// 	}
// }

// TODO: Enforce that button always has a label
export function Button({
	type = "primary",
	label,
	style,
	labelContainerStyle,
	labelStyle,
	onPress,
	children,
	accessibilityLabel,
	accessibilityHint,
	accessibilityLabelledBy,
	onAccessibilityEscape,
	withLoading = false,
	disabled = false,
}: React.PropsWithChildren<{
	type?: ButtonType;
	label?: string;
	style?: React.CSSProperties;
	labelContainerStyle?: React.CSSProperties;
	labelStyle?: React.CSSProperties;
	onPress?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<void>;
	accessibilityLabel?: string;
	accessibilityHint?: string;
	accessibilityLabelledBy?: string;
	onAccessibilityEscape?: () => void;
	withLoading?: boolean;
	disabled?: boolean;
}>) {
	const theme = useTheme();
	const typeOuterStyle = choose<React.CSSProperties, Record<ButtonType, React.CSSProperties>>(type, {
		primary: {
			backgroundColor: theme.palette.primary.background,
		},
		secondary: {
			backgroundColor: theme.palette.secondary.background,
		},
		default: {
			backgroundColor: theme.palette.default.backgroundLight,
		},
		inverted: {
			backgroundColor: theme.palette.inverted.background,
		},
		"primary-outline": {
			backgroundColor: theme.palette.default.background,
			borderWidth: 1,
			borderColor: theme.palette.primary.border,
		},
		"secondary-outline": {
			backgroundColor: theme.palette.default.background,
			borderWidth: 1,
			borderColor: theme.palette.secondary.border,
		},
		"primary-light": {
			backgroundColor: theme.palette.default.background,
		},
		"secondary-light": {
			backgroundColor: theme.palette.default.background,
		},
		"default-light": {
			backgroundColor: theme.palette.default.background,
		},
	});
	const typeLabelStyle = choose<React.CSSProperties, Record<ButtonType, React.CSSProperties>>(type, {
		primary: {
			color: theme.palette.primary.text,
			fontWeight: "600",
		},
		secondary: {
			color: theme.palette.secondary.text,
			fontWeight: theme.palette.secondary.isLowContrast ? "600" : undefined,
		},
		default: {
			color: theme.palette.default.text,
		},
		inverted: {
			color: theme.palette.inverted.text,
			fontWeight: "600",
		},
		"primary-outline": {
			color: theme.palette.primary.textInverted,
			fontWeight: theme.palette.primary.isLowContrast ? "600" : undefined,
		},
		"secondary-outline": {
			color: theme.palette.secondary.textInverted,
			fontWeight: theme.palette.secondary.isLowContrast ? "600" : undefined,
		},
		"primary-light": {
			color: theme.palette.primary.textInverted,
			fontWeight: theme.palette.primary.isLowContrast ? "600" : undefined,
		},
		"secondary-light": {
			color: theme.palette.secondary.textInverted,
			fontWeight: theme.palette.secondary.isLowContrast ? "600" : undefined,
		},
		"default-light": {
			color: theme.palette.default.text,
			fontWeight: theme.palette.default.isLowContrast ? "600" : undefined,
		},
	});

	const [isLoading, setIsLoading] = React.useState(false);
	const [pressed, setPressed] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const onPressWrapped = React.useCallback(
		async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			event.stopPropagation();
			event.preventDefault();
			withLoading && setIsLoading(true);
			await onPress?.(event);
			withLoading && setIsLoading(false);
		},
		[onPress, withLoading],
	);

	const getStyle = React.useCallback(
		(state: { pressed: boolean; hovered: boolean; focused: boolean }) => {
			const arr = [typeOuterStyle, styles.outer, style];
			if (state.pressed) {
				arr.push({ opacity: 0.6 });
			} else if (state.hovered) {
				arr.push({ opacity: 0.8 });
			}
			return flatten(arr);
		},
		[typeOuterStyle, style],
	);

	const renderChildern = React.useCallback(() => {
		if (!label) {
			return children;
		}

		return (
			<div
				style={{
					...styles.labelContainer,
					...labelContainerStyle,
				}}
			>
				{label && withLoading && isLoading ? (
					<ActivityIndicator size={12} color={typeLabelStyle.color} />
				) : null}
				<Text
					type="button"
					style={{
						...typeLabelStyle,
						...labelStyle,
					}}
				>
					{label}
				</Text>
			</div>
		);
	}, [children, label, withLoading, isLoading, labelContainerStyle, typeLabelStyle, labelStyle]);
	useEffect(() => {
		const handler = (ev: KeyboardEvent) => {
			if (ev.key === "Escape") onAccessibilityEscape?.();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onAccessibilityEscape]);
	return (
		<button
			type="button"
			style={getStyle({ pressed, focused, hovered })}
			onClick={onPressWrapped}
			disabled={disabled || isLoading}
			onMouseDown={() => setPressed(true)}
			onMouseUp={() => setPressed(false)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
		>
			{renderChildern()}
		</button>
	);
}

const styles: Record<string, React.CSSProperties> = {
	outer: {
		padding: "8px 14px",
		borderRadius: 24,
	},
	labelContainer: {
		flexDirection: "row",
		gap: 8,
	},
};
