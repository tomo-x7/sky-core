import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { colors, gradients, s } from "#/lib/styles";

export const ConfirmLanguagesButton = ({
	onPress,
	extraText,
}: {
	onPress: () => void;
	extraText?: string;
}) => {
	const pal = usePalette("default");
	const { isMobile } = useWebMediaQueries();
	return (
		<div
			style={{
				...styles.btnContainer,
				...pal.borderDark,

				...(isMobile && {
					paddingBottom: 40,
					borderTopWidth: 1,
				}),
			}}
		>
			<button type="button" onClick={onPress}>
				<LinearGradient
					colors={[gradients.blueLight.start, gradients.blueLight.end]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					// @ts-expect-error
					style={styles.btn}
				>
					<Text
						style={{
							...s.white,
							...s.bold,
							...s.f18,
						}}
					>
						<>Done{extraText}</>
					</Text>
				</LinearGradient>
			</button>
		</div>
	);
};

const styles = {
	btnContainer: {
		paddingTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		borderRadius: 32,
		padding: 14,
		backgroundColor: colors.gray1,
	},
} satisfies Record<string, React.CSSProperties>;
