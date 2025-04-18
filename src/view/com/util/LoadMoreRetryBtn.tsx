import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { Button } from "./forms/Button";

export function LoadMoreRetryBtn({
	label,
	onPress,
}: {
	label: string;
	onPress: () => void;
}) {
	const pal = usePalette("default");
	return (
		<Button type="default-light" onPress={onPress} style={styles.loadMoreRetry}>
			{/* @ts-expect-error */}
			<FontAwesomeIcon icon="arrow-rotate-left" style={pal.textLight} size={18} />
			<Text
				style={{
					...pal.textLight,
					...styles.label,
				}}
			>
				{label}
			</Text>
		</Button>
	);
}

const styles = {
	loadMoreRetry: {
		flexDirection: "row",
		gap: 14,
		alignItems: "center",
		borderRadius: 0,
		marginTop: 1,
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 20,
		paddingRight: 20,
	},
	label: {
		flex: 1,
	},
} satisfies Record<string, React.CSSProperties>;
