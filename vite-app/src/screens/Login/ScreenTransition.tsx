import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

export function ScreenTransition({
	style,
	children,
}: {
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
}) {
	return (
		<Animated.View style={style} entering={FadeInRight} exiting={FadeOutLeft}>
			{children}
		</Animated.View>
	);
}
