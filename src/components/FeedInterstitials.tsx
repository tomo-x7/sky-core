import { type AppBskyFeedDefs, AtUri } from "@atproto/api";
import React from "react";

import { useNavigate } from "react-router-dom";
import { type ViewStyleProp, atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as FeedCard from "#/components/FeedCard";
import { InlineLinkText } from "#/components/Link";
import * as ProfileCard from "#/components/ProfileCard";
import { Text } from "#/components/Typography";
import { ArrowRight_Stroke2_Corner0_Rounded as Arrow } from "#/components/icons/Arrow";
import { Hashtag_Stroke2_Corner0_Rounded as Hashtag } from "#/components/icons/Hashtag";
import { PersonPlus_Stroke2_Corner0_Rounded as Person } from "#/components/icons/Person";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useGetPopularFeedsQuery } from "#/state/queries/feed";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { useProfilesQuery } from "#/state/queries/profile";
import { useSuggestedFollowsByActorQuery } from "#/state/queries/suggested-follows";
import { useSession } from "#/state/session";
import * as userActionHistory from "#/state/userActionHistory";
import type { SeenPost } from "#/state/userActionHistory";
import type * as bsky from "#/types/bsky";
import { ProgressGuideList } from "./ProgressGuide/List";

const MOBILE_CARD_WIDTH = 300;

function CardOuter({ children, style }: { children: React.ReactNode | React.ReactNode[] } & ViewStyleProp) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	return (
		<div
			style={{
				width: "100%",
				padding: 16,
				borderRadius: 12,
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				...(!gtMobile
					? {
							width: MOBILE_CARD_WIDTH,
						}
					: {}),
				...style,
			}}
		>
			{children}
		</div>
	);
}

export function SuggestedFollowPlaceholder() {
	const t = useTheme();
	return (
		<CardOuter style={{ gap: 12, ...t.atoms.border_contrast_low }}>
			<ProfileCard.Header>
				<ProfileCard.AvatarPlaceholder />
				<ProfileCard.NameAndHandlePlaceholder />
			</ProfileCard.Header>
			<ProfileCard.DescriptionPlaceholder numberOfLines={2} />
		</CardOuter>
	);
}

export function SuggestedFeedsCardPlaceholder() {
	const t = useTheme();
	return (
		<CardOuter style={{ gap: 8, ...t.atoms.border_contrast_low }}>
			<FeedCard.Header>
				<FeedCard.AvatarPlaceholder />
				<FeedCard.TitleAndBylinePlaceholder creator />
			</FeedCard.Header>
			<FeedCard.DescriptionPlaceholder />
		</CardOuter>
	);
}

function getRank(seenPost: SeenPost): string {
	let tier: string;
	if (seenPost.feedContext === "popfriends") {
		tier = "a";
	} else if (seenPost.feedContext?.startsWith("cluster")) {
		tier = "b";
	} else if (seenPost.feedContext === "popcluster") {
		tier = "c";
	} else if (seenPost.feedContext?.startsWith("ntpc")) {
		tier = "d";
	} else if (seenPost.feedContext?.startsWith("t-")) {
		tier = "e";
	} else if (seenPost.feedContext === "nettop") {
		tier = "f";
	} else {
		tier = "g";
	}
	let score = Math.round(Math.log(1 + seenPost.likeCount + seenPost.repostCount + seenPost.replyCount));
	if (seenPost.isFollowedBy || Math.random() > 0.9) {
		score *= 2;
	}
	const rank = 100 - score;
	return `${tier}-${rank}`;
}

function sortSeenPosts(postA: SeenPost, postB: SeenPost): 0 | 1 | -1 {
	const rankA = getRank(postA);
	const rankB = getRank(postB);
	// Yes, we're comparing strings here.
	// The "larger" string means a worse rank.
	if (rankA > rankB) {
		return 1;
	} else if (rankA < rankB) {
		return -1;
	} else {
		return 0;
	}
}

function useExperimentalSuggestedUsersQuery() {
	const { currentAccount } = useSession();
	const userActionSnapshot = userActionHistory.useActionHistorySnapshot();
	const dids = React.useMemo(() => {
		const { likes, follows, followSuggestions, seen } = userActionSnapshot;
		const likeDids = likes
			.map((l) => new AtUri(l))
			.map((uri) => uri.host)
			.filter((did) => !follows.includes(did));
		let suggestedDids: string[] = [];
		if (followSuggestions.length > 0) {
			suggestedDids = [
				// It's ok if these will pick the same item (weighed by its frequency)
				followSuggestions[Math.floor(Math.random() * followSuggestions.length)],
				followSuggestions[Math.floor(Math.random() * followSuggestions.length)],
				followSuggestions[Math.floor(Math.random() * followSuggestions.length)],
				followSuggestions[Math.floor(Math.random() * followSuggestions.length)],
			];
		}
		const seenDids = seen
			.sort(sortSeenPosts)
			.map((l) => new AtUri(l.uri))
			.map((uri) => uri.host);
		return [...new Set([...suggestedDids, ...likeDids, ...seenDids])].filter((did) => did !== currentAccount?.did);
	}, [userActionSnapshot, currentAccount]);
	const { data, isLoading, error } = useProfilesQuery({
		handles: dids.slice(0, 16),
	});

	const profiles = data
		? data.profiles.filter((profile) => {
				return !profile.viewer?.following;
			})
		: [];

	return {
		isLoading,
		error,
		profiles: profiles.slice(0, 6),
	};
}

