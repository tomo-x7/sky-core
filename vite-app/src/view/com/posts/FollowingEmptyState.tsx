import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import { useNavigate } from "react-router-dom";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { MagnifyingGlassIcon } from "#/lib/icons";
import { s } from "#/lib/styles";
import { Button } from "../util/forms/Button";

export function FollowingEmptyState() {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");
	const navigate = useNavigate();

	const onPressFindAccounts = React.useCallback(() => {
		navigate("/search");
	}, [navigate]);

	const onPressDiscoverFeeds = React.useCallback(() => {
		navigate("/feeds");
	}, [navigate]);

	return (
		<div style={styles.container}>
			<div style={styles.inner}>
				<div style={styles.iconContainer}>
					<MagnifyingGlassIcon
						style={{
							...styles.icon,
							...pal.text,
						}}
						size={62}
					/>
				</div>
				<Text
					type="xl-medium"
					style={{
						...s.textCenter,
						...pal.text,
					}}
				>
					Your following feed is empty! Follow more users to see what's happening.
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
		height: "100%",
		flexDirection: "row",
		justifyContent: "center",
		padding: "40px 30px",
	},
	inner: {
		width: "100%",
		maxWidth: 460,
	},
	iconContainer: {
		marginBottom: 16,
	},
	icon: {
		marginLeft: "auto",
		marginRight: "auto",
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
