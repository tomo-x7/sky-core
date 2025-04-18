import {
	type AppBskyActorDefs,
	AppBskyFeedDefs,
	AppBskyFeedPost,
	AppBskyFeedThreadgate,
	AtUri,
	type ModerationDecision,
	RichText as RichTextAPI,
} from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React, { memo, useMemo, useState } from "react";

import { atoms as a } from "#/alf";
import type { AppModerationCause } from "#/components/Pills";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { RichText } from "#/components/RichText";
import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import { Pin_Stroke2_Corner0_Rounded as PinIcon } from "#/components/icons/Pin";
import { Repost_Stroke2_Corner2_Rounded as RepostIcon } from "#/components/icons/Repost";
import { ContentHider } from "#/components/moderation/ContentHider";
import { LabelsOnMyPost } from "#/components/moderation/LabelsOnMe";
import { PostAlerts } from "#/components/moderation/PostAlerts";
import { type ReasonFeedSource, isReasonFeedSource } from "#/lib/api/feed/types";
import { MAX_POST_LINES } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { countLines } from "#/lib/strings/helpers";
import { s } from "#/lib/styles";
import { POST_TOMBSTONE, type Shadow, usePostShadow } from "#/state/cache/post-shadow";
import { useFeedFeedbackContext } from "#/state/feed-feedback";
import { precacheProfile } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { useMergedThreadgateHiddenReplies } from "#/state/threadgate-hidden-replies";
import * as bsky from "#/types/bsky";
import { FeedNameText } from "#/view/com/util/FeedInfoText";
import { PostMeta } from "#/view/com/util/PostMeta";
import { PreviewableUserAvatar } from "#/view/com/util/UserAvatar";
import { PostCtrls } from "#/view/com/util/post-ctrls/PostCtrls";
import { PostEmbedViewContext, PostEmbeds } from "#/view/com/util/post-embeds";
import { Link, TextLink } from "../util/Link";

interface FeedItemProps {
	record: AppBskyFeedPost.Record;
	reason:
		| AppBskyFeedDefs.ReasonRepost
		| AppBskyFeedDefs.ReasonPin
		| ReasonFeedSource
		| { [k: string]: unknown; $type: string }
		| undefined;
	moderation: ModerationDecision;
	parentAuthor: AppBskyActorDefs.ProfileViewBasic | undefined;
	showReplyTo: boolean;
	isThreadChild?: boolean;
	isThreadLastChild?: boolean;
	isThreadParent?: boolean;
	feedContext: string | undefined;
	hideTopBorder?: boolean;
	isParentBlocked?: boolean;
	isParentNotFound?: boolean;
}

export function PostFeedItem({
	post,
	record,
	reason,
	feedContext,
	moderation,
	parentAuthor,
	showReplyTo,
	isThreadChild,
	isThreadLastChild,
	isThreadParent,
	hideTopBorder,
	isParentBlocked,
	isParentNotFound,
	rootPost,
}: FeedItemProps & {
	post: AppBskyFeedDefs.PostView;
	rootPost: AppBskyFeedDefs.PostView;
}): React.ReactNode {
	const postShadowed = usePostShadow(post);
	const richText = useMemo(
		() =>
			new RichTextAPI({
				text: record.text,
				facets: record.facets,
			}),
		[record],
	);
	if (postShadowed === POST_TOMBSTONE) {
		return null;
	}
	if (richText && moderation) {
		return (
			<FeedItemInner
				// Safeguard from clobbering per-post state below:
				key={postShadowed.uri}
				post={postShadowed}
				record={record}
				reason={reason}
				feedContext={feedContext}
				richText={richText}
				parentAuthor={parentAuthor}
				showReplyTo={showReplyTo}
				moderation={moderation}
				isThreadChild={isThreadChild}
				isThreadLastChild={isThreadLastChild}
				isThreadParent={isThreadParent}
				hideTopBorder={hideTopBorder}
				isParentBlocked={isParentBlocked}
				isParentNotFound={isParentNotFound}
				rootPost={rootPost}
			/>
		);
	}
	return null;
}

