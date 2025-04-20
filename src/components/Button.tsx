import React from "react";

import { atoms as a, flatten, select, tokens, useTheme } from "#/alf";
import { LinearGradient } from "#/components/LinearGradient";
import type { Props as SVGIconProps } from "#/components/icons/common";

export type ButtonVariant = "solid" | "outline" | "ghost" | "gradient";
export type ButtonColor =
	| "primary"
	| "secondary"
	| "secondary_inverted"
	| "negative"
	| "gradient_primary"
	| "gradient_sky"
	| "gradient_midnight"
	| "gradient_sunrise"
	| "gradient_sunset"
	| "gradient_nordic"
	| "gradient_bonfire";
export type ButtonSize = "tiny" | "small" | "large";
export type ButtonShape = "round" | "square" | "default";
export type VariantProps = {
	/**
	 * The style variation of the button
	 */
	variant?: ButtonVariant;
	/**
	 * The color of the button
	 */
	color?: ButtonColor;
	/**
	 * The size of the button
	 */
	size?: ButtonSize;
	/**
	 * The shape of the button
	 */
	shape?: ButtonShape;
};

export type ButtonState = {
	hovered: boolean;
	focused: boolean;
	pressed: boolean;
	disabled: boolean;
};

export type ButtonContext = VariantProps & ButtonState;

type NonTextElements = React.ReactElement | Iterable<React.ReactElement | null | undefined | boolean>;

export type ButtonProps = {
	disabled?: boolean;
	onPress?: React.MouseEventHandler;
	/**@deprecated 未実装 */
	hitSlop?:
		| number
		| {
				top?: number;
				bottom?: number;
				left?: number;
				right?: number;
		  };
	onHoverIn?: React.MouseEventHandler;
	onHoverOut?: React.MouseEventHandler;
	onPressIn?: React.MouseEventHandler;
	onPressOut?: React.MouseEventHandler;
	onFocus?: (ev: React.FocusEvent<HTMLAnchorElement, Element>) => void;
	onBlur?: (ev: React.FocusEvent<HTMLAnchorElement, Element>) => void;
	className?: string;
	noUnderLine?: boolean;
} & VariantProps & {
		/**
		 * For a11y, try to make this descriptive and clear
		 */
		label?: string;
		style?: React.CSSProperties;
		hoverStyle?: React.CSSProperties;
		children: NonTextElements | ((context: ButtonContext) => NonTextElements);
		href?: string;
	} & Omit<JSX.IntrinsicElements["a"], "children" | "ref">;

export type ButtonTextProps = { style?: React.CSSProperties; children?: React.ReactNode } & VariantProps & {
		disabled?: boolean;
	};

const Context = React.createContext<VariantProps & ButtonState>({
	hovered: false,
	focused: false,
	pressed: false,
	disabled: false,
});

export function useButtonContext() {
	return React.useContext(Context);
}