export function SuggestedFollows({ feed }: { feed: FeedDescriptor }) {
	const { currentAccount } = useSession();
	const [feedType, feedUriOrDid] = feed.split("|");
	if (feedType === "author") {
		if (currentAccount?.did === feedUriOrDid) {
			return null;
		} else {
			return <SuggestedFollowsProfile did={feedUriOrDid} />;
		}
	} else {
		return <SuggestedFollowsHome />;
	}
}

function SuggestedFollowsProfile({ did }: { did: string }) {
	const {
		isLoading: isSuggestionsLoading,
		data,
		error,
	} = useSuggestedFollowsByActorQuery({
		did,
	});
	return (
		<ProfileGrid
			isSuggestionsLoading={isSuggestionsLoading}
			profiles={data?.suggestions ?? []}
			recId={data?.recId}
			error={error}
			viewContext="profile"
		/>
	);
}

function SuggestedFollowsHome() {
	const { isLoading: isSuggestionsLoading, profiles, error } = useExperimentalSuggestedUsersQuery();
	return (
		<ProfileGrid isSuggestionsLoading={isSuggestionsLoading} profiles={profiles} error={error} viewContext="feed" />
	);
}

function ProfileGrid({
	isSuggestionsLoading,
	error,
	profiles,
	recId,
	viewContext = "feed",
}: {
	isSuggestionsLoading: boolean;
	profiles: bsky.profile.AnyProfileView[];
	recId?: number;
	error: Error | null;
	viewContext: "profile" | "feed";
}) {
	const t = useTheme();
	const moderationOpts = useModerationOpts();
	const navigate = useNavigate();
	const { gtMobile } = useBreakpoints();
	const isLoading = isSuggestionsLoading || !moderationOpts;
	const maxLength = gtMobile ? 4 : 6;

	const content = isLoading ? (
		Array(maxLength)
			.fill(0)
			.map((_, i) => (
				<div key={i.toString()} style={gtMobile ? { flex: "0 0 auto", width: "calc(50% - 6px)" } : undefined}>
					<SuggestedFollowPlaceholder />
				</div>
			))
	) : error || !profiles.length ? null : (
		<>
			{profiles.slice(0, maxLength).map((profile, index) => (
				<ProfileCard.Link
					key={profile.did}
					profile={profile}
					style={{
						flex: 1,
						...flatten(gtMobile && [a.flex_0, { width: "calc(50% - 6px)" }]),
					}}
				>
					{({ hovered, pressed }) => (
						<CardOuter style={{ flex: 1, ...(hovered || pressed ? t.atoms.border_contrast_high : {}) }}>
							<ProfileCard.Outer>
								<ProfileCard.Header>
									<ProfileCard.Avatar profile={profile} moderationOpts={moderationOpts} />
									<ProfileCard.NameAndHandle profile={profile} moderationOpts={moderationOpts} />
									<ProfileCard.FollowButton
										profile={profile}
										moderationOpts={moderationOpts}
										shape="round"
										colorInverted
									/>
								</ProfileCard.Header>
								<ProfileCard.Description profile={profile} numberOfLines={2} />
							</ProfileCard.Outer>
						</CardOuter>
					)}
				</ProfileCard.Link>
			))}
		</>
	);

	if (error || (!isLoading && profiles.length < 4)) {
		return null;
	}

	return (
		<div
			style={{
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
				...t.atoms.bg_contrast_25,
			}}
		>
			<div
				style={{
					padding: 16,
					paddingBottom: 4,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: 0,
						fontWeight: "600",
						...t.atoms.text_contrast_medium,
					}}
				>
					{viewContext === "profile" ? <>Similar accounts</> : <>Suggested for you</>}
				</Text>
				<Person fill={t.atoms.text_contrast_low.color} size="sm" />
			</div>
			{gtMobile ? (
				<div
					style={{
						flex: 1,
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 8,
						paddingBottom: 16,
						gap: 12,
					}}
				>
					<div
						style={{
							flex: 1,
							flexDirection: "row",
							flexWrap: "wrap",
							gap: 8,
						}}
					>
						{content}
					</div>

					<div
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
							alignItems: "center",
							gap: 12,
						}}
					>
						<InlineLinkText
							label={"Browse more suggestions"}
							to="/search"
							style={t.atoms.text_contrast_medium}
						>
							Browse more suggestions
						</InlineLinkText>
						<Arrow size="sm" fill={t.atoms.text_contrast_medium.color} />
					</div>
				</div>
			) : (
				<div
				// ScrollView from react-native-gesture-handler
				// horizontal
				// showsHorizontalScrollIndicator={false}
				// snapToInterval={MOBILE_CARD_WIDTH + a.gap_md.gap}
				// decelerationRate="fast"
				>
					<div
						style={{
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 8,
							paddingBottom: 16,
							flexDirection: "row",
							gap: 12,
						}}
					>
						{content}

						<Button
							label={"Browse more accounts on the Explore page"}
							onPress={() => {
								navigate("/search");
							}}
						>
							<CardOuter style={{ flex: 1, borderWidth: 0 }}>
								<div
									style={{
										flex: 1,
										justifyContent: "center",
									}}
								>
									<div
										style={{
											flexDirection: "row",
											paddingLeft: 16,
											paddingRight: 16,
										}}
									>
										<Text
											style={{
												paddingRight: 20,
												flex: 1,
												lineHeight: 1.3,
											}}
										>
											Browse more suggestions on the Explore page
										</Text>

										<Arrow size="xl" />
									</div>
								</div>
							</CardOuter>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export function SuggestedFeeds() {
	const numFeedsToDisplay = 3;
	const t = useTheme();
	const { data, isLoading, error } = useGetPopularFeedsQuery({
		limit: numFeedsToDisplay,
	});
	const navigate = useNavigate();
	const { gtMobile } = useBreakpoints();

	const feeds = React.useMemo(() => {
		const items: AppBskyFeedDefs.GeneratorView[] = [];

		if (!data) return items;

		for (const page of data.pages) {
			for (const feed of page.feeds) {
				items.push(feed);
			}
		}

		return items;
	}, [data]);

	const content = isLoading ? (
		Array(numFeedsToDisplay)
			.fill(0)
			.map((_, i) => <SuggestedFeedsCardPlaceholder key={i.toString()} />)
	) : error || !feeds ? null : (
		<>
			{feeds.slice(0, numFeedsToDisplay).map((feed) => (
				<FeedCard.Link key={feed.uri} view={feed}>
					{({ hovered, pressed }) => (
						<CardOuter style={{ flex: 1, ...(hovered || pressed ? t.atoms.border_contrast_high : {}) }}>
							<FeedCard.Outer>
								<FeedCard.Header>
									<FeedCard.Avatar src={feed.avatar} />
									<FeedCard.TitleAndByline title={feed.displayName} creator={feed.creator} />
								</FeedCard.Header>
								<FeedCard.Description description={feed.description} numberOfLines={3} />
							</FeedCard.Outer>
						</CardOuter>
					)}
				</FeedCard.Link>
			))}
		</>
	);

	return error ? null : (
		<div
			style={{
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
				...t.atoms.bg_contrast_25,
			}}
		>
			<div
				style={{
					paddingTop: 24,
					paddingLeft: 16,
					paddingRight: 16,
					flexDirection: "row",
					paddingBottom: 4,
				}}
			>
				<Text
					style={{
						flex: 1,
						fontSize: 18,
						letterSpacing: 0,
						fontWeight: "600",
						...t.atoms.text_contrast_medium,
					}}
				>
					Some other feeds you might like
				</Text>
				<Hashtag fill={t.atoms.text_contrast_low.color} />
			</div>

			{gtMobile ? (
				<div
					style={{
						flex: 1,
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 12,
						paddingBottom: 20,
						gap: 12,
					}}
				>
					{content}

					<div
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
							alignItems: "center",
							paddingTop: 4,
							gap: 12,
						}}
					>
						<InlineLinkText
							label={"Browse more suggestions"}
							to="/search"
							style={t.atoms.text_contrast_medium}
						>
							Browse more suggestions
						</InlineLinkText>
						<Arrow size="sm" fill={t.atoms.text_contrast_medium.color} />
					</div>
				</div>
			) : (
				<div
				// ScrollView from react-native-gesture-handler
				// horizontal
				// showsHorizontalScrollIndicator={false}
				// snapToInterval={MOBILE_CARD_WIDTH + a.gap_md.gap}
				// decelerationRate="fast"
				>
					<div
						style={{
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 12,
							paddingBottom: 20,
							flexDirection: "row",
							gap: 12,
						}}
					>
						{content}

						<Button
							label={"Browse more feeds on the Explore page"}
							onPress={() => {
								navigate("/search");
							}}
							style={{ flexDirection: "column" }}
						>
							<CardOuter style={{ flex: 1 }}>
								<div
									style={{
										flex: 1,
										justifyContent: "center",
									}}
								>
									<div
										style={{
											flexDirection: "row",
											paddingLeft: 16,
											paddingRight: 16,
										}}
									>
										<Text
											style={{
												paddingRight: 20,
												flex: 1,
												lineHeight: 1.3,
											}}
										>
											Browse more suggestions on the Explore page
										</Text>

										<Arrow size="xl" />
									</div>
								</div>
							</CardOuter>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export function ProgressGuide() {
	const t = useTheme();
	return (
		<div
			style={{
				...t.atoms.border_contrast_low,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 16,
				paddingBottom: 16,
			}}
		>
			<ProgressGuideList />
		</div>
	);
}
