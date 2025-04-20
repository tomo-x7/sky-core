import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { Warning_Stroke2_Corner0_Rounded as Warning } from "#/components/icons/Warning";

export function FormError({ error }: { error?: string }) {
	const t = useTheme();

	if (!error) return null;

	return (
		<div
			style={{
				...{ backgroundColor: t.palette.negative_400 },
				flexDirection: "row",
				borderRadius: 8,
				padding: 12,
				gap: 8,
			}}
		>
			<Warning fill={t.palette.white} size="md" />
			<div style={{ flex: 1 }}>
				<Text
					style={{
						...{ color: t.palette.white },
						fontWeight: "600",
						lineHeight: 1.3,
					}}
				>
					{error}
				</Text>
			</div>
		</div>
	);
}
