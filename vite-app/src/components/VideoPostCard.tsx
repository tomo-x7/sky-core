import {
	type AppBskyActorDefs,
	AppBskyEmbedVideo,
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	type ModerationDecision,
} from "@atproto/api";
import { useMemo } from "react";
import { LinearGradient } from "#/components/LinearGradient";

import { atoms as a, useTheme } from "#/alf";
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
				...a.pr_xs,
				...{ paddingTop: 6, gap: 4 },
			}}
		>
			{text && (
				<Text
					style={{
						...a.text_md,
						...a.leading_snug,
					}}
					numberOfLines={2}
					emoji
				>
					{text}
				</Text>
			)}
			<div
				style={{
					...a.flex_row,
					...a.gap_xs,
					...a.align_center,
				}}
			>
				<div
					style={{
						...a.relative,
						...a.rounded_full,
						...{ width: 20, height: 20 },
					}}
				>
					<UserAvatar type="user" size={20} avatar={post.author.avatar} />
					<MediaInsetBorder />
				</div>
				<Text
					style={{
						...a.flex_1,
						...a.text_sm,
						...a.leading_tight,
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
			to={{
				screen: "VideoFeed",
				params: {
					...sourceContext,
					initialPostUri: post.uri,
				},
			}}
			onPress={() => {
				onInteract?.();
			}}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={{
				...a.flex_col,

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
							...a.justify_center,
							...a.rounded_md,
							...a.overflow_hidden,

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								...a.w_full,
								...a.h_full,
								opacity: pressed ? 0.8 : 1,
								filter: "blur(100px)",
							}}
						/>
						<MediaInsetBorder />
						<div
							style={{
								...a.absolute,
								...a.inset_0,
								...a.justify_center,
								...a.align_center,
							}}
						>
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.justify_center,
									...a.align_center,

									...{
										backgroundColor: "black",
										opacity: 0.2,
									},
								}}
							/>
							<div
								style={{
									...a.align_center,
									...a.gap_xs,
								}}
							>
								<Eye size="lg" fill="white" />
								<Text
									style={{
										...a.text_sm,
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
							...a.justify_center,
							...a.rounded_md,
							...a.overflow_hidden,

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								...a.w_full,
								...a.h_full,
								opacity: pressed ? 0.8 : 1,
							}}
						/>
						<MediaInsetBorder />

						<div
							style={{
								...a.absolute,
								...a.inset_0,
							}}
						>
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.pt_2xl,

									...{
										top: "auto",
									},
								}}
							>
								<LinearGradient
									colors={[black, "rgba(0, 0, 0, 0)"]}
									locations={[0.02, 1]}
									start={{ x: 0, y: 1 }}
									end={{ x: 0, y: 0 }}
									style={{
										...a.absolute,
										...a.inset_0,
										...{ opacity: 0.9 },
									}}
								/>

								<div
									style={{
										...a.relative,
										...a.z_10,
										...a.p_md,
										...a.flex_row,
										...a.gap_md,
									}}
								>
									{likeCount > 0 && (
										<div
											style={{
												...a.flex_row,
												...a.align_center,
												...a.gap_xs,
											}}
										>
											<Heart size="sm" fill="white" />
											<Text
												style={{
													...a.text_sm,
													...a.font_bold,
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
												...a.flex_row,
												...a.align_center,
												...a.gap_xs,
											}}
										>
											<Repost size="sm" fill="white" />
											<Text
												style={{
													...a.text_sm,
													...a.font_bold,
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
		<div style={a.flex_1}>
			<div
				style={{
					...a.rounded_md,
					...a.overflow_hidden,

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
		<div style={a.flex_1}>
			<div
				style={{
					...a.pr_xs,
					...{ paddingTop: 8, gap: 6 },
				}}
			>
				<div
					style={{
						...a.w_full,
						...a.rounded_xs,
						...t.atoms.bg_contrast_50,

						...{
							height: 14,
						},
					}}
				/>
				<div
					style={{
						...a.w_full,
						...a.rounded_xs,
						...t.atoms.bg_contrast_50,

						...{
							height: 14,
							width: "70%",
						},
					}}
				/>
				{author ? (
					<div
						style={{
							...a.flex_row,
							...a.gap_xs,
							...a.align_center,
						}}
					>
						<div
							style={{
								...a.relative,
								...a.rounded_full,
								...{ width: 20, height: 20 },
							}}
						>
							<UserAvatar type="user" size={20} avatar={author.avatar} />
							<MediaInsetBorder />
						</div>
						<Text
							style={{
								...a.flex_1,
								...a.text_sm,
								...a.leading_tight,
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
							...a.flex_row,
							...a.gap_xs,
							...a.align_center,
						}}
					>
						<div
							style={{
								...a.rounded_full,
								...t.atoms.bg_contrast_50,

								...{
									width: 20,
									height: 20,
								},
							}}
						/>
						<div
							style={{
								...a.rounded_xs,
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
			to={{
				screen: "VideoFeed",
				params: {
					...sourceContext,
					initialPostUri: post.uri,
				},
			}}
			onPress={() => {
				onInteract?.();
			}}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={{
				...a.flex_col,

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
							...a.justify_center,
							...a.rounded_md,
							...a.overflow_hidden,

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								...a.w_full,
								...a.h_full,
								opacity: pressed ? 0.8 : 1,
								filter: "blur(100px)",
							}}
						/>
						<MediaInsetBorder />
						<div
							style={{
								...a.absolute,
								...a.inset_0,
								...a.justify_center,
								...a.align_center,
							}}
						>
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.justify_center,
									...a.align_center,

									...{
										backgroundColor: "black",
										opacity: 0.2,
									},
								}}
							/>
							<div
								style={{
									...a.align_center,
									...a.gap_xs,
								}}
							>
								<Eye size="lg" fill="white" />
								<Text
									style={{
										...a.text_sm,
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
							...a.justify_center,
							...a.rounded_md,
							...a.overflow_hidden,

							...{
								backgroundColor: black,
								aspectRatio: 9 / 16,
							},
						}}
					>
						<img
							src={thumbnail}
							style={{
								...a.w_full,
								...a.h_full,
								...{ opacity: pressed ? 0.8 : 1 },
							}}
						/>
						<MediaInsetBorder />

						<div
							style={{
								...a.absolute,
								...a.inset_0,
							}}
						>
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.p_sm,
									...{ bottom: "auto" },
								}}
							>
								<div
									style={{
										...a.relative,
										...a.rounded_full,
										...{ width: 20, height: 20 },
									}}
								>
									<UserAvatar type="user" size={20} avatar={post.author.avatar} />
									<MediaInsetBorder />
								</div>
							</div>
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.pt_2xl,

									...{
										top: "auto",
									},
								}}
							>
								<LinearGradient
									colors={[black, "rgba(0, 0, 0, 0)"]}
									locations={[0.02, 1]}
									start={{ x: 0, y: 1 }}
									end={{ x: 0, y: 0 }}
									style={{
										...a.absolute,
										...a.inset_0,
										...{ opacity: 0.9 },
									}}
								/>

								<div
									style={{
										...a.relative,
										...a.z_10,
										...a.p_sm,
										...a.flex_row,
										...a.gap_md,
									}}
								>
									{likeCount > 0 && (
										<div
											style={{
												...a.flex_row,
												...a.align_center,
												...a.gap_xs,
											}}
										>
											<Heart size="sm" fill="white" />
											<Text
												style={{
													...a.text_sm,
													...a.font_bold,
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
		<div style={a.flex_1}>
			<div
				style={{
					...a.rounded_md,
					...a.overflow_hidden,

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
