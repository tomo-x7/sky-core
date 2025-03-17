import { type PropsWithChildren, forwardRef } from "react";
import { Pressable, type PressableProps } from "react-native";
import type { View } from "react-native";

import { useInteractionState } from "#/components/hooks/useInteractionState";
import { addStyle } from "#/lib/styles";

interface PressableWithHover extends PressableProps {
	hoverStyle: React.CSSProperties;
}

export const PressableWithHover = forwardRef<View, PropsWithChildren<PressableWithHover>>(
	function PressableWithHoverImpl({ children, style, hoverStyle, ...props }, ref) {
		const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();

		return (
			<Pressable
				{...props}
				style={typeof style !== "function" && hovered ? addStyle(style, hoverStyle) : style}
				onHoverIn={onHoverIn}
				onHoverOut={onHoverOut}
				ref={ref}
			>
				{children}
			</Pressable>
		);
	},
);
