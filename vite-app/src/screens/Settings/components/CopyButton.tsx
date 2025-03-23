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
			new Clipboard().writeText(value);
			setHasBeenCopied(true);
			onPressProp?.(evt);
		},
		[value, onPressProp],
	);

	return (
		<div style={a.relative}>
			{hasBeenCopied && (
				<div
					// Animated.View
					// entering={ZoomIn.duration(100)}
					// exiting={FadeOutUp.duration(2000)}
					style={{
						...a.absolute,
						bottom: "100%",
						right: 0,
						...a.justify_center,
						...a.gap_sm,
						...a.z_10,
						...a.pb_sm,
						pointerEvents: "none",
					}}
				>
					<Text
						style={{
							...a.font_bold,
							...a.text_right,
							...a.text_md,
							...t.atoms.text_contrast_high,
						}}
					>
						Copied!
					</Text>
				</div>
			)}
			<Button
				style={{
					...a.flex_1,
					...a.justify_between,
					...style,
				}}
				onPress={onPress}
				{...props}
			/>
		</div>
	);
}
