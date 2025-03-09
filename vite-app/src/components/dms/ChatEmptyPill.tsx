import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { ScaleAndFadeIn } from "#/lib/custom-animations/ScaleAndFade";
import { ShrinkAndPop } from "#/lib/custom-animations/ShrinkAndPop";
import { isWeb } from "#/platform/detection";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

let lastIndex = 0;

export function ChatEmptyPill() {
	const t = useTheme();
	const [promptIndex, setPromptIndex] = React.useState(lastIndex);

	const scale = useSharedValue(1);

	const prompts = React.useMemo(() => {
		return [
			"Say hello!",
			"Share your favorite feed!",
			"Tell a joke!",
			"Share a fun fact!",
			"Share a cool story!",
			"Send a neat website!",
			"Clip 🐴 clop 🐴",
		];
	}, []);

	const onPressIn = React.useCallback(() => {
		if (isWeb) return;
		scale.set(() => withTiming(1.075, { duration: 100 }));
	}, [scale]);

	const onPressOut = React.useCallback(() => {
		if (isWeb) return;
		scale.set(() => withTiming(1, { duration: 100 }));
	}, [scale]);

	const onPress = React.useCallback(() => {
		let randomPromptIndex = Math.floor(Math.random() * prompts.length);
		while (randomPromptIndex === lastIndex) {
			randomPromptIndex = Math.floor(Math.random() * prompts.length);
		}
		setPromptIndex(randomPromptIndex);
		lastIndex = randomPromptIndex;
	}, [prompts.length]);

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
					top: -50,
				},
			]}
		>
			<AnimatedPressable
				style={[a.px_xl, a.py_md, a.rounded_full, t.atoms.bg_contrast_25, a.align_center, animatedStyle]}
				entering={ScaleAndFadeIn}
				exiting={ShrinkAndPop}
				onPress={onPress}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
			>
				<Text style={[a.font_bold, a.pointer_events_none]} selectable={false}>
					{prompts[promptIndex]}
				</Text>
			</AnimatedPressable>
		</View>
	);
}
