import {
	type AppBskyActorDefs,
	type AppBskyFeedDefs,
	type ModerationDecision,
	type ModerationOpts,
	moderateProfile,
} from "@atproto/api";
import React from "react";

import { type ViewStyleProp, atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as FeedCard from "#/components/FeedCard";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { ArrowBottom_Stroke2_Corner0_Rounded as ArrowBottom } from "#/components/icons/Arrow";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { ListSparkle_Stroke2_Corner0_Rounded as ListSparkle } from "#/components/icons/ListSparkle";
import { UserCircle_Stroke2_Corner0_Rounded as Person } from "#/components/icons/UserCircle";
import type { Props as SVGIconProps } from "#/components/icons/common";
import { cleanError } from "#/lib/strings/errors";
import { ExploreRecommendations } from "#/screens/Search/components/ExploreRecommendations";
import { ExploreTrendingTopics } from "#/screens/Search/components/ExploreTrendingTopics";
import { ExploreTrendingVideos } from "#/screens/Search/components/ExploreTrendingVideos";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useGetPopularFeedsQuery } from "#/state/queries/feed";
import { usePreferencesQuery } from "#/state/queries/preferences";
import { useSuggestedFollowsQuery } from "#/state/queries/suggested-follows";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { List } from "#/view/com/util/List";
import { FeedFeedLoadingPlaceholder, ProfileCardFeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { UserAvatar } from "#/view/com/util/UserAvatar";

function SuggestedItemsHeader({
	title,
	description,
	style,
	icon: Icon,
}: {
	title: string;
	description: string;
	icon: React.ComponentType<SVGIconProps>;
} & ViewStyleProp) {
	const t = useTheme();

	return (
		<div
			style={{
				flexDirection: "row",
				paddingLeft: 16,
				paddingRight: 16,
				paddingBottom: 16,
				paddingTop: 24,
				gap: 12,
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
				...style,
			}}
		>
			<div
				style={{
					flex: 1,
					gap: 8,
				}}
			>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Icon size="lg" fill={t.palette.primary_500} style={{ marginLeft: -2 }} />
					<Text
						style={{
							fontSize: 22,
							letterSpacing: 0,
							fontWeight: "800",
							...t.atoms.text,
						}}
					>
						{title}
					</Text>
				</div>
				<Text
					style={{
						...t.atoms.text_contrast_high,
						lineHeight: 1.3,
					}}
				>
					{description}
				</Text>
			</div>
		</div>
	);
}

type LoadMoreItem =
	| {
			type: "profile";
			key: string;
			avatar: string | undefined;
			moderation: ModerationDecision;
	  }
	| {
			type: "feed";
			key: string;
			avatar: string | undefined;
			moderation: undefined;
	  };

function LoadMore({
	item,
	moderationOpts,
}: {
	item: ExploreScreenItems & { type: "loadMore" };
	moderationOpts?: ModerationOpts;
}) {
	const t = useTheme();
	const items: LoadMoreItem[] = React.useMemo(() => {
		return item.items
			.map((_item) => {
				let loadMoreItem: LoadMoreItem | undefined;
				if (_item.type === "profile") {
					loadMoreItem = {
						type: "profile",
						key: _item.profile.did,
						avatar: _item.profile.avatar,
						moderation: moderateProfile(_item.profile, moderationOpts!),
					};
				} else if (_item.type === "feed") {
					loadMoreItem = {
						type: "feed",
						key: _item.feed.uri,
						avatar: _item.feed.avatar,
						moderation: undefined,
					};
				}
				return loadMoreItem;
			})
			.filter((n) => !!n);
	}, [item.items, moderationOpts]);

	if (items.length === 0) return null;

	const type = items[0].type;

	return (
		<div>
			<Button
				label={"Load more"}
				onPress={item.onLoadMore}
				style={{
					position: "relative",
					width: "100%",
				}}
			>
				{({ hovered, pressed }) => (
					<div
						style={{
							flex: 1,
							flexDirection: "row",
							alignItems: "center",
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 12,
							paddingBottom: 12,
							...((hovered || pressed) && t.atoms.bg_contrast_25),
						}}
					>
						<div
							style={{
								position: "relative",

								...{
									height: 32,
									width: 32 + 15 * items.length,
								},
							}}
						>
							<div
								style={{
									alignItems: "center",
									justifyContent: "center",
									...t.atoms.bg_contrast_25,
									position: "absolute",

									...{
										width: 30,
										height: 30,
										left: 0,
										borderWidth: 1,
										backgroundColor: t.palette.primary_500,
										borderColor: t.atoms.bg.backgroundColor,
										borderRadius: type === "profile" ? 999 : 4,
										zIndex: 4,
									},
								}}
							>
								<ArrowBottom fill={t.palette.white} />
							</div>
							{items.map((_item, i) => {
								return (
									<div
										key={_item.key}
										style={{
											...t.atoms.bg_contrast_25,
											position: "absolute",

											...{
												width: 30,
												height: 30,
												left: (i + 1) * 15,
												borderWidth: 1,
												borderColor: t.atoms.bg.backgroundColor,
												borderRadius: _item.type === "profile" ? 999 : 4,
												zIndex: 3 - i,
											},
										}}
									>
										{moderationOpts &&
											(_item.type === "profile" ? (
												<UserAvatar
													size={28}
													avatar={_item.avatar}
													moderation={_item.moderation.ui("avatar")}
													type="user"
												/>
											) : _item.type === "feed" ? (
												<UserAvatar size={28} avatar={_item.avatar} type="algo" />
											) : null)}
									</div>
								);
							})}
						</div>

						<Text
							style={{
								paddingLeft: 8,
								lineHeight: 1.3,
								...(hovered ? t.atoms.text : t.atoms.text_contrast_medium),
							}}
						>
							{type === "profile" ? <>Load more suggested follows</> : <>Load more suggested feeds</>}
						</Text>

						<div
							style={{
								flex: 1,
								alignItems: "flex-end",
							}}
						>
							{item.isLoadingMore && <Loader size="lg" />}
						</div>
					</div>
				)}
			</Button>
		</div>
	);
}

type ExploreScreenItems =
	| {
			type: "header";
			key: string;
			title: string;
			description: string;
			style?: ViewStyleProp["style"];
			icon: React.ComponentType<SVGIconProps>;
	  }
	| {
			type: "trendingTopics";
			key: string;
	  }
	| {
			type: "trendingVideos";
			key: string;
	  }
	| {
			type: "recommendations";
			key: string;
	  }
	| {
			type: "profile";
			key: string;
			profile: AppBskyActorDefs.ProfileView;
			recId?: number;
	  }
	| {
			type: "feed";
			key: string;
			feed: AppBskyFeedDefs.GeneratorView;
	  }
	| {
			type: "loadMore";
			key: string;
			isLoadingMore: boolean;
			onLoadMore: () => void;
			items: ExploreScreenItems[];
	  }
	| {
			type: "profilePlaceholder";
			key: string;
	  }
	| {
			type: "feedPlaceholder";
			key: string;
	  }
	| {
			type: "error";
			key: string;
			message: string;
			error: string;
	  };

export function Explore() {
	const t = useTheme();
	const { data: preferences, error: preferencesError } = usePreferencesQuery();
	const moderationOpts = useModerationOpts();
	const {
		data: profiles,
		hasNextPage: hasNextProfilesPage,
		isLoading: isLoadingProfiles,
		isFetchingNextPage: isFetchingNextProfilesPage,
		error: profilesError,
		fetchNextPage: fetchNextProfilesPage,
	} = useSuggestedFollowsQuery({ limit: 6, subsequentPageLimit: 10 });
	const {
		data: feeds,
		hasNextPage: hasNextFeedsPage,
		isLoading: isLoadingFeeds,
		isFetchingNextPage: isFetchingNextFeedsPage,
		error: feedsError,
		fetchNextPage: fetchNextFeedsPage,
	} = useGetPopularFeedsQuery({ limit: 10 });

	const isLoadingMoreProfiles = isFetchingNextProfilesPage && !isLoadingProfiles;
	const onLoadMoreProfiles = React.useCallback(async () => {
		if (isFetchingNextProfilesPage || !hasNextProfilesPage || profilesError) return;
		try {
			await fetchNextProfilesPage();
		} catch (err) {
			console.error("Failed to load more suggested follows", { message: err });
		}
	}, [isFetchingNextProfilesPage, hasNextProfilesPage, profilesError, fetchNextProfilesPage]);

	const isLoadingMoreFeeds = isFetchingNextFeedsPage && !isLoadingFeeds;
	const onLoadMoreFeeds = React.useCallback(async () => {
		if (isFetchingNextFeedsPage || !hasNextFeedsPage || feedsError) return;
		try {
			await fetchNextFeedsPage();
		} catch (err) {
			console.error("Failed to load more suggested follows", { message: err });
		}
	}, [isFetchingNextFeedsPage, hasNextFeedsPage, feedsError, fetchNextFeedsPage]);

	const items = React.useMemo<ExploreScreenItems[]>(() => {
		const i: ExploreScreenItems[] = [];

		i.push({
			type: "trendingTopics",
			key: "trending-topics",
		});

		i.push({
			type: "recommendations",
			key: "recommendations",
		});

		i.push({
			type: "header",
			key: "suggested-follows-header",
			title: "Suggested accounts",
			description: "Follow more accounts to get connected to your interests and build your network.",
			icon: Person,
		});

		if (profiles) {
			// Currently the responses contain duplicate items.
			// Needs to be fixed on backend, but let's dedupe to be safe.
			const seen = new Set();
			const profileItems: ExploreScreenItems[] = [];
			for (const page of profiles.pages) {
				for (const actor of page.actors) {
					if (!seen.has(actor.did)) {
						seen.add(actor.did);
						profileItems.push({
							type: "profile",
							key: actor.did,
							profile: actor,
							recId: page.recId,
						});
					}
				}
			}

			if (hasNextProfilesPage) {
				// splice off 3 as previews if we have a next page
				const previews = profileItems.splice(-3);
				// push remainder
				i.push(...profileItems);
				i.push({
					type: "loadMore",
					key: "loadMoreProfiles",
					isLoadingMore: isLoadingMoreProfiles,
					onLoadMore: onLoadMoreProfiles,
					items: previews,
				});
			} else {
				i.push(...profileItems);
			}
		} else {
			if (profilesError) {
				i.push({
					type: "error",
					key: "profilesError",
					message: "Failed to load suggested follows",
					error: cleanError(profilesError),
				});
			} else {
				i.push({ type: "profilePlaceholder", key: "profilePlaceholder" });
			}
		}

		i.push({
			type: "header",
			key: "suggested-feeds-header",
			title: "Discover new feeds",
			description: "Choose your own timeline! Feeds built by the community help you find content you love.",
			style: a.pt_5xl,
			icon: ListSparkle,
		});

		if (feeds && preferences) {
			// Currently the responses contain duplicate items.
			// Needs to be fixed on backend, but let's dedupe to be safe.
			const seen = new Set();
			const feedItems: ExploreScreenItems[] = [];
			for (const page of feeds.pages) {
				for (const feed of page.feeds) {
					if (!seen.has(feed.uri)) {
						seen.add(feed.uri);
						feedItems.push({
							type: "feed",
							key: feed.uri,
							feed,
						});
					}
				}
			}

			// feeds errors can occur during pagination, so feeds is truthy
			if (feedsError) {
				i.push({
					type: "error",
					key: "feedsError",
					message: "Failed to load suggested feeds",
					error: cleanError(feedsError),
				});
			} else if (preferencesError) {
				i.push({
					type: "error",
					key: "preferencesError",
					message: "Failed to load feeds preferences",
					error: cleanError(preferencesError),
				});
			} else if (hasNextFeedsPage) {
				const preview = feedItems.splice(-3);
				i.push(...feedItems);
				i.push({
					type: "loadMore",
					key: "loadMoreFeeds",
					isLoadingMore: isLoadingMoreFeeds,
					onLoadMore: onLoadMoreFeeds,
					items: preview,
				});
			} else {
				i.push(...feedItems);
			}
		} else {
			if (feedsError) {
				i.push({
					type: "error",
					key: "feedsError",
					message: "Failed to load suggested feeds",
					error: cleanError(feedsError),
				});
			} else if (preferencesError) {
				i.push({
					type: "error",
					key: "preferencesError",
					message: "Failed to load feeds preferences",
					error: cleanError(preferencesError),
				});
			} else {
				i.push({ type: "feedPlaceholder", key: "feedPlaceholder" });
			}
		}

		return i;
	}, [
		profiles,
		feeds,
		preferences,
		onLoadMoreFeeds,
		onLoadMoreProfiles,
		isLoadingMoreProfiles,
		isLoadingMoreFeeds,
		profilesError,
		feedsError,
		preferencesError,
		hasNextProfilesPage,
		hasNextFeedsPage,
	]);

	const renderItem = React.useCallback(
		({ item, index }: { item: ExploreScreenItems; index: number }) => {
			switch (item.type) {
				case "header": {
					return (
						<SuggestedItemsHeader
							title={item.title}
							description={item.description}
							style={item.style}
							icon={item.icon}
						/>
					);
				}
				case "trendingTopics": {
					return <ExploreTrendingTopics />;
				}
				case "trendingVideos": {
					return <ExploreTrendingVideos />;
				}
				case "recommendations": {
					return <ExploreRecommendations />;
				}
				case "profile": {
					return (
						<div
							style={{
								borderBottom: "1px solid black",
								...t.atoms.border_contrast_low,
							}}
						>
							<ProfileCardWithFollowBtn profile={item.profile} noBg noBorder showKnownFollowers />
						</div>
					);
				}
				case "feed": {
					return (
						<div
							style={{
								borderBottom: "1px solid black",
								...t.atoms.border_contrast_low,
								paddingLeft: 16,
								paddingRight: 16,
								paddingTop: 16,
								paddingBottom: 16,
							}}
						>
							<FeedCard.Default view={item.feed} />
						</div>
					);
				}
				case "loadMore": {
					return <LoadMore item={item} moderationOpts={moderationOpts} />;
				}
				case "profilePlaceholder": {
					return <ProfileCardFeedLoadingPlaceholder />;
				}
				case "feedPlaceholder": {
					return <FeedFeedLoadingPlaceholder />;
				}
				case "error": {
					return (
						<div
							style={{
								borderTop: "1px solid black",
								borderTopWidth: 1,
								paddingTop: 12,
								paddingLeft: 12,
								paddingRight: 12,
								...t.atoms.border_contrast_low,
							}}
						>
							<div
								style={{
									flexDirection: "row",
									gap: 12,
									padding: 16,
									borderRadius: 8,
									...t.atoms.bg_contrast_25,
								}}
							>
								<CircleInfo size="md" fill={t.palette.negative_400} />
								<div
									style={{
										flex: 1,
										gap: 8,
									}}
								>
									<Text
										style={{
											fontWeight: "600",
											lineHeight: 1.3,
										}}
									>
										{item.message}
									</Text>
									<Text
										style={{
											fontStyle: "italic",
											lineHeight: 1.3,
											...t.atoms.text_contrast_medium,
										}}
									>
										{item.error}
									</Text>
								</div>
							</div>
						</div>
					);
				}
			}
		},
		[t, moderationOpts],
	);

	// note: actually not a screen, instead it's nested within
	// the search screen. so we don't need Layout.Screen
	return (
		<List
			data={items}
			renderItem={renderItem}
			keyExtractor={(item: any) => item.key}
			desktopFixedHeight
			contentContainerStyle={{ paddingBottom: 100 }}
			keyboardShouldPersistTaps="handled"
			keyboardDismissMode="on-drag"
		/>
	);
}
