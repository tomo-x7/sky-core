import { useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { isTouchDevice } from "#/lib/browser";

const DEFAULT_TARGET_SCALE = isTouchDevice ? 0.98 : 1;

export function PressableScale({
	targetScale = DEFAULT_TARGET_SCALE,
	children,
	style,
	onMouseEnter,
	onMouseLeave,
	...rest
}: {
	targetScale?: number;
} & JSX.IntrinsicElements["button"]) {
	const reducedMotion = useReducedMotion();
	const [isHover, setIsHover] = useState(false);

	return (
		<button
			onMouseEnter={(e) => {
				setIsHover(true);
				onMouseEnter?.(e);
			}}
			onMouseLeave={(e) => {
				setIsHover(false);
				onMouseLeave?.(e);
			}}
			style={{
				...(!reducedMotion && { scale: isHover ? targetScale : 1, transition: "scale 0.1s ease-out" }),
				...style,
			}}
			{...rest}
		>
			{children}
		</button>
	);
}
