import React from "react";

import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { capitalize } from "#/lib/strings/capitalize";
import { useInterestsDisplayNames } from "#/screens/Onboarding/state";

export function InterestButton({ interest }: { interest: string }) {
	const t = useTheme();
	const interestsDisplayNames = useInterestsDisplayNames();
	const ctx = Toggle.useItemContext();

	const styles = React.useMemo(() => {
		const hovered: React.CSSProperties = {
			backgroundColor: t.name === "light" ? t.palette.contrast_200 : t.palette.contrast_50,
		};
		const focused: React.CSSProperties = {};
		const pressed: React.CSSProperties = {};
		const selected: React.CSSProperties = {
			backgroundColor: t.palette.contrast_900,
		};
		const selectedHover: React.CSSProperties = {
			backgroundColor: t.palette.contrast_800,
		};
		const textSelected: React.CSSProperties = {
			color: t.palette.contrast_100,
		};
		return {
			hovered,
			focused,
			pressed,
			selected,
			selectedHover,
			textSelected,
		};
	}, [t]);

	return (
		<div
			style={{
				...{
					backgroundColor: t.palette.contrast_100,
					paddingTop: 15,
					paddingBottom: 15,
				},

				borderRadius: 999,
				paddingLeft: 24,
				paddingRight: 24,
				...(ctx.hovered ? styles.hovered : {}),
				...(ctx.focused ? styles.hovered : {}),
				...(ctx.pressed ? styles.hovered : {}),
				...(ctx.selected ? styles.selected : {}),
				...(ctx.selected && (ctx.hovered || ctx.focused || ctx.pressed) ? styles.selectedHover : {}),
			}}
		>
			<Text
				style={{
					...{ color: t.palette.contrast_900 },
					fontWeight: "600",
					...(ctx.selected ? styles.textSelected : {}),
				}}
			>
				{interestsDisplayNames[interest] || capitalize(interest)}
			</Text>
		</div>
	);
}
