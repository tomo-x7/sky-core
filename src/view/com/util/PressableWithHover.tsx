import { type PropsWithChildren, forwardRef } from "react";

import type React from "react";
import { useInteractionState } from "#/components/hooks/useInteractionState";

interface PressableWithHover {
	hoverStyle?: React.CSSProperties;
	style?: React.CSSProperties;
	onPress?: React.MouseEventHandler<HTMLAnchorElement>;
	href?: string;
	noUnderline?: boolean;
}
type props = PropsWithChildren<PressableWithHover> &
	Omit<JSX.IntrinsicElements["a"], "onClick" | "onMouseEnter" | "onMouseLeave" | "ref">;

export const PressableWithHover = forwardRef<HTMLAnchorElement, props>(function PressableWithHoverImpl(
	{ children, style, hoverStyle, href, onPress, noUnderline },
	ref,
) {
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();

	return (
		<a
			style={hovered ? { ...style, ...hoverStyle } : style}
			onMouseEnter={onHoverIn}
			onMouseLeave={onHoverOut}
			ref={ref}
			{...(noUnderline && { "data-no-underline": 1 })}
			href={href}
			onClick={onPress}
		>
			{children}
		</a>
	);
});

export const PressableWithoutHover = forwardRef<HTMLAnchorElement, props>(function PressableWithoutHoverImpl(
	{ children, style, hoverStyle, href, onPress, noUnderline, ...rest },
	ref,
) {
	return (
		<a
			style={style}
			ref={ref}
			{...(noUnderline && { "data-no-underline": 1 })}
			href={href}
			onClick={onPress}
			{...rest}
		>
			{children}
		</a>
	);
});
