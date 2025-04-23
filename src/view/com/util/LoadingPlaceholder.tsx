import { useMemo } from "react";

import { atoms as a, useTheme as useTheme_NEW } from "#/alf";
import { Bubble_Stroke2_Corner2_Rounded as Bubble } from "#/components/icons/Bubble";
import {
	Heart2_Filled_Stroke2_Corner0_Rounded as HeartIconFilled,
	Heart2_Stroke2_Corner0_Rounded as HeartIconOutline,
} from "#/components/icons/Heart2";
import { Repost_Stroke2_Corner2_Rounded as Repost } from "#/components/icons/Repost";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";

export function LoadingPlaceholder({
	width,
	height,
	style,
}: {
	width: React.CSSProperties["width"];
	height: React.CSSProperties["height"];
	style?: React.CSSProperties;
}) {
	const theme = useTheme();
	return (
		<div
			style={{
				...styles.loadingPlaceholder,

				width,
				height,
				backgroundColor: theme.palette.default.backgroundLight,

				...style,
			}}
		/>
	);
}

export function PostLoadingPlaceholder({
	style,
}: {
	style?: React.CSSProperties;
}) {
	const t = useTheme_NEW();
	const pal = usePalette("default");
	return (
		<div
			style={{
				...styles.post,
				...pal.view,
				...style,
			}}
		>
			<LoadingPlaceholder
				width={42}
				height={42}
				style={{
					...styles.avatar,

					...{
						position: "relative",
						top: -6,
					},
				}}
			/>
			<div style={s.flex1}>
				<LoadingPlaceholder width={100} height={6} style={{ marginBottom: 10 }} />
				<LoadingPlaceholder width="95%" height={6} style={{ marginBottom: 8 }} />
				<LoadingPlaceholder width="95%" height={6} style={{ marginBottom: 8 }} />
				<LoadingPlaceholder width="80%" height={6} style={{ marginBottom: 11 }} />
				<div style={styles.postCtrls}>
					<div
						style={{
							...styles.postCtrl,
							...{ marginLeft: -6 },
						}}
					>
						<div style={styles.postBtn}>
							<Bubble
								style={{
									...{
										color: t.palette.contrast_500,
									},

									...{ pointerEvents: "none" },
								}}
								width={18}
							/>
						</div>
					</div>
					<div style={styles.postCtrl}>
						<div style={styles.postBtn}>
							<Repost
								style={{
									...{
										color: t.palette.contrast_500,
									},

									...{ pointerEvents: "none" },
								}}
								width={18}
							/>
						</div>
					</div>
					<div style={styles.postCtrl}>
						<div style={styles.postBtn}>
							<HeartIconOutline
								style={{
									...{
										color: t.palette.contrast_500,
									},

									...{ pointerEvents: "none" },
								}}
								width={18}
							/>
						</div>
					</div>
					<div style={styles.postCtrl}>
						<div
							style={{
								...styles.postBtn,
								...{ minHeight: 30 },
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export function PostFeedLoadingPlaceholder() {
	return (
		<div>
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
			<PostLoadingPlaceholder />
		</div>
	);
}

export function NotificationLoadingPlaceholder({
	style,
}: {
	style?: React.CSSProperties;
}) {
	const pal = usePalette("default");
	return (
		<div
			style={{
				...styles.notification,
				...pal.view,
				...style,
			}}
		>
			<div
				style={{
					...{ width: 60 },
					alignItems: "flex-end",
					paddingRight: 8,
					paddingTop: 2,
				}}
			>
				<HeartIconFilled size="xl" style={{ color: pal.colors.backgroundLight }} />
			</div>
			<div style={{ flex: 1 }}>
				<div
					style={{
						flexDirection: "row",
						...s.mb10,
					}}
				>
					<LoadingPlaceholder width={35} height={35} style={styles.smallAvatar} />
				</div>
				<LoadingPlaceholder width="90%" height={6} style={s.mb5} />
				<LoadingPlaceholder width="70%" height={6} style={s.mb5} />
			</div>
		</div>
	);
}

export function NotificationFeedLoadingPlaceholder() {
	return (
		<>
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
			<NotificationLoadingPlaceholder />
		</>
	);
}

export function ProfileCardLoadingPlaceholder({
	style,
}: {
	style?: React.CSSProperties;
}) {
	const pal = usePalette("default");
	return (
		<div
			style={{
				...styles.profileCard,
				...pal.view,
				...style,
			}}
		>
			<LoadingPlaceholder width={40} height={40} style={styles.profileCardAvi} />
			<div>
				<LoadingPlaceholder width={140} height={8} style={s.mb5} />
				<LoadingPlaceholder width={120} height={8} style={s.mb10} />
				<LoadingPlaceholder width={220} height={8} style={s.mb5} />
			</div>
		</div>
	);
}

export function ProfileCardFeedLoadingPlaceholder() {
	return (
		<>
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
			<ProfileCardLoadingPlaceholder />
		</>
	);
}

export function FeedLoadingPlaceholder({
	style,
	showLowerPlaceholder = true,
	showTopBorder = true,
}: {
	style?: React.CSSProperties;
	showTopBorder?: boolean;
	showLowerPlaceholder?: boolean;
}) {
	const pal = usePalette("default");
	return (
		<div
			style={{
				...{
					paddingLeft: 12,
					paddingRight: 12,
					paddingTop: 18,
					paddingBottom: 18,
					borderTopWidth: showTopBorder ? 1 : 0,
				},

				...pal.border,
				...style,
			}}
		>
			<div
				style={{
					...pal.view,
					...{ flexDirection: "row" },
				}}
			>
				<LoadingPlaceholder
					width={36}
					height={36}
					style={{
						...styles.avatar,
						...{ borderRadius: 6 },
					}}
				/>
				<div style={s.flex1}>
					<LoadingPlaceholder
						width={100}
						height={8}
						style={{
							...s.mt5,
							...s.mb10,
						}}
					/>
					<LoadingPlaceholder width={120} height={8} />
				</div>
			</div>
			{showLowerPlaceholder && (
				<div style={{ padding: "10px 5px" }}>
					<LoadingPlaceholder width={260} height={8} style={{ marginTop: 12, marginBottom: 12 }} />
					<LoadingPlaceholder width={120} height={8} />
				</div>
			)}
		</div>
	);
}

export function FeedFeedLoadingPlaceholder() {
	return (
		<>
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
			<FeedLoadingPlaceholder />
		</>
	);
}

export function ChatListItemLoadingPlaceholder({
	style,
}: {
	style?: React.CSSProperties;
}) {
	const t = useTheme_NEW();
	const random = useMemo(() => Math.random(), []);
	return (
		<div
			style={{
				flexDirection: "row",
				gap: 12,
				paddingLeft: 16,
				paddingRight: 16,
				marginTop: 16,
				...t.atoms.bg,
				...style,
			}}
		>
			<LoadingPlaceholder width={52} height={52} style={{ borderRadius:999 }} />
			<div>
				<LoadingPlaceholder width={140} height={12} style={{ marginTop: 4 }} />
				<LoadingPlaceholder width={120} height={8} style={{ marginTop: 8 }} />
				<LoadingPlaceholder width={80 + random * 100} height={8} style={{ marginTop: 8 }} />
			</div>
		</div>
	);
}

export function ChatListLoadingPlaceholder() {
	return (
		<>
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
			<ChatListItemLoadingPlaceholder />
		</>
	);
}

const styles = {
	loadingPlaceholder: {
		borderRadius: 6,
	},
	post: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingLeft: 10,
		paddingTop: 20,
		paddingBottom: 5,
		paddingRight: 15,
	},
	postCtrls: {
		opacity: 0.5,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	postCtrl: {
		flex: 1,
	},
	postBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		padding: 5,
	},
	avatar: {
		borderRadius: 999,
		marginRight: 10,
		marginLeft: 8,
	},
	notification: {
		flexDirection: "row",
		padding: 10,
	},
	profileCard: {
		flexDirection: "row",
		padding: 10,
		margin: 1,
	},
	profileCardAvi: {
		borderRadius: 999,
		marginRight: 10,
	},
	smallAvatar: {
		borderRadius: 999,
		marginRight: 10,
	},
} satisfies Record<string, React.CSSProperties>;
