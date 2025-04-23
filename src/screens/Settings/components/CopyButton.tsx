import { useCallback, useEffect, useState } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, type ButtonProps } from "#/components/Button";
import { Text } from "#/components/Typography";

export function CopyButton({ style, value, onPress: onPressProp, ...props }: ButtonProps & { value: string }) {
	const [hasBeenCopied, setHasBeenCopied] = useState(false);
	const t = useTheme();
	// const isReducedMotionEnabled = useReducedMotion();
	const isReducedMotionEnabled = false;

	useEffect(() => {
		if (hasBeenCopied) {
			const timeout = setTimeout(() => setHasBeenCopied(false), isReducedMotionEnabled ? 2000 : 100);
			return () => clearTimeout(timeout);
		}
	}, [hasBeenCopied]);

	const onPress = useCallback(
		(evt: React.MouseEvent<HTMLAnchorElement>) => {
			navigator.clipboard.writeText(value);
			setHasBeenCopied(true);
			onPressProp?.(evt);
		},
		[value, onPressProp],
	);

	return (
		<div style={{ position:"relative" }}>
			{hasBeenCopied && (
				<div
					// Animated.View
					// entering={ZoomIn.duration(100)}
					// exiting={FadeOutUp.duration(2000)}
					style={{
						position: "absolute",
						bottom: "100%",
						right: 0,
						justifyContent: "center",
						gap: 8,
						zIndex: 10,
						paddingBottom: 8,
						pointerEvents: "none",
					}}
				>
					<Text
						style={{
							fontWeight: "600",
							textAlign: "right",
							fontSize: 16,
							letterSpacing: 0,
							...t.atoms.text_contrast_high,
						}}
					>
						Copied!
					</Text>
				</div>
			)}
			<Button
				style={{
					flex: 1,
					justifyContent: "space-between",
					...style,
				}}
				onPress={onPress}
				{...props}
			/>
		</div>
	);
}
