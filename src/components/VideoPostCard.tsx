import {
	type AppBskyActorDefs,
	AppBskyEmbedVideo,
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	type ModerationDecision,
} from "@atproto/api";
import { useMemo } from "react";
import { LinearGradient } from "#/components/LinearGradient";

import { useTheme } from "#/alf";
import { BLUE_HUE } from "#/alf/util/colorGeneration";
import { select } from "#/alf/util/themeSelector";
import { Link } from "#/components/Link";
import { MediaInsetBorder } from "#/components/MediaInsetBorder";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { EyeSlash_Stroke2_Corner0_Rounded as Eye } from "#/components/icons/EyeSlash";
import { Heart2_Stroke2_Corner0_Rounded as Heart } from "#/components/icons/Heart2";
import { Repost_Stroke2_Corner2_Rounded as Repost } from "#/components/icons/Repost";
import * as Hider from "#/components/moderation/Hider";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { VideoFeedSourceContext } from "#/screens/VideoFeed/types";
import * as bsky from "#/types/bsky";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { formatCount } from "#/view/com/util/numeric/format";

function getBlackColor(t: ReturnType<typeof useTheme>) {
	return select(t.name, {
		light: t.palette.black,
		dark: t.atoms.bg_contrast_25.backgroundColor,
		dim: `hsl(${BLUE_HUE}, 28%, 6%)`,
	});
}

export function VideoPostCard({
	post,
	sourceContext,
	moderation,
	onInteract,
}: {
	post: AppBskyFeedDefs.PostView;
	sourceContext: VideoFeedSourceContext;
	moderation: ModerationDecision;
	/**
	 * Callback for metrics etc
	 */
	onInteract?: () => void;
}) {
	const t = useTheme();
	const embed = post.embed;
	const { state: pressed, onIn: onPressIn, onOut: onPressOut } = useInteractionState();

	const listModUi = moderation.ui("contentList");

	const mergedModui = useMemo(() => {
		const modui = moderation.ui("contentList");
		const mediaModui = moderation.ui("contentMedia");
		modui.alerts = [...modui.alerts, ...mediaModui.alerts];
		modui.blurs = [...modui.blurs, ...mediaModui.blurs];
		modui.filters = [...modui.filters, ...mediaModui.filters];
		modui.informs = [...modui.informs, ...mediaModui.informs];
		return modui;
	}, [moderation]);

	/**
	 * Filtering should be done at a higher level, such as `PostFeed` or
	 * `PostFeedVideoGridRow`, but we need to protect here as well.
	 */
	if (!AppBskyEmbedVideo.isView(embed)) return null;

	const author = post.author;
	const text = bsky.dangerousIsType<AppBskyFeedPost.Record>(post.record, AppBskyFeedPost.isRecord)
		? post.record?.text
		: "";
	const likeCount = post?.likeCount ?? 0;
	const repostCount = post?.repostCount ?? 0;
	const { thumbnail } = embed;
	const black = getBlackColor(t);

	const textAndAuthor = (
		<div
			style={{
				paddingRight: 4,
				...{ paddingTop: 6, gap: 4 },
			}}
		>
			{text && (
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.3,
					}}
					numberOfLines={2}
				>
					{text}
				</Text>
			)}
			<div
				style={{
					flexDirection: "row",
					gap: 4,
					alignItems: "center",
				}}
			>
				<div
					style={{
						position: "relative",
						borderRadius: 999,
						...{ width: 20, height: 20 },
					}}
				>
					<UserAvatar type="user" size={20} avatar={post.author.avatar} />
					<MediaInsetBorder />
				</div>
				<Text
					style={{
						flex: 1,
						fontSize: 14,
						letterSpacing: 0,
						lineHeight: 1.15,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={1}
				>
					{sanitizeHandle(post.author.handle, "@")}
				</Text>
			</div>
		</div>
	);

	return (
		<Link
			label={`Video from ${author.handle}: ${text}`}
			to={"/video-feed"}
			// to={{
			// 	screen: "VideoFeed",
			// 	params: {
			// 		...sourceContext,
			// 		initialPostUri: post.uri,
			// 	},
			// }}
			onPress={() => {
				onInteract?.();
			}}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={{
				flexDirection: "column",

				...{
					alignItems: undefined,
					justifyContent: undefined,
				},
			}}
		>
			<Hider.Outer modui={mergedModui}>
				<Hider.Mask>
					<div
						style={{
							justifyContent: "center",
							borderRadius: 12,
							overflow: "hidden",

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								width: "100%",
								height: "100%",
								opacity: pressed ? 0.8 : 1,
								filter: "blur(100px)",
							}}
						/>
						<MediaInsetBorder />
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									justifyContent: "center",
									alignItems: "center",

									...{
										backgroundColor: "black",
										opacity: 0.2,
									},
								}}
							/>
							<div
								style={{
									alignItems: "center",
									gap: 4,
								}}
							>
								<Eye size="lg" fill="white" />
								<Text
									style={{
										fontSize: 14,
										letterSpacing: 0,
										...{ color: "white" },
									}}
								>
									{"Hidden"}
								</Text>
							</div>
						</div>
					</div>
					{listModUi.blur ? <VideoPostCardTextPlaceholder author={post.author} /> : textAndAuthor}
				</Hider.Mask>
				<Hider.Content>
					<div
						style={{
							justifyContent: "center",
							borderRadius: 12,
							overflow: "hidden",

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								width: "100%",
								height: "100%",
								opacity: pressed ? 0.8 : 1,
							}}
						/>
						<MediaInsetBorder />

						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: "auto",
									left: 0,
									right: 0,
									bottom: 0,
									paddingTop: 24,
								}}
							>
								<LinearGradient
									colors={[black, "rgba(0, 0, 0, 0)"]}
									locations={[0.02, 1]}
									start={{ x: 0, y: 1 }}
									end={{ x: 0, y: 0 }}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										...{ opacity: 0.9 },
									}}
								/>

								<div
									style={{
										position: "relative",
										zIndex: 10,
										padding: 12,
										flexDirection: "row",
										gap: 12,
									}}
								>
									{likeCount > 0 && (
										<div
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 4,
											}}
										>
											<Heart size="sm" fill="white" />
											<Text
												style={{
													fontSize: 14,
													letterSpacing: 0,
													fontWeight: "600",
													...{ color: "white" },
												}}
											>
												{formatCount(likeCount)}
											</Text>
										</div>
									)}
									{repostCount > 0 && (
										<div
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 4,
											}}
										>
											<Repost size="sm" fill="white" />
											<Text
												style={{
													fontSize: 14,
													letterSpacing: 0,
													fontWeight: "600",
													...{ color: "white" },
												}}
											>
												{formatCount(repostCount)}
											</Text>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
					{textAndAuthor}
				</Hider.Content>
			</Hider.Outer>
		</Link>
	);
}

