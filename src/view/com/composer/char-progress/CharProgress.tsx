import { ProgressCircle, ProgressPie } from "#/components/Progress";
import { Text } from "#/components/Typography";
import { MAX_GRAPHEME_LENGTH } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";

export function CharProgress({
	count,
	max,
	style,
	textStyle,
	size,
}: {
	count: number;
	max?: number;
	style?: React.CSSProperties;
	textStyle?: React.CSSProperties;
	size?: number;
}) {
	const maxLength = max || MAX_GRAPHEME_LENGTH;
	const pal = usePalette("default");
	const textColor = count > maxLength ? "#e60000" : pal.colors.text;
	const circleColor = count > maxLength ? "#e60000" : pal.colors.link;
	return (
		<div
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8,
				...style,
			}}
		>
			<Text
				style={{
					...{ color: textColor, fontVariant: "tabular-nums" },
					flexGrow: 1,
					textAlign: "right",
					...textStyle,
				}}
			>
				{maxLength - count}
			</Text>
			{count > maxLength ? (
				<ProgressPie
					size={size ?? 30}
					borderWidth={4}
					borderColor={circleColor}
					color={circleColor}
					progress={Math.min((count - maxLength) / maxLength, 1)}
				/>
			) : (
				<ProgressCircle
					size={size ?? 30}
					borderWidth={1}
					borderColor={pal.colors.border}
					color={circleColor}
					progress={count / maxLength}
				/>
			)}
		</div>
	);
}
