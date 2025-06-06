import { colors } from "#/lib/styles";

export const styles = {
	bottomBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		borderTopWidth: 1,
		paddingLeft: 5,
		paddingRight: 10,
	},
	bottomBarWeb: {
		position: "fixed",
	},
	ctrl: {
		flex: 1,
		paddingTop: 13,
		paddingBottom: 4,
	},
	notificationCount: {
		position: "absolute",
		left: "52%",
		top: 8,
		backgroundColor: colors.blue3,
		paddingLeft: 4,
		paddingRight: 4,
		paddingBottom: 1,
		borderRadius: 6,
		zIndex: 1,
	},
	notificationCountLight: {
		borderColor: colors.white,
	},
	notificationCountDark: {
		borderColor: colors.gray8,
	},
	notificationCountLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.white,
		fontVariant: "tabular-nums",
	},
	hasNewBadge: {
		position: "absolute",
		left: "54%",
		marginLeft: 4,
		top: 10,
		width: 8,
		height: 8,
		backgroundColor: colors.blue3,
		borderRadius: 6,
		zIndex: 1,
	},
	ctrlIcon: {
		marginLeft: "auto",
		marginRight: "auto",
	},
	ctrlIconSizingWrapper: {},
	homeIcon: {},
	feedsIcon: {},
	searchIcon: {
		top: -1,
	},
	bellIcon: {},
	profileIcon: {
		borderRadius: 100,
		borderWidth: 1,
		borderColor: "transparent",
	},
	messagesIcon: {},
	onProfile: {
		borderWidth: 1,
		borderRadius: 100,
	},
} satisfies Record<string, React.CSSProperties>;
