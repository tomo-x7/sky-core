import { type ViewStyleProp, useTheme } from "#/alf";

export function Divider({ style }: ViewStyleProp) {
	const t = useTheme();

	return (
		<div
			style={{
				width: "100%",
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
				...style,
			}}
		/>
	);
}
