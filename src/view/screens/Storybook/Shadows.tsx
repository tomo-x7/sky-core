import { atoms as a, useTheme } from "#/alf";
import { H1, Text } from "#/components/Typography";

export function Shadows() {
	const t = useTheme();

	return (
		<div style={{ gap:12 }}>
			<H1>Shadows</H1>
			<div
				style={{
					flexDirection: "row",
					gap: 40,
				}}
			>
				<div
					style={{
						flex: 1,
						justifyContent: "center",
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 24,
						paddingBottom: 24,
						...t.atoms.bg,
						...t.atoms.shadow_sm,
					}}
				>
					<Text>shadow_sm</Text>
				</div>

				<div
					style={{
						flex: 1,
						justifyContent: "center",
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 24,
						paddingBottom: 24,
						...t.atoms.bg,
						...t.atoms.shadow_md,
					}}
				>
					<Text>shadow_md</Text>
				</div>

				<div
					style={{
						flex: 1,
						justifyContent: "center",
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 24,
						paddingBottom: 24,
						...t.atoms.bg,
						...t.atoms.shadow_lg,
					}}
				>
					<Text>shadow_lg</Text>
				</div>
			</div>
		</div>
	);
}
