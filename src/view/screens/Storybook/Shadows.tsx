import { atoms as a, useTheme } from "#/alf";
import { H1, Text } from "#/components/Typography";

export function Shadows() {
	const t = useTheme();

	return (
		<div style={a.gap_md}>
			<H1>Shadows</H1>
			<div
				style={{
					...a.flex_row,
					...a.gap_5xl,
				}}
			>
				<div
					style={{
						...a.flex_1,
						...a.justify_center,
						...a.px_lg,
						...a.py_2xl,
						...t.atoms.bg,
						...t.atoms.shadow_sm,
					}}
				>
					<Text>shadow_sm</Text>
				</div>

				<div
					style={{
						...a.flex_1,
						...a.justify_center,
						...a.px_lg,
						...a.py_2xl,
						...t.atoms.bg,
						...t.atoms.shadow_md,
					}}
				>
					<Text>shadow_md</Text>
				</div>

				<div
					style={{
						...a.flex_1,
						...a.justify_center,
						...a.px_lg,
						...a.py_2xl,
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