export const Button = React.forwardRef<HTMLAnchorElement, ButtonProps>(
	(
		{
			children,
			variant,
			color,
			size,
			shape = "default",
			label,
			disabled = false,
			style,
			hoverStyle: hoverStyleProp,
			onPressIn: onPressInOuter,
			onPressOut: onPressOutOuter,
			onHoverIn: onHoverInOuter,
			onHoverOut: onHoverOutOuter,
			onFocus: onFocusOuter,
			onBlur: onBlurOuter,
			href,
			onPress,
			hitSlop, //TODO
			noUnderLine,
			...rest
		},
		ref,
	) => {
		const t = useTheme();
		const [state, setState] = React.useState({
			pressed: false,
			hovered: false,
			focused: false,
		});

		const onPressIn = React.useCallback(
			(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
				setState((s) => ({
					...s,
					pressed: true,
				}));
				onPressInOuter?.(e);
			},
			[onPressInOuter],
		);
		const onPressOut = React.useCallback(
			(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
				setState((s) => ({
					...s,
					pressed: false,
				}));
				onPressOutOuter?.(e);
			},
			[onPressOutOuter],
		);
		const onHoverIn = React.useCallback(
			(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
				setState((s) => ({
					...s,
					hovered: true,
				}));
				onHoverInOuter?.(e);
			},
			[onHoverInOuter],
		);
		const onHoverOut = React.useCallback(
			(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
				setState((s) => ({
					...s,
					hovered: false,
				}));
				onHoverOutOuter?.(e);
			},
			[onHoverOutOuter],
		);
		const onFocus = React.useCallback(
			(e: React.FocusEvent<HTMLAnchorElement, Element>) => {
				setState((s) => ({
					...s,
					focused: true,
				}));
				onFocusOuter?.(e);
			},
			[onFocusOuter],
		);
		const onBlur = React.useCallback(
			(e: React.FocusEvent<HTMLAnchorElement, Element>) => {
				setState((s) => ({
					...s,
					focused: false,
				}));
				onBlurOuter?.(e);
			},
			[onBlurOuter],
		);

		const { baseStyles, hoverStyles } = React.useMemo(() => {
			const baseStyles: React.CSSProperties[] = [];
			const hoverStyles: React.CSSProperties[] = [];

			if (color === "primary") {
				if (variant === "solid") {
					if (!disabled) {
						baseStyles.push({
							backgroundColor: t.palette.primary_500,
						});
						hoverStyles.push({
							backgroundColor: t.palette.primary_600,
						});
					} else {
						baseStyles.push({
							backgroundColor: select(t.name, {
								light: t.palette.primary_700,
								dim: t.palette.primary_300,
								dark: t.palette.primary_300,
							}),
						});
					}
				} else if (variant === "outline") {
					baseStyles.push({ border: "1px solid black", ...t.atoms.bg, borderWidth: 1 });

					if (!disabled) {
						baseStyles.push({ border: "1px solid black", borderColor: t.palette.primary_500 });
						hoverStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							backgroundColor: t.palette.primary_50,
						});
					} else {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.primary_200,
						});
					}
				} else if (variant === "ghost") {
					if (!disabled) {
						baseStyles.push({ ...t.atoms.bg });
						hoverStyles.push({
							backgroundColor: t.palette.primary_100,
						});
					}
				}
			} else if (color === "secondary") {
				if (variant === "solid") {
					if (!disabled) {
						baseStyles.push({ ...t.atoms.bg_contrast_25 });
						hoverStyles.push({ ...t.atoms.bg_contrast_50 });
					} else {
						baseStyles.push({ ...t.atoms.bg_contrast_100 });
					}
				} else if (variant === "outline") {
					baseStyles.push({ border: "1px solid black", borderWidth: 1, ...t.atoms.bg });

					if (!disabled) {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.contrast_300,
						});
						hoverStyles.push({ ...t.atoms.bg_contrast_50 });
					} else {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.contrast_200,
						});
					}
				} else if (variant === "ghost") {
					if (!disabled) {
						baseStyles.push({ ...t.atoms.bg });
						hoverStyles.push({
							backgroundColor: t.palette.contrast_25,
						});
					}
				}
			} else if (color === "secondary_inverted") {
				if (variant === "solid") {
					if (!disabled) {
						baseStyles.push({
							backgroundColor: t.palette.contrast_900,
						});
						hoverStyles.push({
							backgroundColor: t.palette.contrast_950,
						});
					} else {
						baseStyles.push({
							backgroundColor: t.palette.contrast_600,
						});
					}
				} else if (variant === "outline") {
					baseStyles.push({ border: "1px solid black", borderWidth: 1, ...t.atoms.bg });

					if (!disabled) {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.contrast_300,
						});
						hoverStyles.push({ ...t.atoms.bg_contrast_50 });
					} else {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.contrast_200,
						});
					}
				} else if (variant === "ghost") {
					if (!disabled) {
						baseStyles.push({ ...t.atoms.bg });
						hoverStyles.push({
							backgroundColor: t.palette.contrast_25,
						});
					}
				}
			} else if (color === "negative") {
				if (variant === "solid") {
					if (!disabled) {
						baseStyles.push({
							backgroundColor: t.palette.negative_500,
						});
						hoverStyles.push({
							backgroundColor: t.palette.negative_600,
						});
					} else {
						baseStyles.push({
							backgroundColor: select(t.name, {
								light: t.palette.negative_700,
								dim: t.palette.negative_300,
								dark: t.palette.negative_300,
							}),
						});
					}
				} else if (variant === "outline") {
					baseStyles.push({ border: "1px solid black", borderWidth: 1, ...t.atoms.bg });

					if (!disabled) {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.negative_500,
						});
						hoverStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							backgroundColor: t.palette.negative_50,
						});
					} else {
						baseStyles.push({
							border: "1px solid black",
							borderWidth: 1,
							borderColor: t.palette.negative_200,
						});
					}
				} else if (variant === "ghost") {
					if (!disabled) {
						baseStyles.push({ ...t.atoms.bg });
						hoverStyles.push({
							backgroundColor: t.palette.negative_100,
						});
					}
				}
			}

			if (shape === "default") {
				if (size === "large") {
					baseStyles.push({
						padding: "13px 20px",
						borderRadius: 8,
						gap: 8,
					});
				} else if (size === "small") {
					baseStyles.push({
						padding: "9px 12px",
						borderRadius: 6,
						gap: 6,
					});
				} else if (size === "tiny") {
					baseStyles.push({
						padding: "4px 8px",
						borderRadius: 4,
						gap: 4,
					});
				}
			} else if (shape === "round" || shape === "square") {
				if (size === "large") {
					if (shape === "round") {
						baseStyles.push({ height: 46, width: 46 });
					} else {
						baseStyles.push({ height: 44, width: 44 });
					}
				} else if (size === "small") {
					if (shape === "round") {
						baseStyles.push({ height: 34, width: 34 });
					} else {
						baseStyles.push({ height: 34, width: 34 });
					}
				} else if (size === "tiny") {
					if (shape === "round") {
						baseStyles.push({ height: 22, width: 22 });
					} else {
						baseStyles.push({ height: 21, width: 21 });
					}
				}

				if (shape === "round") {
					baseStyles.push({ borderRadius: 999 });
				} else if (shape === "square") {
					if (size === "tiny") {
						baseStyles.push({ borderRadius: 4 });
					} else {
						baseStyles.push({ borderRadius: 8 });
					}
				}
			}

			return {
				baseStyles: flatten(baseStyles),
				hoverStyles: flatten(hoverStyles),
			};
		}, [t, variant, color, size, shape, disabled]);

		const gradientValues = React.useMemo(() => {
			const gradient = {
				primary: tokens.gradients.sky,
				secondary: tokens.gradients.sky,
				secondary_inverted: tokens.gradients.sky,
				negative: tokens.gradients.sky,
				gradient_primary: tokens.gradients.primary,
				gradient_sky: tokens.gradients.sky,
				gradient_midnight: tokens.gradients.midnight,
				gradient_sunrise: tokens.gradients.sunrise,
				gradient_sunset: tokens.gradients.sunset,
				gradient_nordic: tokens.gradients.nordic,
				gradient_bonfire: tokens.gradients.bonfire,
			}[color || "primary"];

			if (variant === "gradient") {
				if (gradient.values.length < 2) {
					throw new Error("Gradient buttons must have at least two colors in the gradient");
				}

				return {
					colors: gradient.values.map(([_, color]) => color) as [string, string, ...string[]],
					hoverColors: gradient.values.map((_) => gradient.hover_value) as [string, string, ...string[]],
					locations: gradient.values.map(([location]) => location) as [number, number, ...number[]],
				};
			}
		}, [variant, color]);

		const context = React.useMemo<ButtonContext>(
			() => ({
				...state,
				variant,
				color,
				size,
				disabled: disabled || false,
			}),
			[state, variant, color, size, disabled],
		);

		const flattenedBaseStyles = flatten([baseStyles, style]);
		return (
			<a
				{...rest}
				onClick={onPress}
				ref={ref}
				aria-label={label}
				aria-pressed={state.pressed}
				// disabled={disabled || false} //スタイルで頑張る
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					...flattenedBaseStyles,
					...(state.hovered || state.pressed ? { ...hoverStyles, ...hoverStyleProp } : {}),
					pointerEvents: disabled ? "none" : "auto",
				}}
				onFocus={onFocus}
				onBlur={onBlur}
				onMouseDown={onPressIn}
				onMouseUp={onPressOut}
				onMouseEnter={onHoverIn}
				onMouseLeave={onHoverOut}
				href={href}
				{...(noUnderLine && { "data-no-underline": true })}
			>
				{variant === "gradient" && gradientValues && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							overflow: "hidden",
							borderRadius: flattenedBaseStyles?.borderRadius,
						}}
					>
						<LinearGradient
							colors={state.hovered || state.pressed ? gradientValues.hoverColors : gradientValues.colors}
							locations={gradientValues.locations}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
							}}
						/>
					</div>
				)}
				<Context.Provider value={context}>
					{typeof children === "function" ? children(context) : children}
				</Context.Provider>
			</a>
		);
	},
);
Button.displayName = "Button";

