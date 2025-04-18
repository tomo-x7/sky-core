import type React from "react";

export function ScreenTransition({
	direction,
	style,
	children,
}: {
	direction: "Backward" | "Forward";
	style?: React.CSSProperties;
	children: React.ReactNode;
}) {
	// const entering = direction === "Forward" ? SlideInRight : SlideInLeft;

	return (
		<div
			// Animated.View
			// entering={FadeIn.duration(90)}
			// exiting={FadeOut.duration(90)} // Totally vibes based
			style={style}
		>
			{children}
		</div>
	);
}
