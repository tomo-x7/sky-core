import {
	type AppBskyActorDefs,
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	AppBskyGraphFollow,
	type ModerationDecision,
	type ModerationOpts,
	moderateProfile,
} from "@atproto/api";
import { AtUri } from "@atproto/api";
import { TID } from "@atproto/common-web";
import { useQueryClient } from "@tanstack/react-query";
import React, { memo, type ReactElement, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Link as NewLink } from "#/components/Link";
import * as MediaPreview from "#/components/MediaPreview";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { Notification as StarterPackCard } from "#/components/StarterPack/StarterPackCard";
import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import {
	ChevronBottom_Stroke2_Corner0_Rounded as ChevronDownIcon,
	ChevronTop_Stroke2_Corner0_Rounded as ChevronUpIcon,
} from "#/components/icons/Chevron";
import { Heart2_Filled_Stroke2_Corner0_Rounded as HeartIconFilled } from "#/components/icons/Heart2";
import { PersonPlus_Filled_Stroke2_Corner0_Rounded as PersonPlusIcon } from "#/components/icons/Person";
import { Repost_Stroke2_Corner2_Rounded as RepostIcon } from "#/components/icons/Repost";
import { StarterPack } from "#/components/icons/StarterPack";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { forceLTR } from "#/lib/strings/bidi";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { niceDate } from "#/lib/strings/time";
import { colors, s } from "#/lib/styles";
import { DM_SERVICE_HEADERS } from "#/state/queries/messages/const";
import type { FeedNotification } from "#/state/queries/notifications/feed";
import { precacheProfile } from "#/state/queries/profile";
import { useAgent } from "#/state/session";
import * as bsky from "#/types/bsky";
import { FeedSourceCard } from "../feeds/FeedSourceCard";
import { Post } from "../post/Post";
import { Link, TextLink } from "../util/Link";
import { TimeElapsed } from "../util/TimeElapsed";
import { PreviewableUserAvatar, UserAvatar } from "../util/UserAvatar";
import { formatCount } from "../util/numeric/format";

const MAX_AUTHORS = 5;

const EXPANDED_AUTHOR_EL_HEIGHT = 35;

interface Author {
	profile: AppBskyActorDefs.ProfileView;
	href: string;
	moderation: ModerationDecision;
}

