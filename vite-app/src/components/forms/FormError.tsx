import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { Warning_Stroke2_Corner0_Rounded as Warning } from "#/components/icons/Warning";

export function FormError({ error }: { error?: string }) {
	const t = useTheme();

	if (!error) return null;

	return (
		<View style={[{ backgroundColor: t.palette.negative_400 }, a.flex_row, a.rounded_sm, a.p_md, a.gap_sm]}>
			<Warning fill={t.palette.white} size="md" />
			<View style={[a.flex_1]}>
				<Text style={[{ color: t.palette.white }, a.font_bold, a.leading_snug]}>{error}</Text>
			</View>
		</View>
	);
}
