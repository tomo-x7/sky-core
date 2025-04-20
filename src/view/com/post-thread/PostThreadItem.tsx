import {
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	type AppBskyFeedThreadgate,
	AtUri,
	type ModerationDecision,
	RichText as RichTextAPI,
} from "@atproto/api";
import React, { memo, useMemo } from "react";

import { atoms as a, flatten, useTheme } from "#/alf";
import { colors } from "#/components/Admonition";
import { Button } from "#/components/Button";
import { InlineLinkText } from "#/components/Link";
import type { AppModerationCause } from "#/components/Pills";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import { WhoCanReply } from "#/components/WhoCanReply";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { CalendarClock_Stroke2_Corner0_Rounded as CalendarClockIcon } from "#/components/icons/CalendarClock";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRightIcon } from "#/components/icons/Chevron";
import { Trash_Stroke2_Corner0_Rounded as TrashIcon } from "#/components/icons/Trash";
import { ContentHider } from "#/components/moderation/ContentHider";
import { LabelsOnMyPost } from "#/components/moderation/LabelsOnMe";
import { PostAlerts } from "#/components/moderation/PostAlerts";
import { PostHider } from "#/components/moderation/PostHider";
import { MAX_POST_LINES } from "#/lib/constants";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { countLines } from "#/lib/strings/helpers";
import { niceDate } from "#/lib/strings/time";
import { s } from "#/lib/styles";
import { getTranslatorLink, isPostInLanguage } from "#/locale/helpers";
import { POST_TOMBSTONE, type Shadow, usePostShadow } from "#/state/cache/post-shadow";
import { useLanguagePrefs } from "#/state/preferences";
import type { ThreadPost } from "#/state/queries/post-thread";
import { useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { useMergedThreadgateHiddenReplies } from "#/state/threadgate-hidden-replies";
import * as bsky from "#/types/bsky";
import { PostCtrls } from "#/units/post/PostCtrls";
import { PostThreadFollowBtn } from "#/view/com/post-thread/PostThreadFollowBtn";
import { Link, TextLink } from "#/view/com/util/Link";
import { PostMeta } from "#/view/com/util/PostMeta";
import { PreviewableUserAvatar } from "#/view/com/util/UserAvatar";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";
import { formatCount } from "#/view/com/util/numeric/format";
import { PostEmbedViewContext, PostEmbeds } from "#/view/com/util/post-embeds";

export function PostThreadItem({
	post,
	record,
	moderation,
	treeView,
	depth,
	prevPost,
	nextPost,
	isHighlightedPost,
	hasMore,
	showChildReplyLine,
	showParentReplyLine,
	hasPrecedingItem,
	overrideBlur,
	onPostReply,
	hideTopBorder,
	threadgateRecord,
}: {
	post: AppBskyFeedDefs.PostView;
	record: AppBskyFeedPost.Record;
	moderation: ModerationDecision | undefined;
	treeView: boolean;
	depth: number;
	prevPost: ThreadPost | undefined;
	nextPost: ThreadPost | undefined;
	isHighlightedPost?: boolean;
	hasMore?: boolean;
	showChildReplyLine?: boolean;
	showParentReplyLine?: boolean;
	hasPrecedingItem: boolean;
	overrideBlur: boolean;
	onPostReply: (postUri: string | undefined) => void;
	hideTopBorder?: boolean;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}) {
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
		return <PostThreadItemDeleted hideTopBorder={hideTopBorder} />;
	}
	if (richText && moderation) {
		return (
			<PostThreadItemLoaded
				// Safeguard from clobbering per-post state below:
				key={postShadowed.uri}
				post={postShadowed}
				prevPost={prevPost}
				nextPost={nextPost}
				record={record}
				richText={richText}
				moderation={moderation}
				treeView={treeView}
				depth={depth}
				isHighlightedPost={isHighlightedPost}
				hasMore={hasMore}
				showChildReplyLine={showChildReplyLine}
				showParentReplyLine={showParentReplyLine}
				hasPrecedingItem={hasPrecedingItem}
				overrideBlur={overrideBlur}
				onPostReply={onPostReply}
				hideTopBorder={hideTopBorder}
				threadgateRecord={threadgateRecord}
			/>
		);
	}
	return null;
}