let NotificationFeedItem = ({
	item,
	moderationOpts,
	highlightUnread,
	hideTopBorder,
}: {
	item: FeedNotification;
	moderationOpts: ModerationOpts;
	highlightUnread: boolean;
	hideTopBorder?: boolean;
}): React.ReactNode => {
	const queryClient = useQueryClient();
	const pal = usePalette("default");
	const t = useTheme();
	const [isAuthorsExpanded, setAuthorsExpanded] = useState<boolean>(false);
	const itemHref = useMemo(() => {
		if (item.type === "post-like" || item.type === "repost") {
			if (item.subjectUri) {
				const urip = new AtUri(item.subjectUri);
				return `/profile/${urip.host}/post/${urip.rkey}`;
			}
		} else if (item.type === "follow") {
			return makeProfileLink(item.notification.author);
		} else if (item.type === "reply") {
			const urip = new AtUri(item.notification.uri);
			return `/profile/${urip.host}/post/${urip.rkey}`;
		} else if (item.type === "feedgen-like" || item.type === "starterpack-joined") {
			if (item.subjectUri) {
				const urip = new AtUri(item.subjectUri);
				return `/profile/${urip.host}/feed/${urip.rkey}`;
			}
		}
		return "";
	}, [item]);

	const onToggleAuthorsExpanded = () => {
		setAuthorsExpanded((currentlyExpanded) => !currentlyExpanded);
	};

	const onBeforePress = React.useCallback(() => {
		precacheProfile(queryClient, item.notification.author);
	}, [queryClient, item.notification.author]);

	const authors: Author[] = useMemo(() => {
		return [
			{
				profile: item.notification.author,
				href: makeProfileLink(item.notification.author),
				moderation: moderateProfile(item.notification.author, moderationOpts),
			},
			...(item.additional?.map(({ author }) => ({
				profile: author,
				href: makeProfileLink(author),
				moderation: moderateProfile(author, moderationOpts),
			})) || []),
		];
	}, [item, moderationOpts]);

	const [hover, setHover] = React.useState(false);

	if (item.subjectUri && !item.subject && item.type !== "feedgen-like") {
		// don't render anything if the target post was deleted or unfindable
		return <div />;
	}

	if (item.type === "reply" || item.type === "mention" || item.type === "quote") {
		if (!item.subject) {
			return null;
		}
		const isHighlighted = highlightUnread && !item.notification.isRead;
		return (
			<Link href={itemHref} noFeedback>
				<Post
					post={item.subject}
					style={
						isHighlighted
							? {
									backgroundColor: pal.colors.unreadNotifBg,
									borderColor: pal.colors.unreadNotifBorder,
								}
							: undefined
					}
					hideTopBorder={hideTopBorder}
				/>
			</Link>
		);
	}

	const niceTimestamp = niceDate(item.notification.indexedAt);
	const firstAuthor = authors[0];
	const firstAuthorName = sanitizeDisplayName(firstAuthor.profile.displayName || firstAuthor.profile.handle);
	const firstAuthorLink = (
		<TextLink
			key={firstAuthor.href}
			style={{
				...pal.text,
				...s.bold,
			}}
			href={firstAuthor.href}
			text={
				<Text
					style={{
						...pal.text,
						...s.bold,
					}}
				>
					{forceLTR(firstAuthorName)}
				</Text>
			}
			disableMismatchWarning
		/>
	);
	const additionalAuthorsCount = authors.length - 1;
	const hasMultipleAuthors = additionalAuthorsCount > 0;
	const formattedAuthorsCount = hasMultipleAuthors ? formatCount(additionalAuthorsCount) : "";

	let a11yLabel = "";
	let notificationContent: ReactElement;
	let icon = (
		<HeartIconFilled
			size="xl"
			style={
				// {position: 'relative', top: -4}
				s.likeColor
			}
		/>
	);

	if (item.type === "post-like") {
		a11yLabel = hasMultipleAuthors
			? `${firstAuthorName} and ${formattedAuthorsCount} ${additionalAuthorsCount === 1 ? "other" : "others"} liked your post`
			: `${firstAuthorName} liked your post`;
		notificationContent = hasMultipleAuthors ? (
			<>
				{firstAuthorLink} and{" "}
				<Text
					style={{
						...pal.text,
						...s.bold,
					}}
				>
					{formattedAuthorsCount} {additionalAuthorsCount === 1 ? "other" : "others"}
				</Text>{" "}
				liked your post
			</>
		) : (
			<>{firstAuthorLink} liked your post</>
		);
	} else if (item.type === "repost") {
		a11yLabel = hasMultipleAuthors
			? `${firstAuthorName} and ${formattedAuthorsCount} ${additionalAuthorsCount === 1 ? "other" : "others"} reposted your post`
			: `${firstAuthorName} reposted your post`;
		notificationContent = hasMultipleAuthors ? (
			<>
				{firstAuthorLink} and{" "}
				<Text
					style={{
						...pal.text,
						...s.bold,
					}}
				>
					{formattedAuthorsCount} {additionalAuthorsCount === 1 ? "other" : "others"}
				</Text>{" "}
				reposted your post
			</>
		) : (
			<>{firstAuthorLink} reposted your post</>
		);
		icon = <RepostIcon size="xl" style={{ color: t.palette.positive_600 }} />;
	} else if (item.type === "follow") {
		let isFollowBack = false;

		if (
			item.notification.author.viewer?.following &&
			bsky.dangerousIsType<AppBskyGraphFollow.Record>(item.notification.record, AppBskyGraphFollow.isRecord)
		) {
			let followingTimestamp;
			try {
				const rkey = new AtUri(item.notification.author.viewer.following).rkey;
				followingTimestamp = TID.fromStr(rkey).timestamp();
			} catch (e) {
				// For some reason the following URI was invalid. Default to it not being a follow back.
				console.error("Invalid following URI");
			}
			if (followingTimestamp) {
				const followedTimestamp = new Date(item.notification.record.createdAt).getTime() * 1000;
				isFollowBack = followedTimestamp > followingTimestamp;
			}
		}

		if (isFollowBack && !hasMultipleAuthors) {
			/*
			 * Follow-backs are ungrouped, grouped follow-backs not supported atm,
			 * see `src/state/queries/notifications/util.ts`
			 */
			a11yLabel = `${firstAuthorName} followed you back`;
			notificationContent = <>{firstAuthorLink} followed you back</>;
		} else {
			a11yLabel = hasMultipleAuthors
				? `${firstAuthorName} and ${formattedAuthorsCount} ${additionalAuthorsCount === 1 ? "other" : "others"} followed you`
				: `${firstAuthorName} followed you`;
			notificationContent = hasMultipleAuthors ? (
				<>
					{firstAuthorLink} and{" "}
					<Text
						style={{
							...pal.text,
							...s.bold,
						}}
					>
						{formattedAuthorsCount} {additionalAuthorsCount === 1 ? "other" : "others"}
					</Text>{" "}
					followed you
				</>
			) : (
				<>{firstAuthorLink} followed you</>
			);
		}
		icon = <PersonPlusIcon size="xl" style={{ color: t.palette.primary_500 }} />;
	} else if (item.type === "feedgen-like") {
		a11yLabel = hasMultipleAuthors
			? `${firstAuthorName} and ${formattedAuthorsCount} ${additionalAuthorsCount === 1 ? "other" : "others"} liked your custom feed`
			: `${firstAuthorName} liked your custom feed`;
		notificationContent = hasMultipleAuthors ? (
			<>
				{firstAuthorLink} and{" "}
				<Text
					style={{
						...pal.text,
						...s.bold,
					}}
				>
					{formattedAuthorsCount} {additionalAuthorsCount === 1 ? "other" : "others"}
				</Text>{" "}
				liked your custom feed
			</>
		) : (
			<>{firstAuthorLink} liked your custom feed</>
		);
	} else if (item.type === "starterpack-joined") {
		a11yLabel = hasMultipleAuthors
			? `${firstAuthorName} and ${formattedAuthorsCount} ${additionalAuthorsCount === 1 ? "other" : "others"} signed up with your starter pack`
			: `${firstAuthorName} signed up with your starter pack`;
		notificationContent = hasMultipleAuthors ? (
			<>
				{firstAuthorLink} and{" "}
				<Text
					style={{
						...pal.text,
						...s.bold,
					}}
				>
					{formattedAuthorsCount} {additionalAuthorsCount === 1 ? "other" : "others"}
				</Text>{" "}
				signed up with your starter pack
			</>
		) : (
			<>{firstAuthorLink} signed up with your starter pack</>
		);
		icon = (
			<div style={{ height: 30, width: 30 }}>
				<StarterPack width={30} gradient="sky" />
			</div>
		);
	} else {
		return null;
	}
	a11yLabel += ` · ${niceTimestamp}`;

	return (
		<Link
			style={{
				...styles.outer,
				...pal.border,

				...(item.notification.isRead
					? undefined
					: {
							backgroundColor: pal.colors.unreadNotifBg,
							borderColor: pal.colors.unreadNotifBorder,
						}),

				...{ borderTopWidth: hideTopBorder ? 0 : 1 },
				overflow: "hidden",
			}}
			href={itemHref}
			noFeedback
			onPointerEnter={() => {
				setHover(true);
			}}
			onPointerLeave={() => {
				setHover(false);
			}}
		>
			<SubtleWebHover hover={hover} />
			<div
				style={{
					...styles.layoutIcon,
					paddingRight: 8,
				}}
			>
				{/* TODO: Prevent conditional rendering and move toward composable
		  notifications for clearer accessibility labeling */}
				{icon}
			</div>
			<div style={styles.layoutContent}>
				<ExpandListPressable
					hasMultipleAuthors={hasMultipleAuthors}
					onToggleAuthorsExpanded={onToggleAuthorsExpanded}
				>
					<CondensedAuthorsList
						visible={!isAuthorsExpanded}
						authors={authors}
						onToggleAuthorsExpanded={onToggleAuthorsExpanded}
						showDmButton={item.type === "starterpack-joined"}
					/>
					<ExpandedAuthorsList visible={isAuthorsExpanded} authors={authors} />
					<Text
						style={{
							...styles.meta,
							alignSelf: "flex-start",
							...pal.text,
						}}
					>
						{notificationContent}
						<TimeElapsed timestamp={item.notification.indexedAt}>
							{({ timeElapsed }) => (
								<>
									{/* make sure there's whitespace around the middot -sfn */}
									<Text style={pal.textLight}> &middot; </Text>
									<Text style={pal.textLight} title={niceTimestamp}>
										{timeElapsed}
									</Text>
								</>
							)}
						</TimeElapsed>
					</Text>
				</ExpandListPressable>
				{item.type === "post-like" || item.type === "repost" ? (
					<AdditionalPostText post={item.subject} />
				) : null}
				{item.type === "feedgen-like" && item.subjectUri ? (
					<FeedSourceCard
						feedUri={item.subjectUri}
						style={{
							...t.atoms.bg,
							...t.atoms.border_contrast_low,
							border: "1px solid black",
							borderWidth: 1,
							...styles.feedcard,
						}}
						showLikes
					/>
				) : null}
				{item.type === "starterpack-joined" ? (
					<div>
						<div
							style={{
								border: "1px solid black",
								borderWidth: 1,
								padding: 8,
								borderRadius: 8,
								marginTop: 8,
								...t.atoms.border_contrast_low,
							}}
						>
							<StarterPackCard starterPack={item.subject} />
						</div>
					</div>
				) : null}
			</div>
		</Link>
	);
};
NotificationFeedItem = memo(NotificationFeedItem);
export { NotificationFeedItem };

