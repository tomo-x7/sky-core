import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { Palette } from "./Palette";

export function Theming() {
	const t = useTheme();

	return (
		<div
			style={{
				...t.atoms.bg,
				gap: 16,
				padding: 20,
			}}
		>
			<Palette />
			<Text
				style={{
					fontWeight: "600",
					paddingTop: 20,
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				theme.atoms.text
			</Text>
			<div
				style={{
					flex: 1,
					...t.atoms.border_contrast_high,
					borderTop: "1px solid black",
					borderTopWidth: 1,
				}}
			/>
			<Text
				style={{
					fontWeight: "600",
					...t.atoms.text_contrast_high,
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				theme.atoms.text_contrast_high
			</Text>
			<div
				style={{
					flex: 1,
					...t.atoms.border_contrast_medium,
					borderTop: "1px solid black",
					borderTopWidth: 1,
				}}
			/>
			<Text
				style={{
					fontWeight: "600",
					...t.atoms.text_contrast_medium,
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				theme.atoms.text_contrast_medium
			</Text>
			<div
				style={{
					flex: 1,
					...t.atoms.border_contrast_low,
					borderTop: "1px solid black",
					borderTopWidth: 1,
				}}
			/>
			<Text
				style={{
					fontWeight: "600",
					...t.atoms.text_contrast_low,
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				theme.atoms.text_contrast_low
			</Text>
			<div
				style={{
					flex: 1,
					...t.atoms.border_contrast_low,
					borderTop: "1px solid black",
					borderTopWidth: 1,
				}}
			/>
			<div
				style={{
					width: "100%",
					gap: 12,
				}}
			>
				<div
					style={{
						...t.atoms.bg,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg</Text>
				</div>
				<div
					style={{
						...t.atoms.bg_contrast_25,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg_contrast_25</Text>
				</div>
				<div
					style={{
						...t.atoms.bg_contrast_50,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg_contrast_50</Text>
				</div>
				<div
					style={{
						...t.atoms.bg_contrast_100,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg_contrast_100</Text>
				</div>
				<div
					style={{
						...t.atoms.bg_contrast_200,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg_contrast_200</Text>
				</div>
				<div
					style={{
						...t.atoms.bg_contrast_300,
						justifyContent: "center",
						padding: 12,
					}}
				>
					<Text>theme.atoms.bg_contrast_300</Text>
				</div>
			</div>
		</div>
	);
}
