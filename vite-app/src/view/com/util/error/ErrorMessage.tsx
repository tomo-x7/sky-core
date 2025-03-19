import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TouchableOpacity } from "react-native";

import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";

export function ErrorMessage({
	message,
	numberOfLines,
	style,
	onPressTryAgain,
}: {
	message: string;
	numberOfLines?: number;
	style?: React.CSSProperties;
	onPressTryAgain?: () => void;
}) {
	const theme = useTheme();
	const pal = usePalette("error");
	return (
		<Layout.Center>
			<div
				style={{
					...styles.outer,
					...pal.view,
					...style,
				}}
			>
				<div
					style={{
						...styles.errorIcon,
						...{ backgroundColor: theme.palette.error.icon },
					}}
				>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon="exclamation" style={pal.text} size={16} />
				</div>
				<Text
					type="sm-medium"
					style={{
						...styles.message,
						...pal.text,
					}}
					numberOfLines={numberOfLines}
				>
					{message}
				</Text>
				{onPressTryAgain && (
					<TouchableOpacity
						style={styles.btn}
						onPress={onPressTryAgain}
						accessibilityRole="button"
						accessibilityLabel={"Retry"}
						accessibilityHint={"Retries the last action, which errored out"}
					>
						{/* @ts-expect-error */}
						<FontAwesomeIcon icon="arrows-rotate" style={{ color: theme.palette.error.icon }} size={18} />
					</TouchableOpacity>
				)}
			</div>
		</Layout.Center>
	);
}

const styles = {
	outer: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 8,
		paddingRight: 8,
	},
	errorIcon: {
		borderRadius: 12,
		width: 24,
		height: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	message: {
		flex: 1,
		paddingRight: 10,
	},
	btn: {
		padding: 4,
	},
} satisfies Record<string, React.CSSProperties>;