export function useSharedButtonTextStyles() {
	const t = useTheme();
	const { color, variant, disabled, size } = useButtonContext();
	return React.useMemo(() => {
		const baseStyles: React.CSSProperties[] = [];

		if (color === "primary") {
			if (variant === "solid") {
				if (!disabled) {
					baseStyles.push({ color: t.palette.white });
				} else {
					baseStyles.push({ color: t.palette.white, opacity: 0.5 });
				}
			} else if (variant === "outline") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.primary_600,
					});
				} else {
					baseStyles.push({ color: t.palette.primary_600, opacity: 0.5 });
				}
			} else if (variant === "ghost") {
				if (!disabled) {
					baseStyles.push({ color: t.palette.primary_600 });
				} else {
					baseStyles.push({ color: t.palette.primary_600, opacity: 0.5 });
				}
			}
		} else if (color === "secondary") {
			if (variant === "solid" || variant === "gradient") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_700,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_400,
					});
				}
			} else if (variant === "outline") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_600,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_300,
					});
				}
			} else if (variant === "ghost") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_600,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_300,
					});
				}
			}
		} else if (color === "secondary_inverted") {
			if (variant === "solid" || variant === "gradient") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_100,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_400,
					});
				}
			} else if (variant === "outline") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_600,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_300,
					});
				}
			} else if (variant === "ghost") {
				if (!disabled) {
					baseStyles.push({
						color: t.palette.contrast_600,
					});
				} else {
					baseStyles.push({
						color: t.palette.contrast_300,
					});
				}
			}
		} else if (color === "negative") {
			if (variant === "solid" || variant === "gradient") {
				if (!disabled) {
					baseStyles.push({ color: t.palette.white });
				} else {
					baseStyles.push({ color: t.palette.white, opacity: 0.5 });
				}
			} else if (variant === "outline") {
				if (!disabled) {
					baseStyles.push({ color: t.palette.negative_400 });
				} else {
					baseStyles.push({ color: t.palette.negative_400, opacity: 0.5 });
				}
			} else if (variant === "ghost") {
				if (!disabled) {
					baseStyles.push({ color: t.palette.negative_400 });
				} else {
					baseStyles.push({ color: t.palette.negative_400, opacity: 0.5 });
				}
			}
		} else {
			if (!disabled) {
				baseStyles.push({ color: t.palette.white });
			} else {
				baseStyles.push({ color: t.palette.white, opacity: 0.5 });
			}
		}

		if (size === "large") {
			baseStyles.push({ fontSize: 16, letterSpacing: 0, lineHeight: 1.15 });
		} else if (size === "small") {
			baseStyles.push({ fontSize: 14, letterSpacing: 0, lineHeight: 1.15 });
		} else if (size === "tiny") {
			baseStyles.push({ fontSize: 12, letterSpacing: 0, lineHeight: 1.15 });
		}

		return flatten(baseStyles);
	}, [t, variant, color, size, disabled]);
}

