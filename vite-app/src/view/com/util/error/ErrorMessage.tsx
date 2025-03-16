import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from "react-native";

import * as Layout from "#/components/Layout";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";
import { Text } from "../text/Text";

export function ErrorMessage({
	message,
	numberOfLines,
	style,
	onPressTryAgain,
}: {
	message: string;
	numberOfLines?: number;
	style?: StyleProp<ViewStyle>;
	onPressTryAgain?: () => void;
}) {
	const theme = useTheme();
	const pal = usePalette("error");
	return (
		<Layout.Center>
			<View
				testID="errorMessageView"
				style={{
					...styles.outer,
					...pal.view,
					...style,
				}}
			>
				<View
					style={{
						...styles.errorIcon,
						...{ backgroundColor: theme.palette.error.icon },
					}}
				>
					{/* @ts-ignore */}
					<FontAwesomeIcon icon="exclamation" style={pal.text} size={16} />
				</View>
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
						testID="errorMessageTryAgainButton"
						style={styles.btn}
						onPress={onPressTryAgain}
						accessibilityRole="button"
						accessibilityLabel={"Retry"}
						accessibilityHint={"Retries the last action, which errored out"}
					>
						{/* @ts-ignore */}
						<FontAwesomeIcon icon="arrows-rotate" style={{ color: theme.palette.error.icon }} size={18} />
					</TouchableOpacity>
				)}
			</View>
		</Layout.Center>
	);
}

const styles = StyleSheet.create({
	outer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 8,
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
		paddingHorizontal: 4,
		paddingVertical: 4,
	},
});
