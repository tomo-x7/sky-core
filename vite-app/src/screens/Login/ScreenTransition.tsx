import type React from "react";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

export function ScreenTransition({
	style,
	children,
}: {
	style?: React.CSSProperties;
	children: React.ReactNode;
}) {
	return (
		<Animated.View style={style} entering={FadeInRight} exiting={FadeOutLeft}>
			{children}
		</Animated.View>
	);
}