let FeedItemInner = ({
	post,
	record,
	reason,
	feedContext,
	richText,
	moderation,
	parentAuthor,
	showReplyTo,
	isThreadChild,
	isThreadLastChild,
	isThreadParent,
	hideTopBorder,
	isParentBlocked,
	isParentNotFound,
	rootPost,
}: FeedItemProps & {
	richText: RichTextAPI;
	post: Shadow<AppBskyFeedDefs.PostView>;
	rootPost: AppBskyFeedDefs.PostView;
}): React.ReactNode => {
	const queryClient = useQueryClient();
	const { openComposer } = useComposerControls();
	const pal = usePalette("default");

	const href = useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey);
	}, [post.uri, post.author]);
	const { sendInteraction } = useFeedFeedbackContext();

	const onPressReply = React.useCallback(() => {
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#interactionReply",
			feedContext,
		});
		openComposer({
			replyTo: {
				uri: post.uri,
				cid: post.cid,
				text: record.text || "",
				author: post.author,
				embed: post.embed,
				moderation,
			},
		});
	}, [post, record, openComposer, moderation, sendInteraction, feedContext]);

	const onOpenAuthor = React.useCallback(() => {
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#clickthroughAuthor",
			feedContext,
		});
	}, [sendInteraction, post, feedContext]);

	const onOpenReposter = React.useCallback(() => {
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#clickthroughReposter",
			feedContext,
		});
	}, [sendInteraction, post, feedContext]);

	const onOpenEmbed = React.useCallback(() => {
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#clickthroughEmbed",
			feedContext,
		});
	}, [sendInteraction, post, feedContext]);

	const onBeforePress = React.useCallback(() => {
		sendInteraction({
			item: post.uri,
			event: "app.bsky.feed.defs#clickthroughItem",
			feedContext,
		});
		precacheProfile(queryClient, post.author);
	}, [queryClient, post, sendInteraction, feedContext]);

	const outerStyles = {
		...styles.outer,
		borderColor: pal.colors.border,
		paddingBottom: isThreadLastChild || (!isThreadChild && !isThreadParent) ? 8 : undefined,
		borderTopWidth: hideTopBorder || isThreadChild ? 0 : 1,
	};

	const { currentAccount } = useSession();
	const isOwner = AppBskyFeedDefs.isReasonRepost(reason) && reason.by.did === currentAccount?.did;

	/**
	 * If `post[0]` in this slice is the actual root post (not an orphan thread),
	 * then we may have a threadgate record to reference
	 */
	const threadgateRecord = bsky.dangerousIsType<AppBskyFeedThreadgate.Record>(
		rootPost.threadgate?.record,
		AppBskyFeedThreadgate.isRecord,
	)
		? rootPost.threadgate.record
		: undefined;

	const [hover, setHover] = useState(false);
	return (
		<Link
			style={outerStyles}
			href={href}
			noFeedback
			onBeforePress={onBeforePress}
			dataset={{ feedContext }}
			onPointerEnter={() => {
				setHover(true);
			}}
			onPointerLeave={() => {
				setHover(false);
			}}
		>
			<SubtleWebHover hover={hover} />
			<div style={{ flexDirection: "row", gap: 10, paddingLeft: 8 }}>
				<div style={{ width: 42 }}>
					{isThreadChild && (
						<div
							style={{
								...styles.replyLine,

								...{
									flexGrow: 1,
									backgroundColor: pal.colors.replyLine,
									marginBottom: 4,
								},
							}}
						/>
					)}
				</div>

				<div style={{ paddingTop: 12, flexShrink: 1 }}>
					{isReasonFeedSource(reason) ? (
						<Link href={reason.href}>
							<Text type="sm-bold" style={pal.textLight} lineHeight={1.2} numberOfLines={1}>
								From{" "}
								<FeedNameText
									type="sm-bold"
									uri={reason.uri}
									href={reason.href}
									lineHeight={1.2}
									numberOfLines={1}
									style={pal.textLight}
								/>
							</Text>
						</Link>
					) : AppBskyFeedDefs.isReasonRepost(reason) ? (
						<Link
							style={styles.includeReason}
							href={makeProfileLink(reason.by)}
							title={
								isOwner
									? "Reposted by you"
									: `Reposted by ${sanitizeDisplayName(reason.by.displayName || reason.by.handle)}`
							}
							onBeforePress={onOpenReposter}
						>
							<RepostIcon
								style={{ color: pal.colors.textLight, marginRight: 3 }}
								width={13}
								height={13}
							/>
							<Text type="sm-bold" style={pal.textLight} lineHeight={1.2} numberOfLines={1}>
								{isOwner ? (
									<>Reposted by you</>
								) : (
									<>
										Reposted by{" "}
										<ProfileHoverCard inline did={reason.by.did}>
											<TextLink
												type="sm-bold"
												style={pal.textLight}
												lineHeight={1.2}
												numberOfLines={1}
												text={
													<Text type="sm-bold" style={pal.textLight} lineHeight={1.2}>
														{sanitizeDisplayName(
															reason.by.displayName || sanitizeHandle(reason.by.handle),
															moderation.ui("displayName"),
														)}
													</Text>
												}
												href={makeProfileLink(reason.by)}
												onBeforePress={onOpenReposter}
											/>
										</ProfileHoverCard>
									</>
								)}
							</Text>
						</Link>
					) : AppBskyFeedDefs.isReasonPin(reason) ? (
						<div style={styles.includeReason}>
							<PinIcon style={{ color: pal.colors.textLight, marginRight: 3 }} width={13} height={13} />
							<Text type="sm-bold" style={pal.textLight} lineHeight={1.2} numberOfLines={1}>
								Pinned
							</Text>
						</div>
					) : null}
				</div>
			</div>
			<div style={styles.layout}>
				<div style={styles.layoutAvi}>
					<PreviewableUserAvatar
						size={42}
						profile={post.author}
						moderation={moderation.ui("avatar")}
						type={post.author.associated?.labeler ? "labeler" : "user"}
						onBeforePress={onOpenAuthor}
					/>
					{isThreadParent && (
						<div
							style={{
								...styles.replyLine,

								...{
									flexGrow: 1,
									backgroundColor: pal.colors.replyLine,
									marginTop: 4,
								},
							}}
						/>
					)}
				</div>
				<div style={styles.layoutContent}>
					<PostMeta
						author={post.author}
						moderation={moderation}
						timestamp={post.indexedAt}
						postHref={href}
						onOpenAuthor={onOpenAuthor}
					/>
					{showReplyTo && (parentAuthor || isParentBlocked || isParentNotFound) && (
						<ReplyToLabel blocked={isParentBlocked} notFound={isParentNotFound} profile={parentAuthor} />
					)}
					<LabelsOnMyPost post={post} />
					<PostContent
						moderation={moderation}
						richText={richText}
						postEmbed={post.embed}
						postAuthor={post.author}
						onOpenEmbed={onOpenEmbed}
						post={post}
						threadgateRecord={threadgateRecord}
					/>
					<PostCtrls
						post={post}
						record={record}
						richText={richText}
						onPressReply={onPressReply}
						feedContext={feedContext}
						threadgateRecord={threadgateRecord}
					/>
				</div>
			</div>
		</Link>
	);
};
FeedItemInner = memo(FeedItemInner);

