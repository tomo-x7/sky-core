import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";

export function NewMessagesPill({
	onPress: onPressInner,
}: {
	onPress: () => void;
}) {
	const t = useTheme();

	const onPress = React.useCallback(() => {
		onPressInner?.();
	}, [onPressInner]);

	return (
		<div
			style={{
				position: "absolute",
				width: "100%",
				zIndex: 10,
				alignItems: "center",

				bottom: 70,
				// Don't prevent scrolling in this area _except_ for in the pill itself
				pointerEvents: "none",
			}}
		>
			<button
				type="button"
				style={{
					paddingTop: 8,
					paddingBottom: 8,
					borderRadius: 999,
					...a.shadow_sm,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.bg_contrast_50,
					...t.atoms.border_contrast_medium,

					...{
						width: 160,
						alignItems: "center",
						shadowOpacity: 0.125,
						shadowRadius: 12,
						shadowOffset: { width: 0, height: 5 },
						pointerEvents: "none",
					},
				}}
				onClick={onPress}
			>
				<Text style={{ fontWeight: "600", pointerEvents: "auto" }}>New messages</Text>
			</button>
		</div>
	);
}
