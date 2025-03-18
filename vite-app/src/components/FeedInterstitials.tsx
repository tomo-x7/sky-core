import { type AppBskyFeedDefs, AtUri } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";

import { type ViewStyleProp, atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as FeedCard from "#/components/FeedCard";
import { InlineLinkText } from "#/components/Link";
import * as ProfileCard from "#/components/ProfileCard";
import { Text } from "#/components/Typography";
import { ArrowRight_Stroke2_Corner0_Rounded as Arrow } from "#/components/icons/Arrow";
import { Hashtag_Stroke2_Corner0_Rounded as Hashtag } from "#/components/icons/Hashtag";
import { PersonPlus_Stroke2_Corner0_Rounded as Person } from "#/components/icons/Person";
import type { NavigationProp } from "#/lib/routes/types";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useGetPopularFeedsQuery } from "#/state/queries/feed";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { useProfilesQuery } from "#/state/queries/profile";
import { useSuggestedFollowsByActorQuery } from "#/state/queries/suggested-follows";
import { useSession } from "#/state/session";
import * as userActionHistory from "#/state/userActionHistory";
import type { SeenPost } from "#/state/userActionHistory";
import type * as bsky from "#/types/bsky";
import { BlockDrawerGesture } from "#/view/shell/BlockDrawerGesture";
import { ProgressGuideList } from "./ProgressGuide/List";

const MOBILE_CARD_WIDTH = 300;

function CardOuter({ children, style }: { children: React.ReactNode | React.ReactNode[] } & ViewStyleProp) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	return (
		<div
			style={{
				...a.w_full,
				...a.p_lg,
				...a.rounded_md,
				...a.border,
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
		<CardOuter style={{ ...a.gap_md, ...t.atoms.border_contrast_low }}>
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
		<CardOuter style={{ ...a.gap_sm, ...t.atoms.border_contrast_low }}>
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

export function SuggestedFollowsProfile({ did }: { did: string }) {
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

export function SuggestedFollowsHome() {
	const { isLoading: isSuggestionsLoading, profiles, error } = useExperimentalSuggestedUsersQuery();
	return (
		<ProfileGrid isSuggestionsLoading={isSuggestionsLoading} profiles={profiles} error={error} viewContext="feed" />
	);
}

export function ProfileGrid({
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
	const navigation = useNavigation<NavigationProp>();
	const { gtMobile } = useBreakpoints();
	const isLoading = isSuggestionsLoading || !moderationOpts;
	const maxLength = gtMobile ? 4 : 6;

	const content = isLoading ? (
		Array(maxLength)
			.fill(0)
			.map((_, i) => (
				<div key={i.toString()} style={gtMobile ? { ...a.flex_0, width: "calc(50% - 6px)" } : undefined}>
					<SuggestedFollowPlaceholder />
				</div>
			))
	) : error || !profiles.length ? null : (
		<>
			{profiles.slice(0, maxLength).map((profile, index) => (
				<ProfileCard.Link
					key={profile.did}
					profile={profile}
					//@ts-expect-error
					style={{
						...a.flex_1,
						...(gtMobile && [a.flex_0, { width: "calc(50% - 6px)" }]),
					}}
				>
					{({ hovered, pressed }) => (
						<CardOuter style={{ ...a.flex_1, ...(hovered || pressed ? t.atoms.border_contrast_high : {}) }}>
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
		<div style={{ ...a.border_t, ...t.atoms.border_contrast_low, ...t.atoms.bg_contrast_25 }}>
			<div style={{ ...a.p_lg, ...a.pb_xs, ...a.flex_row, ...a.align_center, ...a.justify_between }}>
				<Text
					style={{
						...a.text_sm,
						...a.font_bold,
						...t.atoms.text_contrast_medium,
					}}
				>
					{viewContext === "profile" ? <>Similar accounts</> : <>Suggested for you</>}
				</Text>
				<Person fill={t.atoms.text_contrast_low.color} size="sm" />
			</div>
			{gtMobile ? (
				<div style={{ ...a.flex_1, ...a.px_lg, ...a.pt_sm, ...a.pb_lg, ...a.gap_md }}>
					<div
						style={{
							...a.flex_1,
							...a.flex_row,
							...a.flex_wrap,
							...a.gap_sm,
						}}
					>
						{content}
					</div>

					<div
						style={{
							...a.flex_row,
							...a.justify_end,
							...a.align_center,
							...a.gap_md,
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
				<BlockDrawerGesture>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						snapToInterval={MOBILE_CARD_WIDTH + a.gap_md.gap}
						decelerationRate="fast"
					>
						<div
							style={{
								...a.px_lg,
								...a.pt_sm,
								...a.pb_lg,
								...a.flex_row,
								...a.gap_md,
							}}
						>
							{content}

							<Button
								label={"Browse more accounts on the Explore page"}
								onPress={() => {
									navigation.navigate("SearchTab");
								}}
							>
								<CardOuter style={{ ...a.flex_1, borderWidth: 0 }}>
									<div
										style={{
											...a.flex_1,
											...a.justify_center,
										}}
									>
										<div
											style={{
												...a.flex_row,
												...a.px_lg,
											}}
										>
											<Text
												style={{
													...a.pr_xl,
													...a.flex_1,
													...a.leading_snug,
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
					</ScrollView>
				</BlockDrawerGesture>
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
	const navigation = useNavigation<NavigationProp>();
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
						<CardOuter style={{ ...a.flex_1, ...(hovered || pressed ? t.atoms.border_contrast_high : {}) }}>
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
				...a.border_t,
				...t.atoms.border_contrast_low,
				...t.atoms.bg_contrast_25,
			}}
		>
			<div
				style={{
					...a.pt_2xl,
					...a.px_lg,
					...a.flex_row,
					...a.pb_xs,
				}}
			>
				<Text
					style={{
						...a.flex_1,
						...a.text_lg,
						...a.font_bold,
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
						...a.flex_1,
						...a.px_lg,
						...a.pt_md,
						...a.pb_xl,
						...a.gap_md,
					}}
				>
					{content}

					<div
						style={{
							...a.flex_row,
							...a.justify_end,
							...a.align_center,
							...a.pt_xs,
							...a.gap_md,
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
				<BlockDrawerGesture>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						snapToInterval={MOBILE_CARD_WIDTH + a.gap_md.gap}
						decelerationRate="fast"
					>
						<div
							style={{
								...a.px_lg,
								...a.pt_md,
								...a.pb_xl,
								...a.flex_row,
								...a.gap_md,
							}}
						>
							{content}

							<Button
								label={"Browse more feeds on the Explore page"}
								onPress={() => {
									navigation.navigate("SearchTab");
								}}
								style={a.flex_col}
							>
								<CardOuter style={a.flex_1}>
									<div
										style={{
											...a.flex_1,
											...a.justify_center,
										}}
									>
										<div
											style={{
												...a.flex_row,
												...a.px_lg,
											}}
										>
											<Text
												style={{
													...a.pr_xl,
													...a.flex_1,
													...a.leading_snug,
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
					</ScrollView>
				</BlockDrawerGesture>
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
				...a.px_lg,
				...a.py_lg,
				...a.pb_lg,
			}}
		>
			<ProgressGuideList />
		</div>
	);
}