function ExpandListPressable({
	hasMultipleAuthors,
	children,
	onToggleAuthorsExpanded,
}: {
	hasMultipleAuthors: boolean;
	children: React.ReactNode;
	onToggleAuthorsExpanded: () => void;
}) {
	if (hasMultipleAuthors) {
		return (
			<button type="button" onClick={onToggleAuthorsExpanded} style={styles.expandedAuthorsTrigger}>
				{children}
			</button>
		);
	} else {
		return <>{children}</>;
	}
}

function SayHelloBtn({ profile }: { profile: AppBskyActorDefs.ProfileView }) {
	const agent = useAgent();
	const [isLoading, setIsLoading] = React.useState(false);
	const navigate = useNavigate();

	if (
		profile.associated?.chat?.allowIncoming === "none" ||
		(profile.associated?.chat?.allowIncoming === "following" && !profile.viewer?.followedBy)
	) {
		return null;
	}

	return (
		<Button
			label={"Say hello!"}
			variant="ghost"
			color="primary"
			size="small"
			style={{
				alignSelf: "center",
				...{ marginLeft: "auto" },
			}}
			disabled={isLoading}
			onPress={async () => {
				try {
					setIsLoading(true);
					const res = await agent.api.chat.bsky.convo.getConvoForMembers(
						{
							members: [profile.did, agent.session!.did!],
						},
						{ headers: DM_SERVICE_HEADERS },
					);
					navigate(`/messages/${res.data.convo.id}`);
				} catch (e) {
				} finally {
					setIsLoading(false);
				}
			}}
		>
			<ButtonText>Say hello!</ButtonText>
		</Button>
	);
}

