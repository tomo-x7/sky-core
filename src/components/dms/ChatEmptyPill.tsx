import React from "react";

import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";

// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

let lastIndex = 0;

export function ChatEmptyPill() {
	const t = useTheme();
	const [promptIndex, setPromptIndex] = React.useState(lastIndex);

	// const scale = useSharedValue(1);

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

	const onPress = React.useCallback(() => {
		let randomPromptIndex = Math.floor(Math.random() * prompts.length);
		while (randomPromptIndex === lastIndex) {
			randomPromptIndex = Math.floor(Math.random() * prompts.length);
		}
		setPromptIndex(randomPromptIndex);
		lastIndex = randomPromptIndex;
	}, [prompts.length]);

	// const animatedStyle = useAnimatedStyle(() => ({
	// 	transform: [{ scale: scale.get() }],
	// }));

	return (
		<div
			style={{
				position: "absolute",
				width: "100%",
				zIndex: 10,
				alignItems: "center",

				...{
					top: -50,
				},
			}}
		>
			<button
				type="button"
				style={{
					paddingLeft: 20,
					paddingRight: 20,
					paddingTop: 12,
					paddingBottom: 12,
					borderRadius: 999,
					...t.atoms.bg_contrast_25,
					alignItems: "center",
				}}
				// entering={ScaleAndFadeIn}
				// exiting={ShrinkAndPop}
				onClick={onPress}
			>
				<Text
					style={{
						fontWeight: "600",
						pointerEvents: "none",
					}}
					selectable={false}
				>
					{prompts[promptIndex]}
				</Text>
			</button>
		</div>
	);
}
