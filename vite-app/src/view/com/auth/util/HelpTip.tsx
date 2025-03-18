import { useColorSchemeStyle } from "#/lib/hooks/useColorSchemeStyle";
import { InfoCircleIcon } from "#/lib/icons";
import { colors, s } from "#/lib/styles";
import { Text } from "#/view/com/util/text/Text";

export function HelpTip({ text }: { text: string }) {
	const bg = useColorSchemeStyle({ backgroundColor: colors.gray1 }, { backgroundColor: colors.gray8 });
	const fg = useColorSchemeStyle({ color: colors.gray5 }, { color: colors.gray4 });
	return (
		<div
			style={{
				...styles.helptip,
				...bg,
			}}
		>
			<div style={styles.icon}>
				<InfoCircleIcon size={18} style={fg} strokeWidth={1.5} />
			</div>
			<Text
				type="xs-medium"
				style={{
					...fg,
					...s.ml5,
					...s.flex1,
				}}
			>
				{text}
			</Text>
		</div>
	);
}

const styles = {
	icon: {
		width: 18,
	},
	helptip: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderRadius: 6,
		padding: "8px 10px",
	},
} satisfies Record<string, React.CSSProperties>;
