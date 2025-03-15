import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { ScaleAndFadeIn, ScaleAndFadeOut } from "#/lib/custom-animations/ScaleAndFade";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NewMessagesPill({
	onPress: onPressInner,
}: {
	onPress: () => void;
}) {
	const t = useTheme();

	const scale = useSharedValue(1);

	const onPress = React.useCallback(() => {
		onPressInner?.();
	}, [onPressInner]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }],
	}));

	return (
		<View
			style={[
				a.absolute,
				a.w_full,
				a.z_10,
				a.align_center,
				{
					bottom: 70,
					// Don't prevent scrolling in this area _except_ for in the pill itself
					pointerEvents: "box-none",
				},
			]}
		>
			<AnimatedPressable
				style={[
					a.py_sm,
					a.rounded_full,
					a.shadow_sm,
					a.border,
					t.atoms.bg_contrast_50,
					t.atoms.border_contrast_medium,
					{
						width: 160,
						alignItems: "center",
						shadowOpacity: 0.125,
						shadowRadius: 12,
						shadowOffset: { width: 0, height: 5 },
						pointerEvents: "box-only",
					},
					animatedStyle,
				]}
				entering={ScaleAndFadeIn}
				exiting={ScaleAndFadeOut}
				onPress={onPress}
			>
				<Text style={[a.font_bold]}>New messages</Text>
			</AnimatedPressable>
		</View>
	);
}
