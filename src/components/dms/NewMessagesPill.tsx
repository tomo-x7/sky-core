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
				...a.absolute,
				...a.w_full,
				...a.z_10,
				...a.align_center,

				bottom: 70,
				// Don't prevent scrolling in this area _except_ for in the pill itself
				pointerEvents: "none",
			}}
		>
			<button
				type="button"
				style={{
					...a.py_sm,
					...a.rounded_full,
					...a.shadow_sm,
					...a.border,
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
				<Text style={{ ...a.font_bold, pointerEvents: "auto" }}>New messages</Text>
			</button>
		</div>
	);
}