let PostContent = ({
	post,
	moderation,
	richText,
	postEmbed,
	postAuthor,
	onOpenEmbed,
	threadgateRecord,
}: {
	moderation: ModerationDecision;
	richText: RichTextAPI;
	postEmbed: AppBskyFeedDefs.PostView["embed"];
	postAuthor: AppBskyFeedDefs.PostView["author"];
	onOpenEmbed: () => void;
	post: AppBskyFeedDefs.PostView;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}): React.ReactNode => {
	const pal = usePalette("default");
	const { currentAccount } = useSession();
	const [limitLines, setLimitLines] = useState(() => countLines(richText.text) >= MAX_POST_LINES);
	const threadgateHiddenReplies = useMergedThreadgateHiddenReplies({
		threadgateRecord,
	});
	const additionalPostAlerts: AppModerationCause[] = React.useMemo(() => {
		const isPostHiddenByThreadgate = threadgateHiddenReplies.has(post.uri);
		const rootPostUri = bsky.dangerousIsType<AppBskyFeedPost.Record>(post.record, AppBskyFeedPost.isRecord)
			? post.record?.reply?.root?.uri || post.uri
			: undefined;
		const isControlledByViewer = rootPostUri && new AtUri(rootPostUri).host === currentAccount?.did;
		return isControlledByViewer && isPostHiddenByThreadgate
			? [
					{
						type: "reply-hidden",
						source: { type: "user", did: currentAccount?.did },
						priority: 6,
					},
				]
			: [];
	}, [post, currentAccount?.did, threadgateHiddenReplies]);

	const onPressShowMore = React.useCallback(() => {
		setLimitLines(false);
	}, []);

	return (
		<ContentHider modui={moderation.ui("contentList")} ignoreMute childContainerStyle={styles.contentHiderChild}>
			<PostAlerts modui={moderation.ui("contentList")} style={a.py_2xs} additionalCauses={additionalPostAlerts} />
			{richText.text ? (
				<div style={styles.postTextContainer}>
					<RichText
						enableTags
						value={richText}
						numberOfLines={limitLines ? MAX_POST_LINES : undefined}
						style={{
							...a.flex_1,
							...a.text_md,
						}}
						authorHandle={postAuthor.handle}
						shouldProxyLinks={true}
					/>
				</div>
			) : undefined}
			{limitLines ? (
				<TextLink text={"Show More"} style={pal.link} onPress={onPressShowMore} href="#" />
			) : undefined}
			{postEmbed ? (
				<div style={a.pb_xs}>
					<PostEmbeds
						embed={postEmbed}
						moderation={moderation}
						onOpen={onOpenEmbed}
						viewContext={PostEmbedViewContext.Feed}
					/>
				</div>
			) : null}
		</ContentHider>
	);
};
PostContent = memo(PostContent);