function CondensedAuthorsList({
	visible,
	authors,
	onToggleAuthorsExpanded,
	showDmButton = true,
}: {
	visible: boolean;
	authors: Author[];
	onToggleAuthorsExpanded: () => void;
	showDmButton?: boolean;
}) {
	const pal = usePalette("default");

	if (!visible) {
		return (
			<div style={styles.avis}>
				<button type="button" style={styles.expandedAuthorsCloseBtn} onClick={onToggleAuthorsExpanded}>
					<ChevronUpIcon
						size="md"
						style={{
							...styles.expandedAuthorsCloseBtnIcon,
							...pal.text,
						}}
					/>
					<Text type="sm-medium" style={pal.text}>
						Hide
					</Text>
				</button>
			</div>
		);
	}
	if (authors.length === 1) {
		return (
			<div style={styles.avis}>
				<PreviewableUserAvatar
					size={35}
					profile={authors[0].profile}
					moderation={authors[0].moderation.ui("avatar")}
					type={authors[0].profile.associated?.labeler ? "labeler" : "user"}
				/>
				{showDmButton ? <SayHelloBtn profile={authors[0].profile} /> : null}
			</div>
		);
	}
	return (
		<button type="button" onClick={onToggleAuthorsExpanded}>
			<div style={styles.avis}>
				{authors.slice(0, MAX_AUTHORS).map((author) => (
					<div key={author.href} style={s.mr5}>
						<PreviewableUserAvatar
							size={35}
							profile={author.profile}
							moderation={author.moderation.ui("avatar")}
							type={author.profile.associated?.labeler ? "labeler" : "user"}
						/>
					</div>
				))}
				{authors.length > MAX_AUTHORS ? (
					<Text
						style={{
							...styles.aviExtraCount,
							...pal.textLight,
						}}
					>
						+{authors.length - MAX_AUTHORS}
					</Text>
				) : undefined}
				<ChevronDownIcon
					size="md"
					style={{
						...styles.expandedAuthorsCloseBtnIcon,
						...pal.textLight,
					}}
				/>
			</div>
		</button>
	);
}