export function VideoPostCardPlaceholder() {
	const t = useTheme();
	const black = getBlackColor(t);

	return (
		<div style={{ flex: 1 }}>
			<div
				style={{
					borderRadius: 12,
					overflow: "hidden",

					...{
						backgroundColor: black,
						aspectRatio: 9 / 16,
					},
				}}
			>
				<MediaInsetBorder />
			</div>
			<VideoPostCardTextPlaceholder />
		</div>
	);
}

export function VideoPostCardTextPlaceholder({
	author,
}: {
	author?: AppBskyActorDefs.ProfileViewBasic;
}) {
	const t = useTheme();

	return (
		<div style={{ flex: 1 }}>
			<div
				style={{
					paddingRight: 4,
					...{ paddingTop: 8, gap: 6 },
				}}
			>
				<div
					style={{
						width: "100%",
						borderRadius: 4,
						...t.atoms.bg_contrast_50,

						...{
							height: 14,
						},
					}}
				/>
				<div
					style={{
						borderRadius: 4,
						...t.atoms.bg_contrast_50,
						height: 14,
						width: "70%",
					}}
				/>
				{author ? (
					<div
						style={{
							flexDirection: "row",
							gap: 4,
							alignItems: "center",
						}}
					>
						<div
							style={{
								position: "relative",
								borderRadius: 999,
								...{ width: 20, height: 20 },
							}}
						>
							<UserAvatar type="user" size={20} avatar={author.avatar} />
							<MediaInsetBorder />
						</div>
						<Text
							style={{
								flex: 1,
								fontSize: 14,
								letterSpacing: 0,
								lineHeight: 1.15,
								...t.atoms.text_contrast_medium,
							}}
							numberOfLines={1}
						>
							{sanitizeHandle(author.handle, "@")}
						</Text>
					</div>
				) : (
					<div
						style={{
							flexDirection: "row",
							gap: 4,
							alignItems: "center",
						}}
					>
						<div
							style={{
								borderRadius: 999,
								...t.atoms.bg_contrast_50,

								...{
									width: 20,
									height: 20,
								},
							}}
						/>
						<div
							style={{
								borderRadius: 4,
								...t.atoms.bg_contrast_25,

								...{
									height: 12,
									width: "75%",
								},
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export function CompactVideoPostCard({
	post,
	sourceContext,
	moderation,
	onInteract,
}: {
	post: AppBskyFeedDefs.PostView;
	sourceContext: VideoFeedSourceContext;
	moderation: ModerationDecision;
	/**
	 * Callback for metrics etc
	 */
	onInteract?: () => void;
}) {
	const t = useTheme();
	const embed = post.embed;
	const { state: pressed, onIn: onPressIn, onOut: onPressOut } = useInteractionState();

	const mergedModui = useMemo(() => {
		const modui = moderation.ui("contentList");
		const mediaModui = moderation.ui("contentMedia");
		modui.alerts = [...modui.alerts, ...mediaModui.alerts];
		modui.blurs = [...modui.blurs, ...mediaModui.blurs];
		modui.filters = [...modui.filters, ...mediaModui.filters];
		modui.informs = [...modui.informs, ...mediaModui.informs];
		return modui;
	}, [moderation]);

	/**
	 * Filtering should be done at a higher level, such as `PostFeed` or
	 * `PostFeedVideoGridRow`, but we need to protect here as well.
	 */
	if (!AppBskyEmbedVideo.isView(embed)) return null;

	const likeCount = post?.likeCount ?? 0;
	const { thumbnail } = embed;
	const black = getBlackColor(t);

	return (
		<Link
			label={"View video"}
			to={"/video-feed"}
			// to={{
			// 	screen: "VideoFeed",
			// 	params: {
			// 		...sourceContext,
			// 		initialPostUri: post.uri,
			// 	},
			// }}
			onPress={() => {
				onInteract?.();
			}}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={{
				flexDirection: "column",

				...{
					alignItems: undefined,
					justifyContent: undefined,
				},
			}}
		>
			<Hider.Outer modui={mergedModui}>
				<Hider.Mask>
					<div
						style={{
							justifyContent: "center",
							borderRadius: 12,
							overflow: "hidden",

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								width: "100%",
								height: "100%",
								opacity: pressed ? 0.8 : 1,
								filter: "blur(100px)",
							}}
						/>
						<MediaInsetBorder />
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									justifyContent: "center",
									alignItems: "center",

									...{
										backgroundColor: "black",
										opacity: 0.2,
									},
								}}
							/>
							<div
								style={{
									alignItems: "center",
									gap: 4,
								}}
							>
								<Eye size="lg" fill="white" />
								<Text
									style={{
										fontSize: 14,
										letterSpacing: 0,
										...{ color: "white" },
									}}
								>
									{"Hidden"}
								</Text>
							</div>
						</div>
					</div>
				</Hider.Mask>
				<Hider.Content>
					<div
						style={{
							justifyContent: "center",
							borderRadius: 12,
							overflow: "hidden",

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								width: "100%",
								height: "100%",
								...{ opacity: pressed ? 0.8 : 1 },
							}}
						/>
						<MediaInsetBorder />

						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: "auto",
									padding: 8,
								}}
							>
								<div
									style={{
										position: "relative",
										borderRadius: 999,
										...{ width: 20, height: 20 },
									}}
								>
									<UserAvatar type="user" size={20} avatar={post.author.avatar} />
									<MediaInsetBorder />
								</div>
							</div>
							<div
								style={{
									position: "absolute",
									top: "auto",
									left: 0,
									right: 0,
									bottom: 0,
									paddingTop: 24,
								}}
							>
								<LinearGradient
									colors={[black, "rgba(0, 0, 0, 0)"]}
									locations={[0.02, 1]}
									start={{ x: 0, y: 1 }}
									end={{ x: 0, y: 0 }}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										...{ opacity: 0.9 },
									}}
								/>

								<div
									style={{
										position: "relative",
										zIndex: 10,
										padding: 8,
										flexDirection: "row",
										gap: 12,
									}}
								>
									{likeCount > 0 && (
										<div
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 4,
											}}
										>
											<Heart size="sm" fill="white" />
											<Text
												style={{
													fontSize: 14,
													letterSpacing: 0,
													fontWeight: "600",
													...{ color: "white" },
												}}
											>
												{formatCount(likeCount)}
											</Text>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</Hider.Content>
			</Hider.Outer>
		</Link>
	);
}

export function CompactVideoPostCardPlaceholder() {
	const t = useTheme();
	const black = getBlackColor(t);

	return (
		<div style={{ flex: 1 }}>
			<div
				style={{
					borderRadius: 12,
					overflow: "hidden",

					...{
						backgroundColor: black,
						aspectRatio: 9 / 16,
					},
				}}
			>
				<MediaInsetBorder />
			</div>
		</div>
	);
}
