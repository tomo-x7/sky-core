import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight } from "react-native-reanimated";

export function ScreenTransition({
	direction,
	style,
	children,
}: {
	direction: "Backward" | "Forward";
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
}) {
	const entering = direction === "Forward" ? SlideInRight : SlideInLeft;

	return (
		<Animated.View
			entering={FadeIn.duration(90)}
			exiting={FadeOut.duration(90)} // Totally vibes based
			style={style}
		>
			{children}
		</Animated.View>
	);
}
