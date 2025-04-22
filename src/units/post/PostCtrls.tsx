import {
	type AppBskyFeedDefs,
	type AppBskyFeedPost,
	type AppBskyFeedThreadgate,
	AtUri,
	type RichText as RichTextAPI,
} from "@atproto/api";
import React, { type CSSProperties, memo, useCallback, useState } from "react";

import { atoms as a, flatten, useTheme } from "#/alf";
import { useDialogControl } from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as ArrowOutOfBox } from "#/components/icons/ArrowOutOfBox";
import { Bubble_Stroke2_Corner2_Rounded as Bubble } from "#/components/icons/Bubble";
import { POST_CTRL_HITSLOP } from "#/lib/constants";
import { CountWheel } from "#/lib/custom-animations/CountWheel";
import { AnimatedLikeIcon } from "#/lib/custom-animations/LikeIcon";
import { makeProfileLink } from "#/lib/routes/links";
import { shareUrl } from "#/lib/sharing";
import { toShareUrl } from "#/lib/strings/url-helpers";
import type { Shadow } from "#/state/cache/types";
import { useFeedFeedbackContext } from "#/state/feed-feedback";
import { usePostLikeMutationQueue, usePostRepostMutationQueue } from "#/state/queries/post";
import { useRequireAuth, useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { ProgressGuideAction, useProgressGuideControls } from "#/state/shell/progress-guide";
import * as Toast from "../../view/com/util/Toast";
import { PostDropdownBtn } from "../../view/com/util/forms/PostDropdownBtn";
import { formatCount } from "../../view/com/util/numeric/format";
import { RepostButton } from "../../view/com/util/post-ctrls/RepostButton";

let PostCtrls = ({
	big,
	post,
	record,
	richText,
	feedContext,
	style,
	onPressReply,
	onPostReply,
	threadgateRecord,
}: {
	big?: boolean;
	post: Shadow<AppBskyFeedDefs.PostView>;
	record: AppBskyFeedPost.Record;
	richText: RichTextAPI;
	feedContext?: string | undefined;
	style?: React.CSSProperties;
	onPressReply: () => void;
	onPostReply?: (postUri: string | undefined) => void;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}): React.ReactNode => {
	const t = useTheme();
	const { openComposer } = useComposerControls();
	const { currentAccount } = useSession();
	const [queueLike, queueUnlike] = usePostLikeMutationQueue(post);
	const [queueRepost, queueUnrepost] = usePostRepostMutationQueue(post);
	const requireAuth = useRequireAuth();
	const loggedOutWarningPromptControl = useDialogControl();
	const { sendInteraction } = useFeedFeedbackContext();
	const { captureAction } = useProgressGuideControls();
	const [pressed, setPressed] = useState(false);
	const [hovered, setHovered] = useState(false);
	const isBlocked = Boolean(
		post.author.viewer?.blocking || post.author.viewer?.blockedBy || post.author.viewer?.blockingByList,
	);
	const replyDisabled = post.viewer?.replyDisabled;

	const shouldShowLoggedOutWarning = React.useMemo(() => {
		return (
			post.author.did !== currentAccount?.did &&
			!!post.author.labels?.find((label) => label.val === "!no-unauthenticated")
		);
	}, [currentAccount, post]);

	const defaultCtrlColor: React.CSSProperties = React.useMemo(
		() => ({
			color: t.palette.contrast_500,
		}),
		[t],
	);

	const [hasLikeIconBeenToggled, setHasLikeIconBeenToggled] = React.useState(false);

	const onPressToggleLike = React.useCallback(async () => {
		if (isBlocked) {
			Toast.show("Cannot interact with a blocked user", "exclamation-circle");
			return;
		}

		try {
			setHasLikeIconBeenToggled(true);
			if (!post.viewer?.like) {
				sendInteraction({
					item: post.uri,
					event: "app.bsky.feed.defs#interactionLike",
					feedContext,
				});
				captureAction(ProgressGuideAction.Like);
				await queueLike();
			} else {
				await queueUnlike();
			}
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				throw e;
			}
		}
	}, [post.uri, post.viewer?.like, queueLike, queueUnlike, sendInteraction, captureAction, feedContext, isBlocked]);

	const onRepost = useCallback(async () => {
		if (isBlocked) {
			Toast.show("Cannot interact with a blocked user", "exclamation-circle");
			return;
		}

		try {
			if (!post.viewer?.repost) {
				sendInteraction({
					item: post.uri,
					event: "app.bsky.feed.defs#interactionRepost",
					feedContext,
				});
				await queueRepost();
			} else {
				await queueUnrepost();
			}
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				throw e;
			}
		}
	}, [post.uri, post.viewer?.repost, queueRepost, queueUnrepost, sendInteraction, feedContext, isBlocked]);

	const onQuote = useCallback(() => {
		if (isBlocked) {
			Toast.show("Cannot interact with a blocked user", "exclamation-circle");
			return;
		}

		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#interactionQuote",
			feedContext,
		});
		openComposer({
			quote: post,
			onPost: onPostReply,
		});
	}, [sendInteraction, post, feedContext, openComposer, onPostReply, isBlocked]);

	const onShare = useCallback(() => {
		const urip = new AtUri(post.uri);
		const href = makeProfileLink(post.author, "post", urip.rkey);
		const url = toShareUrl(href);
		shareUrl(url);
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#interactionShare",
			feedContext,
		});
	}, [post.uri, post.author, sendInteraction, feedContext]);

	const btnStyle = React.useCallback(
		({
			pressed,
			hovered,
		}: {
			pressed?: boolean;
			hovered?: boolean;
			focused?: boolean;
		}) =>
			({
				gap: 4,
				borderRadius: 999,
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
				padding: 5,
				...((pressed || hovered) && t.atoms.bg_contrast_25),
			}) satisfies CSSProperties,
		[t.atoms.bg_contrast_25],
	);
	const btnProps = {
		onMouseDown: () => setPressed(true),
		onMouseUp: () => setPressed(false),
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
	};

	return (
		<div
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				...style,
			}}
		>
			<div
				style={{
					...(big ? { alignItems: "center" } : { flex: 1, alignItems: "flex-start", marginLeft: -6 }),
					...(replyDisabled ? { opacity: 0.5 } : undefined),
				}}
			>
				<button
					type="button"
					style={btnStyle({ hovered, pressed })}
					onClick={() => {
						if (!replyDisabled) {
							requireAuth(() => onPressReply());
						}
					}}
					{...btnProps}
					// hitSlop={POST_CTRL_HITSLOP}
				>
					<Bubble
						style={{
							...defaultCtrlColor,
							...{ pointerEvents: "none" },
						}}
						width={big ? 22 : 18}
					/>
					{typeof post.replyCount !== "undefined" && post.replyCount > 0 ? (
						<Text
							style={{
								...defaultCtrlColor,
								...(big ? { fontSize: 16 } : { fontSize: 15 }),
								userSelect: "none",
							}}
						>
							{formatCount(post.replyCount)}
						</Text>
					) : undefined}
				</button>
			</div>
			<div style={big ? { alignItems: "center" } : { flex: 1, alignItems: "flex-start" }}>
				<RepostButton
					isReposted={!!post.viewer?.repost}
					repostCount={(post.repostCount ?? 0) + (post.quoteCount ?? 0)}
					onRepost={onRepost}
					onQuote={onQuote}
					big={big}
					embeddingDisabled={Boolean(post.viewer?.embeddingDisabled)}
				/>
			</div>
			<div style={big ? { alignItems: "center" } : { flex: 1, alignItems: "flex-start" }}>
				<button
					type="button"
					style={btnStyle({ pressed, hovered })}
					onClick={() => requireAuth(() => onPressToggleLike())}
					// hitSlop={POST_CTRL_HITSLOP}
					{...btnProps}
				>
					<AnimatedLikeIcon
						isLiked={Boolean(post.viewer?.like)}
						big={big}
						hasBeenToggled={hasLikeIconBeenToggled}
					/>
					<CountWheel
						likeCount={post.likeCount ?? 0}
						big={big}
						isLiked={Boolean(post.viewer?.like)}
						hasBeenToggled={hasLikeIconBeenToggled}
					/>
				</button>
			</div>
			{big && (
				<>
					<div style={{ ...a.align_center }}>
						<button
							type="button"
							style={btnStyle({ pressed, hovered })}
							onClick={() => {
								if (shouldShowLoggedOutWarning) {
									loggedOutWarningPromptControl.open();
								} else {
									onShare();
								}
							}}
							{...btnProps}
							// hitSlop={POST_CTRL_HITSLOP}
						>
							<ArrowOutOfBox
								style={{
									...defaultCtrlColor,
									...{ pointerEvents: "none" },
								}}
								width={22}
							/>
						</button>
					</div>
					<Prompt.Basic
						control={loggedOutWarningPromptControl}
						title={"Note about sharing"}
						description={`This post is only visible to logged-in users. It won't be visible to people who aren't signed in.`}
						onConfirm={onShare}
						confirmButtonCta={"Share anyway"}
					/>
				</>
			)}
			<div style={big ? a.align_center : flatten([a.flex_1, a.align_start])}>
				<PostDropdownBtn
					post={post}
					postFeedContext={feedContext}
					record={record}
					richText={richText}
					style={{ padding: 5 }}
					hitSlop={POST_CTRL_HITSLOP}
					timestamp={post.indexedAt}
					threadgateRecord={threadgateRecord}
				/>
			</div>
		</div>
	);
};
PostCtrls = memo(PostCtrls);
export { PostCtrls };
