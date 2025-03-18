import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Dimensions } from "react-native";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import type { NavigationProp } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { Button } from "../util/forms/Button";

export function FollowingEndOfFeed() {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");
	const navigation = useNavigation<NavigationProp>();

	const onPressFindAccounts = React.useCallback(() => {
		navigation.navigate("Search", {});
	}, [navigation]);

	const onPressDiscoverFeeds = React.useCallback(() => {
		navigation.navigate("Feeds");
	}, [navigation]);

	return (
		<div
			style={{
				...styles.container,
				...pal.border,
				...{ minHeight: Dimensions.get("window").height * 0.75 },
			}}
		>
			<div style={styles.inner}>
				<Text
					type="xl-medium"
					style={{
						...s.textCenter,
						...pal.text,
					}}
				>
					You've reached the end of your feed! Find some more accounts to follow.
				</Text>
				<Button type="inverted" style={styles.emptyBtn} onPress={onPressFindAccounts}>
					<Text type="lg-medium" style={palInverted.text}>
						Find accounts to follow
					</Text>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon="angle-right" style={palInverted.text as FontAwesomeIconStyle} size={14} />
				</Button>

				<Text
					type="xl-medium"
					style={{
						...s.textCenter,
						...pal.text,
						...s.mt20,
					}}
				>
					You can also discover new Custom Feeds to follow.
				</Text>
				<Button
					type="inverted"
					style={{
						...styles.emptyBtn,
						...s.mt10,
					}}
					onPress={onPressDiscoverFeeds}
				>
					<Text type="lg-medium" style={palInverted.text}>
						Discover new custom feeds
					</Text>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon="angle-right" style={palInverted.text} size={14} />
				</Button>
			</div>
		</div>
	);
}
const styles = {
	container: {
		flexDirection: "row",
		justifyContent: "center",
		paddingTop: 40,
		paddingBottom: 80,
		paddingLeft: 30,
		paddingRight: 30,
		borderTopWidth: 1,
	},
	inner: {
		width: "100%",
		maxWidth: 460,
	},
	emptyBtn: {
		marginTop: 20,
		marginBottom: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "18px 24px",
		borderRadius: 30,
	},
} satisfies Record<string, React.CSSProperties>;