function PostThreadItemDeleted({ hideTopBorder }: { hideTopBorder?: boolean }) {
	const t = useTheme();
	return (
		<div
			style={{
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				padding: 20,
				paddingLeft: 16,
				flexDirection: "row",
				gap: 12,
				...(!hideTopBorder && a.border_t),
			}}
		>
			<TrashIcon style={t.atoms.text} />
			<Text
				style={{
					...t.atoms.text_contrast_medium,
					marginTop: 2,
				}}
			>
				This post has been deleted.
			</Text>
		</div>
	);
}

let PostThreadItemLoaded = ({
	post,
	record,
	richText,
	moderation,
	treeView,
	depth,
	prevPost,
	nextPost,
	isHighlightedPost,
	hasMore,
	showChildReplyLine,
	showParentReplyLine,
	hasPrecedingItem,
	overrideBlur,
	onPostReply,
	hideTopBorder,
	threadgateRecord,
}: {
	post: Shadow<AppBskyFeedDefs.PostView>;
	record: AppBskyFeedPost.Record;
	richText: RichTextAPI;
	moderation: ModerationDecision;
	treeView: boolean;
	depth: number;
	prevPost: ThreadPost | undefined;
	nextPost: ThreadPost | undefined;
	isHighlightedPost?: boolean;
	hasMore?: boolean;
	showChildReplyLine?: boolean;
	showParentReplyLine?: boolean;
	hasPrecedingItem: boolean;
	overrideBlur: boolean;
	onPostReply: (postUri: string | undefined) => void;
	hideTopBorder?: boolean;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}): React.ReactNode => {
	const t = useTheme();
	const pal = usePalette("default");
	const langPrefs = useLanguagePrefs();
	const { openComposer } = useComposerControls();
	const [limitLines, setLimitLines] = React.useState(() => countLines(richText?.text) >= MAX_POST_LINES);
	const { currentAccount } = useSession();
	const rootUri = record.reply?.root?.uri || post.uri;
	const postHref = React.useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey);
	}, [post.uri, post.author]);
	const itemTitle = `Post by ${post.author.handle}`;
	const authorHref = makeProfileLink(post.author);
	const authorTitle = post.author.handle;
	const isThreadAuthor = getThreadAuthor(post, record) === currentAccount?.did;
	const likesHref = React.useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey, "liked-by");
	}, [post.uri, post.author]);
	const likesTitle = "Likes on this post";
	const repostsHref = React.useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey, "reposted-by");
	}, [post.uri, post.author]);
	const repostsTitle = "Reposts of this post";
	const threadgateHiddenReplies = useMergedThreadgateHiddenReplies({
		threadgateRecord,
	});
	const additionalPostAlerts: AppModerationCause[] = React.useMemo(() => {
		const isPostHiddenByThreadgate = threadgateHiddenReplies.has(post.uri);
		const isControlledByViewer = new AtUri(rootUri).host === currentAccount?.did;
		return isControlledByViewer && isPostHiddenByThreadgate
			? [
					{
						type: "reply-hidden",
						source: { type: "user", did: currentAccount?.did },
						priority: 6,
					},
				]
			: [];
	}, [post, currentAccount?.did, threadgateHiddenReplies, rootUri]);
	const quotesHref = React.useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey, "quotes");
	}, [post.uri, post.author]);
	const quotesTitle = "Quotes of this post";
	const onlyFollowersCanReply = !!threadgateRecord?.allow?.find(
		(rule) => rule.$type === "app.bsky.feed.threadgate#followerRule",
	);
	const showFollowButton = currentAccount?.did !== post.author.did && !onlyFollowersCanReply;

	const translatorUrl = getTranslatorLink(record?.text || "", langPrefs.primaryLanguage);
	const needsTranslation = useMemo(
		() => Boolean(langPrefs.primaryLanguage && !isPostInLanguage(post, [langPrefs.primaryLanguage])),
		[post, langPrefs.primaryLanguage],
	);

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
			onPost: onPostReply,
		});
	}, [openComposer, post, record, onPostReply, moderation]);

	const onPressShowMore = React.useCallback(() => {
		setLimitLines(false);
	}, []);

	if (!record) {
		return <ErrorMessage message={"Invalid or unsupported post record"} />;
	}

	if (isHighlightedPost) {
		return (
			<>
				{rootUri !== post.uri && (
					<div
						style={{
							paddingLeft: 16,
							flexDirection: "row",
							paddingBottom: 4,
							...{ height: a.pt_lg.paddingTop },
						}}
					>
						<div style={{ width: 42 }}>
							<div
								style={{
									...styles.replyLine,

									...{
										flexGrow: 1,
										backgroundColor: pal.colors.replyLine,
									},
								}}
							/>
						</div>
					</div>
				)}
				<div
					style={{
						paddingLeft: 16,
						paddingRight: 16,
						...t.atoms.border_contrast_low,

						...// root post styles
						flatten(rootUri === post.uri && [a.pt_lg]),
					}}
				>
					<div
						style={{
							flexDirection: "row",
							gap: 12,
							paddingBottom: 12,
						}}
					>
						<PreviewableUserAvatar
							size={42}
							profile={post.author}
							moderation={moderation.ui("avatar")}
							type={post.author.associated?.labeler ? "labeler" : "user"}
						/>
						<div style={{ flex: 1 }}>
							<Link style={s.flex1} href={authorHref} title={authorTitle}>
								<Text
									style={{
										fontSize: 18,
										letterSpacing: 0,
										fontWeight: "600",
										lineHeight: 1.3,
										alignSelf: "flex-start",
									}}
									numberOfLines={1}
								>
									{sanitizeDisplayName(
										post.author.displayName || sanitizeHandle(post.author.handle),
										moderation.ui("displayName"),
									)}
								</Text>
							</Link>
							<Link style={s.flex1} href={authorHref} title={authorTitle}>
								<Text
									style={{
										fontSize: 16,
										letterSpacing: 0,
										lineHeight: 1.3,
										...t.atoms.text_contrast_medium,
									}}
									numberOfLines={1}
								>
									{sanitizeHandle(post.author.handle, "@")}
								</Text>
							</Link>
						</div>
						{showFollowButton && (
							<div>
								<PostThreadFollowBtn did={post.author.did} />
							</div>
						)}
					</div>
					<div style={{ ...a.pb_sm }}>
						<LabelsOnMyPost post={post} style={{ ...a.pb_sm }} />
						<ContentHider
							modui={moderation.ui("contentView")}
							ignoreMute
							childContainerStyle={{ ...a.pt_sm }}
						>
							<PostAlerts
								modui={moderation.ui("contentView")}
								size="lg"
								includeMute
								style={{ ...a.pb_sm }}
								additionalCauses={additionalPostAlerts}
							/>
							{richText?.text ? (
								<RichText
									enableTags
									selectable
									value={richText}
									style={{
										flex: 1,
										fontSize: 20,
										letterSpacing: 0,
									}}
									authorHandle={post.author.handle}
									shouldProxyLinks={true}
								/>
							) : undefined}
							{post.embed && (
								<div style={{ ...a.py_xs }}>
									<PostEmbeds
										embed={post.embed}
										moderation={moderation}
										viewContext={PostEmbedViewContext.ThreadHighlighted}
									/>
								</div>
							)}
						</ContentHider>
						<ExpandedPostDetails
							post={post}
							isThreadAuthor={isThreadAuthor}
							translatorUrl={translatorUrl}
							needsTranslation={needsTranslation}
						/>
						{post.repostCount !== 0 || post.likeCount !== 0 || post.quoteCount !== 0 ? (
							// Show this section unless we're *sure* it has no engagement.
							<div
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 16,
									borderTop: "1px solid black",
									borderTopWidth: 1,
									borderBottom: "1px solid black",
									marginTop: 12,
									paddingTop: 12,
									paddingBottom: 12,
									...t.atoms.border_contrast_low,
								}}
							>
								{post.repostCount != null && post.repostCount !== 0 ? (
									<Link href={repostsHref} title={repostsTitle}>
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												...t.atoms.text_contrast_medium,
											}}
										>
											<Text
												style={{
													fontSize: 16,
													letterSpacing: 0,
													fontWeight: "600",
													...t.atoms.text,
												}}
											>
												{formatCount(post.repostCount)}
											</Text>{" "}
											{post.repostCount === 1 ? "repost" : "reposts"}
										</Text>
									</Link>
								) : null}
								{post.quoteCount != null && post.quoteCount !== 0 && !post.viewer?.embeddingDisabled ? (
									<Link href={quotesHref} title={quotesTitle}>
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												...t.atoms.text_contrast_medium,
											}}
										>
											<Text
												style={{
													fontSize: 16,
													letterSpacing: 0,
													fontWeight: "600",
													...t.atoms.text,
												}}
											>
												{formatCount(post.quoteCount)}
											</Text>{" "}
											{post.quoteCount === 1 ? "quote" : "quotes"}
										</Text>
									</Link>
								) : null}
								{post.likeCount != null && post.likeCount !== 0 ? (
									<Link href={likesHref} title={likesTitle}>
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												...t.atoms.text_contrast_medium,
											}}
										>
											<Text
												style={{
													fontSize: 16,
													letterSpacing: 0,
													fontWeight: "600",
													...t.atoms.text,
												}}
											>
												{formatCount(post.likeCount)}
											</Text>{" "}
											{post.likeCount === 1 ? "like" : "likes"}
										</Text>
									</Link>
								) : null}
							</div>
						) : null}
						<div
							style={{
								paddingTop: 8,
								paddingBottom: 2,

								...{
									marginLeft: -5,
								},
							}}
						>
							<PostCtrls
								big
								post={post}
								record={record}
								richText={richText}
								onPressReply={onPressReply}
								onPostReply={onPostReply}
								threadgateRecord={threadgateRecord}
							/>
						</div>
					</div>
				</div>
			</>
		);
	} else {
		const isThreadedChild = treeView && depth > 0;
		const isThreadedChildAdjacentTop = isThreadedChild && prevPost?.ctx.depth === depth && depth !== 1;
		const isThreadedChildAdjacentBot = isThreadedChild && nextPost?.ctx.depth === depth;
		return (
			<PostOuterWrapper
				post={post}
				depth={depth}
				showParentReplyLine={!!showParentReplyLine}
				treeView={treeView}
				hasPrecedingItem={hasPrecedingItem}
				hideTopBorder={hideTopBorder}
			>
				<PostHider
					href={postHref}
					disabled={overrideBlur}
					modui={moderation.ui("contentList")}
					iconSize={isThreadedChild ? 24 : 42}
					iconStyles={isThreadedChild ? { marginRight: 4 } : { marginLeft: 2, marginRight: 2 }}
					profile={post.author}
					interpretFilterAsBlur
				>
					<div
						style={{
							flexDirection: "row",
							gap: 10,
							paddingLeft: 8,
							height: isThreadedChildAdjacentTop ? 8 : 16,
						}}
					>
						<div style={{ width: 42 }}>
							{!isThreadedChild && showParentReplyLine && (
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
					</div>

					<div
						style={{
							flexDirection: "row",
							paddingLeft: 8,
							paddingRight: 8,
							gap: 12,

							...{
								paddingBottom:
									showChildReplyLine && !isThreadedChild ? 0 : isThreadedChildAdjacentBot ? 4 : 8,
							},
						}}
					>
						{/* If we are in threaded mode, the avatar is rendered in PostMeta */}
						{!isThreadedChild && (
							<div>
								<PreviewableUserAvatar
									size={42}
									profile={post.author}
									moderation={moderation.ui("avatar")}
									type={post.author.associated?.labeler ? "labeler" : "user"}
								/>

								{showChildReplyLine && (
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
						)}

						<div style={{ flex: 1 }}>
							<PostMeta
								author={post.author}
								moderation={moderation}
								timestamp={post.indexedAt}
								postHref={postHref}
								showAvatar={isThreadedChild}
								avatarSize={24}
								style={{ ...a.pb_xs }}
							/>
							<LabelsOnMyPost post={post} style={{ ...a.pb_xs }} />
							<PostAlerts
								modui={moderation.ui("contentList")}
								style={{ ...a.pb_2xs }}
								additionalCauses={additionalPostAlerts}
							/>
							{richText?.text ? (
								<div
									style={{
										paddingBottom: 2,
										paddingRight: 8,
									}}
								>
									<RichText
										enableTags
										value={richText}
										style={{
											flex: 1,
											fontSize: 16,
											letterSpacing: 0,
										}}
										numberOfLines={limitLines ? MAX_POST_LINES : undefined}
										authorHandle={post.author.handle}
										shouldProxyLinks={true}
									/>
								</div>
							) : undefined}
							{limitLines ? (
								<TextLink text={"Show More"} style={pal.link} onPress={onPressShowMore} href="#" />
							) : undefined}
							{post.embed && (
								<div style={{ ...a.pb_xs }}>
									<PostEmbeds
										embed={post.embed}
										moderation={moderation}
										viewContext={PostEmbedViewContext.Feed}
									/>
								</div>
							)}
							<PostCtrls
								post={post}
								record={record}
								richText={richText}
								onPressReply={onPressReply}
								threadgateRecord={threadgateRecord}
							/>
						</div>
					</div>
					{hasMore ? (
						<Link
							style={{
								...styles.loadMore,

								...{
									paddingLeft: treeView ? 8 : 70,
									paddingTop: 0,
									paddingBottom: treeView ? 4 : 12,
								},
							}}
							href={postHref}
							title={itemTitle}
							noFeedback
						>
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									fontWeight: "600",
									fontSize: 14,
									letterSpacing: 0,
								}}
							>
								More
							</Text>
							<ChevronRightIcon size="xs" style={t.atoms.text_contrast_medium} />
						</Link>
					) : undefined}
				</PostHider>
			</PostOuterWrapper>
		);
	}
};
PostThreadItemLoaded = memo(PostThreadItemLoaded);

function PostOuterWrapper({
	post,
	treeView,
	depth,
	showParentReplyLine,
	hasPrecedingItem,
	hideTopBorder,
	children,
}: React.PropsWithChildren<{
	post: AppBskyFeedDefs.PostView;
	treeView: boolean;
	depth: number;
	showParentReplyLine: boolean;
	hasPrecedingItem: boolean;
	hideTopBorder?: boolean;
}>) {
	const t = useTheme();
	const { state: hover, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	if (treeView && depth > 0) {
		return (
			<div
				style={{
					paddingLeft: 8,
					paddingRight: 8,
					flexDirection: "row",
					...t.atoms.border_contrast_low,
					...styles.cursor,
					...(depth === 1 && a.border_t),
				}}
				onPointerEnter={onHoverIn}
				onPointerLeave={onHoverOut}
			>
				{Array.from(Array(depth - 1)).map((_, n: number) => (
					<div
						key={`${post.uri}-padding-${n}`}
						style={{
							marginLeft: 8,
							...t.atoms.border_contrast_low,

							...{
								borderLeftWidth: 2,
								paddingLeft: a.pl_sm.paddingLeft - 2, // minus border
							},
						}}
					/>
				))}
				<div style={{ flex: 1 }}>
					<SubtleWebHover
						hover={hover}
						style={{
							left: (depth === 1 ? 0 : 2) - a.pl_sm.paddingLeft,
							right: -a.pr_sm.paddingRight,
						}}
					/>
					{children}
				</div>
			</div>
		);
	}
	return (
		<div
			onPointerEnter={onHoverIn}
			onPointerLeave={onHoverOut}
			style={{
				borderTop: "1px solid black",
				borderTopWidth: 1,
				paddingLeft: 8,
				paddingRight: 8,
				...t.atoms.border_contrast_low,
				...(showParentReplyLine && hasPrecedingItem && styles.noTopBorder),
				...(hideTopBorder && styles.noTopBorder),
				...styles.cursor,
			}}
		>
			<SubtleWebHover hover={hover} />
			{children}
		</div>
	);
}

function ExpandedPostDetails({
	post,
	isThreadAuthor,
	needsTranslation,
	translatorUrl,
}: {
	post: AppBskyFeedDefs.PostView;
	isThreadAuthor: boolean;
	needsTranslation: boolean;
	translatorUrl: string;
}) {
	const t = useTheme();
	const pal = usePalette("default");
	const openLink = useOpenLink();
	const isRootPost = !("reply" in post.record);

	const onTranslatePress = React.useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			openLink(translatorUrl, true);
			return false;
		},
		[openLink, translatorUrl],
	);

	return (
		<div
			style={{
				gap: 12,
				paddingTop: 12,
				alignItems: "flex-start",
			}}
		>
			<BackdatedPostIndicator post={post} />
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 8,
				}}
			>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
				>
					{niceDate(post.indexedAt)}
				</Text>
				{isRootPost && <WhoCanReply post={post} isThreadAuthor={isThreadAuthor} />}
				{needsTranslation && (
					<>
						<Text
							style={{
								fontSize: 14,
								letterSpacing: 0,
								...t.atoms.text_contrast_medium,
							}}
						>
							&middot;
						</Text>

						<InlineLinkText
							to={translatorUrl}
							label={"Translate"}
							style={{
								fontSize: 14,
								letterSpacing: 0,
								...pal.link,
							}}
							onPress={onTranslatePress}
						>
							Translate
						</InlineLinkText>
					</>
				)}
			</div>
		</div>
	);
}