function ReplyToLabel({
	profile,
	blocked,
	notFound,
}: {
	profile: AppBskyActorDefs.ProfileViewBasic | undefined;
	blocked?: boolean;
	notFound?: boolean;
}) {
	const pal = usePalette("default");
	const { currentAccount } = useSession();

	let label: React.ReactNode;
	if (blocked) {
		label = "Reply to a blocked post";
	} else if (notFound) {
		label = "Reply to a post";
	} else if (profile != null) {
		const isMe = profile.did === currentAccount?.did;
		if (isMe) {
			label = "Reply to you";
		} else {
			label = (
				<>
					Reply to{" "}
					<ProfileHoverCard inline did={profile.did}>
						<TextLink
							type="md"
							style={pal.textLight}
							lineHeight={1.2}
							numberOfLines={1}
							href={makeProfileLink(profile)}
							text={
								<Text type="md" style={pal.textLight} lineHeight={1.2}>
									{profile.displayName
										? sanitizeDisplayName(profile.displayName)
										: sanitizeHandle(profile.handle)}
								</Text>
							}
						/>
					</ProfileHoverCard>
				</>
			);
		}
	}

	if (!label) {
		// Should not happen.
		return null;
	}

	return (
		<div
			style={{
				...s.flexRow,
				...s.mb2,
				...s.alignCenter,
			}}
		>
			<FontAwesomeIcon
				icon="reply"
				// @ts-expect-error
				size={9}
				style={{
					...{ color: pal.colors.textLight },
					...s.mr5,
				}}
			/>
			<Text
				type="md"
				style={{
					...pal.textLight,
					...s.mr2,
				}}
				lineHeight={1.2}
				numberOfLines={1}
			>
				{label}
			</Text>
		</div>
	);
}

const styles = {
	outer: {
		paddingLeft: 10,
		paddingRight: 15,
		cursor: "pointer",
	},
	replyLine: {
		width: 2,
		marginLeft: "auto",
		marginRight: "auto",
	},
	includeReason: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
		marginBottom: 2,
		marginLeft: -16,
	},
	layout: {
		flexDirection: "row",
		marginTop: 1,
	},
	layoutAvi: {
		paddingLeft: 8,
		paddingRight: 10,
		position: "relative",
		zIndex: 999,
	},
	layoutContent: {
		position: "relative",
		flex: 1,
		zIndex: 0,
	},
	alert: {
		marginTop: 6,
		marginBottom: 6,
	},
	postTextContainer: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		paddingBottom: 2,
		overflow: "hidden",
	},
	contentHiderChild: {
		marginTop: 6,
	},
	embed: {
		marginBottom: 6,
	},
	translateLink: {
		marginBottom: 6,
	},
} satisfies Record<string, React.CSSProperties>;
