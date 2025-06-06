import {
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	AtUri,
	type ModerationDecision,
	RichText as RichTextAPI,
	moderatePost,
} from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { RichText } from "#/components/RichText";
import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import { MAX_POST_LINES } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { countLines } from "#/lib/strings/helpers";
import { colors, s } from "#/lib/styles";
import { POST_TOMBSTONE, type Shadow, usePostShadow } from "#/state/cache/post-shadow";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { precacheProfile } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import * as bsky from "#/types/bsky";
import { ContentHider } from "../../../components/moderation/ContentHider";
import { LabelsOnMyPost } from "../../../components/moderation/LabelsOnMe";
import { PostAlerts } from "../../../components/moderation/PostAlerts";
import { PostCtrls } from "../../../units/post/PostCtrls";
import { Link, TextLink } from "../util/Link";
import { PostMeta } from "../util/PostMeta";
import { PreviewableUserAvatar } from "../util/UserAvatar";
import { UserInfoText } from "../util/UserInfoText";
import { PostEmbedViewContext, PostEmbeds } from "../util/post-embeds";

export function Post({
	post,
	showReplyLine,
	hideTopBorder,
	style,
}: {
	post: AppBskyFeedDefs.PostView;
	showReplyLine?: boolean;
	hideTopBorder?: boolean;
	style?: React.CSSProperties;
}) {
	const moderationOpts = useModerationOpts();
	const record = useMemo<AppBskyFeedPost.Record | undefined>(
		() => (bsky.validate(post.record, AppBskyFeedPost.validateRecord) ? post.record : undefined),
		[post],
	);
	const postShadowed = usePostShadow(post);
	const richText = useMemo(
		() =>
			record
				? new RichTextAPI({
						text: record.text,
						facets: record.facets,
					})
				: undefined,
		[record],
	);
	const moderation = useMemo(
		() => (moderationOpts ? moderatePost(post, moderationOpts) : undefined),
		[moderationOpts, post],
	);
	if (postShadowed === POST_TOMBSTONE) {
		return null;
	}
	if (record && richText && moderation) {
		return (
			<PostInner
				post={postShadowed}
				record={record}
				richText={richText}
				moderation={moderation}
				showReplyLine={showReplyLine}
				hideTopBorder={hideTopBorder}
				style={style}
			/>
		);
	}
	return null;
}

function PostInner({
	post,
	record,
	richText,
	moderation,
	showReplyLine,
	hideTopBorder,
	style,
}: {
	post: Shadow<AppBskyFeedDefs.PostView>;
	record: AppBskyFeedPost.Record;
	richText: RichTextAPI;
	moderation: ModerationDecision;
	showReplyLine?: boolean;
	hideTopBorder?: boolean;
	style?: React.CSSProperties;
}) {
	const queryClient = useQueryClient();
	const pal = usePalette("default");
	const { openComposer } = useComposerControls();
	const [limitLines, setLimitLines] = useState(() => countLines(richText?.text) >= MAX_POST_LINES);
	const itemUrip = new AtUri(post.uri);
	const itemHref = makeProfileLink(post.author, "post", itemUrip.rkey);
	let replyAuthorDid = "";
	if (record.reply) {
		const urip = new AtUri(record.reply.parent?.uri || record.reply.root.uri);
		replyAuthorDid = urip.hostname;
	}

	const onPressReply = React.useCallback(() => {
		openComposer({
			replyTo: {
				uri: post.uri,
				cid: post.cid,
				text: record.text,
				author: post.author,
				embed: post.embed,
				moderation,
			},
		});
	}, [openComposer, post, record, moderation]);

	const onPressShowMore = React.useCallback(() => {
		setLimitLines(false);
	}, []);

	const onBeforePress = React.useCallback(() => {
		precacheProfile(queryClient, post.author);
	}, [queryClient, post.author]);

	const { currentAccount } = useSession();
	const isMe = replyAuthorDid === currentAccount?.did;

	const [hover, setHover] = React.useState(false);
	return (
		<Link
			href={itemHref}
			style={{
				...styles.outer,
				...pal.border,
				...(!hideTopBorder && { borderTopWidth: 1 }),
				...style,
			}}
			onBeforePress={onBeforePress}
			onPointerEnter={() => {
				setHover(true);
			}}
			onPointerLeave={() => {
				setHover(false);
			}}
		>
			<SubtleWebHover hover={hover} />
			{showReplyLine && <div style={styles.replyLine} />}
			<div style={styles.layout}>
				<div style={styles.layoutAvi}>
					<PreviewableUserAvatar
						size={42}
						profile={post.author}
						moderation={moderation.ui("avatar")}
						type={post.author.associated?.labeler ? "labeler" : "user"}
					/>
				</div>
				<div style={styles.layoutContent}>
					<PostMeta
						author={post.author}
						moderation={moderation}
						timestamp={post.indexedAt}
						postHref={itemHref}
					/>
					{replyAuthorDid !== "" && (
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
									...pal.textLight,
									...s.mr5,
								}}
							/>
							<Text
								type="sm"
								style={{
									...pal.textLight,
									...s.mr2,
								}}
								lineHeight={1.2}
								numberOfLines={1}
							>
								{isMe ? (
									<>Reply to you</>
								) : (
									<>
										Reply to{" "}
										<ProfileHoverCard inline did={replyAuthorDid}>
											<UserInfoText
												type="sm"
												did={replyAuthorDid}
												attr="displayName"
												style={pal.textLight}
											/>
										</ProfileHoverCard>
									</>
								)}
							</Text>
						</div>
					)}
					<LabelsOnMyPost post={post} />
					<ContentHider
						modui={moderation.ui("contentView")}
						style={styles.contentHider}
						childContainerStyle={styles.contentHiderChild}
					>
						<PostAlerts modui={moderation.ui("contentView")} style={{ paddingTop: 4, paddingBottom: 4 }} />
						{richText.text ? (
							<div style={styles.postTextContainer}>
								<RichText
									enableTags
									value={richText}
									numberOfLines={limitLines ? MAX_POST_LINES : undefined}
									style={{
										flex: 1,
										fontSize: 16,
										letterSpacing: 0,
									}}
									authorHandle={post.author.handle}
									shouldProxyLinks={true}
								/>
							</div>
						) : undefined}
						{limitLines ? (
							<TextLink text={"Show More"} style={pal.link} onPress={onPressShowMore} href="#" />
						) : undefined}
						{post.embed ? (
							<PostEmbeds
								embed={post.embed}
								moderation={moderation}
								viewContext={PostEmbedViewContext.Feed}
							/>
						) : null}
					</ContentHider>
					<PostCtrls post={post} record={record} richText={richText} onPressReply={onPressReply} />
				</div>
			</div>
		</Link>
	);
}

const styles = {
	outer: {
		paddingTop: 10,
		paddingRight: 15,
		paddingBottom: 5,
		paddingLeft: 10,
		cursor: "pointer",
	},
	layout: {
		flexDirection: "row",
		gap: 10,
	},
	layoutAvi: {
		paddingLeft: 8,
	},
	layoutContent: {
		flex: 1,
	},
	alert: {
		marginBottom: 6,
	},
	postTextContainer: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		overflow: "hidden",
	},
	replyLine: {
		position: "absolute",
		left: 36,
		top: 70,
		bottom: 0,
		borderLeftWidth: 2,
		borderLeftColor: colors.gray2,
	},
	contentHider: {
		marginBottom: 2,
	},
	contentHiderChild: {
		marginTop: 6,
	},
} satisfies Record<string, React.CSSProperties>;
