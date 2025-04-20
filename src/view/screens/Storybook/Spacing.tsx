import { useTheme } from "#/alf";
import { H1, Text } from "#/components/Typography";

export function Spacing() {
	const t = useTheme();
	return (
		<div style={{ gap: 12 }}>
			<H1>Spacing</H1>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>2xs (2px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 2,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>xs (4px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 4,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>sm (8px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 8,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>md (12px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 12,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>lg (16px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 16,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>xl (20px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 20,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>2xl (24px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 24,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>3xl (28px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 28,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>4xl (32px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 32,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Text style={{ width: 80 }}>5xl (40px)</Text>
				<div
					style={{
						flex: 1,
						paddingTop: 40,
						...t.atoms.bg_contrast_300,
					}}
				/>
			</div>
		</div>
	);
}