function ExpandedAuthorsList({
	visible,
	authors,
}: {
	visible: boolean;
	authors: Author[];
}) {
	const pal = usePalette("default");
	// const heightInterp = useAnimatedValue(visible ? 1 : 0);
	// const targetHeight = authors.length * (EXPANDED_AUTHOR_EL_HEIGHT + 10); /*10=margin*/
	// const heightStyle = {
	// 	height: Animated.multiply(heightInterp, targetHeight),
	// };
	// useEffect(() => {
	// 	Animated.timing(heightInterp, {
	// 		toValue: visible ? 1 : 0,
	// 		duration: 200,
	// 		useNativeDriver: false,
	// 	}).start();
	// }, [heightInterp, visible]);

	return (
		<div
			style={{
				overflow: "hidden",
				// ...heightStyle,
			}}
		>
			{visible &&
				authors.map((author) => (
					<NewLink
						key={author.profile.did}
						label={author.profile.displayName || author.profile.handle}
						to={makeProfileLink({
							did: author.profile.did,
							handle: author.profile.handle,
						})}
						style={styles.expandedAuthor}
					>
						<div style={styles.expandedAuthorAvi}>
							<ProfileHoverCard did={author.profile.did}>
								<UserAvatar
									size={35}
									avatar={author.profile.avatar}
									moderation={author.moderation.ui("avatar")}
									type={author.profile.associated?.labeler ? "labeler" : "user"}
								/>
							</ProfileHoverCard>
						</div>
						<div style={s.flex1}>
							<Text type="lg-bold" numberOfLines={1} style={pal.text} lineHeight={1.2}>
								<Text type="lg-bold" style={pal.text} lineHeight={1.2}>
									{sanitizeDisplayName(author.profile.displayName || author.profile.handle)}
								</Text>{" "}
								<Text style={pal.textLight} lineHeight={1.2}>
									{sanitizeHandle(author.profile.handle, "@")}
								</Text>
							</Text>
						</div>
					</NewLink>
				))}
		</div>
	);
}

function AdditionalPostText({ post }: { post?: AppBskyFeedDefs.PostView }) {
	const pal = usePalette("default");
	if (post && bsky.dangerousIsType<AppBskyFeedPost.Record>(post?.record, AppBskyFeedPost.isRecord)) {
		const text = post.record.text;

		return (
			<>
				{text?.length > 0 && <Text style={pal.textLight}>{text}</Text>}
				<MediaPreview.Embed embed={post.embed} style={styles.additionalPostImages} />
			</>
		);
	}
}

const styles = {
	pointer: {
		cursor: "pointer",
	},

	outer: {
		padding: 10,
		paddingRight: 15,
		flexDirection: "row",
	},
	layoutIcon: {
		width: 60,
		alignItems: "flex-end",
		paddingTop: 2,
	},
	icon: {
		marginRight: 10,
		marginTop: 4,
	},
	layoutContent: {
		flex: 1,
	},
	avis: {
		flexDirection: "row",
		alignItems: "center",
	},
	aviExtraCount: {
		fontWeight: "600",
		paddingLeft: 6,
	},
	meta: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingTop: 6,
		paddingBottom: 2,
	},
	postText: {
		paddingBottom: 5,
		color: colors.black,
	},
	additionalPostImages: {
		marginTop: 5,
		marginLeft: 2,
		opacity: 0.8,
	},
	feedcard: {
		borderRadius: 8,
		paddingTop: 12,
		paddingBottom: 12,
		marginTop: 6,
	},

	addedContainer: {
		paddingTop: 4,
		paddingLeft: 36,
	},
	expandedAuthorsTrigger: {
		zIndex: 1,
	},
	expandedAuthorsCloseBtn: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 10,
		paddingBottom: 6,
	},
	expandedAuthorsCloseBtnIcon: {
		marginLeft: 4,
		marginRight: 4,
	},
	expandedAuthor: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
		height: EXPANDED_AUTHOR_EL_HEIGHT,
	},
	expandedAuthorAvi: {
		marginRight: 5,
	},
} satisfies Record<string, React.CSSProperties>;