export function ButtonText({ children, style, ...rest }: ButtonTextProps) {
	const textStyles = useSharedButtonTextStyles();

	return (
		<div
			{...rest}
			style={{
				fontWeight: "600",
				textAlign: "center",
				...textStyles,
				...style,
			}}
		>
			{children}
		</div>
	);
}

export function ButtonIcon({
	icon: Comp,
	position,
	size,
}: {
	icon: React.ComponentType<SVGIconProps>;
	position?: "left" | "right";
	size?: SVGIconProps["size"];
}) {
	const { size: buttonSize, disabled } = useButtonContext();
	const textStyles = useSharedButtonTextStyles();
	const { iconSize, iconContainerSize } = React.useMemo(() => {
		/**
		 * Pre-set icon sizes for different button sizes
		 */
		const iconSizeShorthand =
			size ??
			(({
				large: "sm",
				small: "sm",
				tiny: "xs",
			}[buttonSize || "small"] || "sm") as Exclude<SVGIconProps["size"], undefined>);

		/*
		 * Copied here from icons/common.tsx so we can tweak if we need to, but
		 * also so that we can calculate transforms.
		 */
		const iconSize = {
			xs: 12,
			sm: 16,
			md: 20,
			lg: 24,
			xl: 28,
			"2xl": 32,
		}[iconSizeShorthand];

		/*
		 * Goal here is to match rendered text size so that different size icons
		 * don't increase button size
		 */
		const iconContainerSize = {
			large: 18,
			small: 16,
			tiny: 13,
		}[buttonSize || "small"];

		return {
			iconSize,
			iconContainerSize,
		};
	}, [buttonSize, size]);

	return (
		<div
			style={{
				zIndex: 20,

				width: iconContainerSize,
				height: iconContainerSize,
				opacity: disabled ? 0.7 : 1,
				marginLeft: position === "left" ? -2 : 0,
				marginRight: position === "right" ? -2 : 0,
			}}
		>
			<div
				style={{
					position: "absolute",
					width: iconSize,
					height: iconSize,
					top: "50%",
					left: "50%",
					transform: `translateX(${(iconSize / 2) * -1}px) translateY(${(iconSize / 2) * -1}px)`,
				}}
			>
				<Comp
					width={iconSize}
					style={{
						color: textStyles.color,
						pointerEvents: "none",
					}}
				/>
			</div>
		</div>
	);
}