function BackdatedPostIndicator({ post }: { post: AppBskyFeedDefs.PostView }) {
	const t = useTheme();
	const control = Prompt.usePromptControl();

	const indexedAt = new Date(post.indexedAt);
	const createdAt = bsky.dangerousIsType<AppBskyFeedPost.Record>(post.record, AppBskyFeedPost.isRecord)
		? new Date(post.record.createdAt)
		: new Date(post.indexedAt);

	// backdated if createdAt is 24 hours or more before indexedAt
	const isBackdated = indexedAt.getTime() - createdAt.getTime() > 24 * 60 * 60 * 1000;

	if (!isBackdated) return null;

	const orange = t.name === "light" ? colors.warning.dark : colors.warning.light;

	return (
		<>
			<Button
				label={"Archived post"}
				onPress={(e) => {
					e.preventDefault();
					e.stopPropagation();
					control.open();
				}}
			>
				{({ hovered, pressed }) => (
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							borderRadius: 999,
							...t.atoms.bg_contrast_25,
							...((hovered || pressed) && t.atoms.bg_contrast_50),

							...{
								gap: 3,
								paddingLeft: 6,
								paddingRight: 6,
								paddingTop: 3,
								paddingBottom: 3,
							},
						}}
					>
						<CalendarClockIcon fill={orange} size="sm" aria-hidden />
						<Text
							style={{
								fontSize: 12,
								letterSpacing: 0,
								fontWeight: "600",
								lineHeight: 1.15,
								...t.atoms.text_contrast_medium,
							}}
						>
							<>Archived from {niceDate(createdAt)}</>
						</Text>
					</div>
				)}
			</Button>
			<Prompt.Outer control={control}>
				<Prompt.TitleText>Archived post</Prompt.TitleText>
				<Prompt.DescriptionText>
					<>
						This post claims to have been created on{" "}
						<span style={{ ...a.font_bold }}>{niceDate(createdAt)}</span>, but was first seen by Bluesky on{" "}
						<span style={{ ...a.font_bold }}>{niceDate(indexedAt)}</span>.
					</>
				</Prompt.DescriptionText>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.3,
						...t.atoms.text_contrast_high,
						paddingBottom: 20,
					}}
				>
					Bluesky cannot confirm the authenticity of the claimed date.
				</Text>
				<Prompt.Actions>
					<Prompt.Action cta={"Okay"} onPress={() => {}} />
				</Prompt.Actions>
			</Prompt.Outer>
		</>
	);
}

function getThreadAuthor(post: AppBskyFeedDefs.PostView, record: AppBskyFeedPost.Record): string {
	if (!record.reply) {
		return post.author.did;
	}
	try {
		return new AtUri(record.reply.root.uri).host;
	} catch {
		return "";
	}
}

const styles = {
	outer: {
		borderTopWidth: 1,
		paddingLeft: 8,
	},
	noTopBorder: {
		borderTopWidth: 0,
	},
	meta: {
		flexDirection: "row",
		paddingTop: 2,
		paddingBottom: 2,
	},
	metaExpandedLine1: {
		paddingTop: 0,
		paddingBottom: 0,
	},
	loadMore: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: 4,
		paddingLeft: 20,
		paddingRight: 20,
	},
	replyLine: {
		width: 2,
		marginLeft: "auto",
		marginRight: "auto",
	},
	cursor: {
		cursor: "pointer",
	},
} satisfies Record<string, React.CSSProperties>;
