import type { AppBskyFeedDefs } from "@atproto/api";
import debounce from "lodash.debounce";
import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { atoms as a, flatten, useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { ButtonIcon } from "#/components/Button";
import { Divider } from "#/components/Divider";
import * as FeedCard from "#/components/FeedCard";
import { IconCircle } from "#/components/IconCircle";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import * as ListCard from "#/components/ListCard";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "#/components/icons/Chevron";
import { FilterTimeline_Stroke2_Corner0_Rounded as FilterTimeline } from "#/components/icons/FilterTimeline";
import { ListMagnifyingGlass_Stroke2_Corner0_Rounded } from "#/components/icons/ListMagnifyingGlass";
import { ListSparkle_Stroke2_Corner0_Rounded } from "#/components/icons/ListSparkle";
import { SettingsGear2_Stroke2_Corner0_Rounded as Gear } from "#/components/icons/SettingsGear2";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { ComposeIcon2 } from "#/lib/icons";
import { cleanError } from "#/lib/strings/errors";
import { s } from "#/lib/styles";
import { NoFollowingFeed } from "#/screens/Feeds/NoFollowingFeed";
import { NoSavedFeedsOfAnyType } from "#/screens/Feeds/NoSavedFeedsOfAnyType";
import {
	type SavedFeedItem,
	useGetPopularFeedsQuery,
	useSavedFeeds,
	useSearchPopularFeedsMutation,
} from "#/state/queries/feed";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { useComposerControls } from "#/state/shell/composer";
import { List, type ListMethods } from "#/view/com/util/List";
import { FeedFeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";
import { FAB } from "#/view/com/util/fab/FAB";

type FlatlistSlice =
	| {
			type: "error";
			key: string;
			error: string;
	  }
	| {
			type: "savedFeedsHeader";
			key: string;
	  }
	| {
			type: "savedFeedPlaceholder";
			key: string;
	  }
	| {
			type: "savedFeedNoResults";
			key: string;
	  }
	| {
			type: "savedFeed";
			key: string;
			savedFeed: SavedFeedItem;
	  }
	| {
			type: "savedFeedsLoadMore";
			key: string;
	  }
	| {
			type: "popularFeedsHeader";
			key: string;
	  }
	| {
			type: "popularFeedsLoading";
			key: string;
	  }
	| {
			type: "popularFeedsNoResults";
			key: string;
	  }
	| {
			type: "popularFeed";
			key: string;
			feedUri: string;
			feed: AppBskyFeedDefs.GeneratorView;
	  }
	| {
			type: "popularFeedsLoadingMore";
			key: string;
	  }
	| {
			type: "noFollowingFeed";
			key: string;
	  };

export function FeedsScreen() {
	const pal = usePalette("default");
	const { openComposer } = useComposerControls();
	const { isMobile } = useWebMediaQueries();
	const [query, setQuery] = React.useState("");
	const [isPTR, setIsPTR] = React.useState(false);
	const {
		data: savedFeeds,
		isPlaceholderData: isSavedFeedsPlaceholder,
		error: savedFeedsError,
		refetch: refetchSavedFeeds,
	} = useSavedFeeds();
	const {
		data: popularFeeds,
		isFetching: isPopularFeedsFetching,
		error: popularFeedsError,
		refetch: refetchPopularFeeds,
		fetchNextPage: fetchNextPopularFeedsPage,
		isFetchingNextPage: isPopularFeedsFetchingNextPage,
		hasNextPage: hasNextPopularFeedsPage,
	} = useGetPopularFeedsQuery();
	const setMinimalShellMode = useSetMinimalShellMode();
	const {
		data: searchResults,
		mutate: search,
		reset: resetSearch,
		isPending: isSearchPending,
		error: searchError,
	} = useSearchPopularFeedsMutation();
	const { hasSession } = useSession();
	const listRef = React.useRef<ListMethods>(null);

	/**
	 * A search query is present. We may not have search results yet.
	 */
	const isUserSearching = query.length > 1;
	const debouncedSearch = React.useMemo(
		() => debounce((q) => search(q), 500), // debounce for 500ms
		[search],
	);
	const onPressCompose = React.useCallback(() => {
		openComposer({});
	}, [openComposer]);
	const onChangeQuery = React.useCallback(
		(text: string) => {
			setQuery(text);
			if (text.length > 1) {
				debouncedSearch(text);
			} else {
				refetchPopularFeeds();
				resetSearch();
			}
		},
		[refetchPopularFeeds, debouncedSearch, resetSearch],
	);
	const onPressCancelSearch = React.useCallback(() => {
		setQuery("");
		refetchPopularFeeds();
		resetSearch();
	}, [refetchPopularFeeds, resetSearch]);
	const onSubmitQuery = React.useCallback(() => {
		debouncedSearch(query);
	}, [query, debouncedSearch]);
	const onPullToRefresh = React.useCallback(async () => {
		setIsPTR(true);
		await Promise.all([
			refetchSavedFeeds().catch((_e) => undefined),
			refetchPopularFeeds().catch((_e) => undefined),
		]);
		setIsPTR(false);
	}, [refetchSavedFeeds, refetchPopularFeeds]);
	const onEndReached = React.useCallback(() => {
		if (isPopularFeedsFetching || isUserSearching || !hasNextPopularFeedsPage || popularFeedsError) return;
		fetchNextPopularFeedsPage();
	}, [
		isPopularFeedsFetching,
		isUserSearching,
		popularFeedsError,
		hasNextPopularFeedsPage,
		fetchNextPopularFeedsPage,
	]);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const items = React.useMemo(() => {
		let slices: FlatlistSlice[] = [];
		const hasActualSavedCount =
			!isSavedFeedsPlaceholder || (isSavedFeedsPlaceholder && (savedFeeds?.count || 0) > 0);
		const canShowDiscoverSection = !hasSession || (hasSession && hasActualSavedCount);

		if (hasSession) {
			slices.push({
				key: "savedFeedsHeader",
				type: "savedFeedsHeader",
			});

			if (savedFeedsError) {
				slices.push({
					key: "savedFeedsError",
					type: "error",
					error: cleanError(savedFeedsError.toString()),
				});
			} else {
				if (isSavedFeedsPlaceholder && !savedFeeds?.feeds.length) {
					/*
					 * Initial render in placeholder state is 0 on a cold page load,
					 * because preferences haven't loaded yet.
					 *
					 * In practice, `savedFeeds` is always defined, but we check for TS
					 * and for safety.
					 *
					 * In both cases, we show 4 as the the loading state.
					 */
					const min = 8;
					const count = savedFeeds ? (savedFeeds.count === 0 ? min : savedFeeds.count) : min;
					Array(count)
						.fill(0)
						.forEach((_, i) => {
							slices.push({
								key: `savedFeedPlaceholder${i}`,
								type: "savedFeedPlaceholder",
							});
						});
				} else {
					if (savedFeeds?.feeds?.length) {
						const noFollowingFeed = savedFeeds.feeds.every((f) => f.type !== "timeline");

						slices = slices.concat(
							savedFeeds.feeds
								.filter((s) => {
									return s.config.pinned;
								})
								.map((s) => ({
									key: `savedFeed:${s.view?.uri}:${s.config.id}`,
									type: "savedFeed",
									savedFeed: s,
								})),
						);
						slices = slices.concat(
							savedFeeds.feeds
								.filter((s) => {
									return !s.config.pinned;
								})
								.map((s) => ({
									key: `savedFeed:${s.view?.uri}:${s.config.id}`,
									type: "savedFeed",
									savedFeed: s,
								})),
						);

						if (noFollowingFeed) {
							slices.push({
								key: "noFollowingFeed",
								type: "noFollowingFeed",
							});
						}
					} else {
						slices.push({
							key: "savedFeedNoResults",
							type: "savedFeedNoResults",
						});
					}
				}
			}
		}

		if (!hasSession || (hasSession && canShowDiscoverSection)) {
			slices.push({
				key: "popularFeedsHeader",
				type: "popularFeedsHeader",
			});

			if (popularFeedsError || searchError) {
				slices.push({
					key: "popularFeedsError",
					type: "error",
					error: cleanError(popularFeedsError?.toString() ?? searchError?.toString() ?? ""),
				});
			} else {
				if (isUserSearching) {
					if (isSearchPending || !searchResults) {
						slices.push({
							key: "popularFeedsLoading",
							type: "popularFeedsLoading",
						});
					} else {
						if (!searchResults || searchResults?.length === 0) {
							slices.push({
								key: "popularFeedsNoResults",
								type: "popularFeedsNoResults",
							});
						} else {
							slices = slices.concat(
								searchResults.map((feed) => ({
									key: `popularFeed:${feed.uri}`,
									type: "popularFeed",
									feedUri: feed.uri,
									feed,
								})),
							);
						}
					}
				} else {
					if (isPopularFeedsFetching && !popularFeeds?.pages) {
						slices.push({
							key: "popularFeedsLoading",
							type: "popularFeedsLoading",
						});
					} else {
						if (!popularFeeds?.pages) {
							slices.push({
								key: "popularFeedsNoResults",
								type: "popularFeedsNoResults",
							});
						} else {
							for (const page of popularFeeds.pages || []) {
								slices = slices.concat(
									page.feeds.map((feed) => ({
										key: `popularFeed:${feed.uri}`,
										type: "popularFeed",
										feedUri: feed.uri,
										feed,
									})),
								);
							}

							if (isPopularFeedsFetchingNextPage) {
								slices.push({
									key: "popularFeedsLoadingMore",
									type: "popularFeedsLoadingMore",
								});
							}
						}
					}
				}
			}
		}

		return slices;
	}, [
		hasSession,
		savedFeeds,
		isSavedFeedsPlaceholder,
		savedFeedsError,
		popularFeeds,
		isPopularFeedsFetching,
		popularFeedsError,
		isPopularFeedsFetchingNextPage,
		searchResults,
		isSearchPending,
		searchError,
		isUserSearching,
	]);

	const searchBarIndex = items.findIndex((item) => item.type === "popularFeedsHeader");

	const onChangeSearchFocus = React.useCallback(
		(focus: boolean) => {
			if (focus && searchBarIndex > -1) {
				// web implementation only supports scrollToOffset
				// thus, we calculate the offset based on the index
				// pixel values are estimates, I wasn't able to get it pixel perfect :(
				const headerHeight = isMobile ? 43 : 53;
				const feedItemHeight = isMobile ? 49 : 58;
				listRef.current?.scrollToOffset({
					offset: searchBarIndex * feedItemHeight - headerHeight,
					animated: true,
				});
			}
		},
		[searchBarIndex, isMobile],
	);

	const renderItem = React.useCallback(
		({ item }: { item: FlatlistSlice }) => {
			if (item.type === "error") {
				return <ErrorMessage message={item.error} />;
			} else if (item.type === "popularFeedsLoadingMore") {
				return (
					<div style={s.p10}>
						<ActivityIndicator size="large" />
					</div>
				);
			} else if (item.type === "savedFeedsHeader") {
				return <FeedsSavedHeader />;
			} else if (item.type === "savedFeedNoResults") {
				return (
					<div
						style={{
							...pal.border,

							...{
								borderBottomWidth: 1,
							},
						}}
					>
						<NoSavedFeedsOfAnyType />
					</div>
				);
			} else if (item.type === "savedFeedPlaceholder") {
				return <SavedFeedPlaceholder />;
			} else if (item.type === "savedFeed") {
				return <FeedOrFollowing savedFeed={item.savedFeed} />;
			} else if (item.type === "popularFeedsHeader") {
				return (
					<>
						<FeedsAboutHeader />
						<div style={{ paddingBottom: 4, paddingLeft: 12, paddingRight: 12 }}>
							<SearchInput
								placeholder={"Search feeds"}
								value={query}
								onChangeText={onChangeQuery}
								onClearText={onPressCancelSearch}
								onSubmitEditing={onSubmitQuery}
								onFocus={() => onChangeSearchFocus(true)}
								onBlur={() => onChangeSearchFocus(false)}
							/>
						</div>
					</>
				);
			} else if (item.type === "popularFeedsLoading") {
				return <FeedFeedLoadingPlaceholder />;
			} else if (item.type === "popularFeed") {
				return (
					<div
						style={{
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 16,
							gap: 16,
						}}
					>
						<FeedCard.Default view={item.feed} />
						<Divider />
					</div>
				);
			} else if (item.type === "popularFeedsNoResults") {
				return (
					<div
						style={{
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 10,
							paddingBottom: "150%",
						}}
					>
						<Text type="lg" style={pal.textLight}>
							<>No results found for "{query}"</>
						</Text>
					</div>
				);
			} else if (item.type === "noFollowingFeed") {
				return (
					<div
						style={{
							...pal.border,

							...{
								borderBottomWidth: 1,
							},
						}}
					>
						<NoFollowingFeed />
					</div>
				);
			}
			return null;
		},
		[pal.border, pal.textLight, query, onChangeQuery, onPressCancelSearch, onSubmitQuery, onChangeSearchFocus],
	);

	return (
		<Layout.Screen>
			<Layout.Center>
				<Layout.Header.Outer>
					<Layout.Header.BackButton />
					<Layout.Header.Content>
						<Layout.Header.TitleText>Feeds</Layout.Header.TitleText>
					</Layout.Header.Content>
					<Layout.Header.Slot>
						<Link
							to="/settings/saved-feeds"
							label={"Edit My Feeds"}
							size="small"
							variant="ghost"
							color="secondary"
							shape="round"
							style={{
								justifyContent: "center",
								...{ right: -3 },
							}}
						>
							<ButtonIcon icon={Gear} size="lg" />
						</Link>
					</Layout.Header.Slot>
				</Layout.Header.Outer>

				<List
					ref={listRef}
					data={items}
					keyExtractor={(item: any) => item.key}
					contentContainerStyle={styles.contentContainer}
					renderItem={renderItem}
					refreshing={isPTR}
					onRefresh={isUserSearching ? undefined : onPullToRefresh}
					initialNumToRender={10}
					onEndReached={onEndReached}
					desktopFixedHeight
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="on-drag"
					sideBorders={false}
				/>
			</Layout.Center>
			{hasSession && (
				<FAB onPress={onPressCompose} icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />} />
			)}
		</Layout.Screen>
	);
}

function FeedOrFollowing({ savedFeed }: { savedFeed: SavedFeedItem }) {
	return savedFeed.type === "timeline" ? <FollowingFeed /> : <SavedFeed savedFeed={savedFeed} />;
}

function FollowingFeed() {
	const t = useTheme();
	return (
		<div
			style={{
				flex: 1,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 12,
				paddingBottom: 12,
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
			}}
		>
			<FeedCard.Header>
				<div
					style={{
						alignItems: "center",
						justifyContent: "center",

						...{
							width: 28,
							height: 28,
							borderRadius: 3,
							backgroundColor: t.palette.primary_500,
						},
					}}
				>
					<FilterTimeline
						style={{
							width: 18,
							height: 18,
						}}
						fill={t.palette.white}
					/>
				</div>
				<FeedCard.TitleAndByline title={"Following"} />
			</FeedCard.Header>
		</div>
	);
}

function SavedFeed({
	savedFeed,
}: {
	savedFeed: SavedFeedItem & { type: "feed" | "list" };
}) {
	const t = useTheme();

	const commonStyle = flatten([a.w_full, a.flex_1, a.px_lg, a.py_md, a.border_b, t.atoms.border_contrast_low]);

	return savedFeed.type === "feed" ? (
		<FeedCard.Link {...savedFeed}>
			{({ hovered, pressed }) => (
				<div
					style={{
						...commonStyle,
						...((hovered || pressed) && t.atoms.bg_contrast_25),
					}}
				>
					<FeedCard.Header>
						<FeedCard.Avatar src={savedFeed.view.avatar} size={28} />
						<FeedCard.TitleAndByline title={savedFeed.view.displayName} />

						<ChevronRight size="sm" fill={t.atoms.text_contrast_low.color} />
					</FeedCard.Header>
				</div>
			)}
		</FeedCard.Link>
	) : (
		<ListCard.Link {...savedFeed}>
			{({ hovered, pressed }) => (
				<div
					style={{
						...commonStyle,
						...((hovered || pressed) && t.atoms.bg_contrast_25),
					}}
				>
					<ListCard.Header>
						<ListCard.Avatar src={savedFeed.view.avatar} size={28} />
						<ListCard.TitleAndByline title={savedFeed.view.name} />

						<ChevronRight size="sm" fill={t.atoms.text_contrast_low.color} />
					</ListCard.Header>
				</div>
			)}
		</ListCard.Link>
	);
}

function SavedFeedPlaceholder() {
	const t = useTheme();
	return (
		<div
			style={{
				flex: 1,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 12,
				paddingBottom: 12,
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
			}}
		>
			<FeedCard.Header>
				<FeedCard.AvatarPlaceholder size={28} />
				<FeedCard.TitleAndBylinePlaceholder />
			</FeedCard.Header>
		</div>
	);
}

function FeedsSavedHeader() {
	const t = useTheme();

	return (
		<div
			style={{
				flexDirection: "row",
				paddingLeft: 12,
				paddingRight: 12,
				paddingTop: 16,
				paddingBottom: 16,
				gap: 12,
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
			}}
		>
			<IconCircle icon={ListSparkle_Stroke2_Corner0_Rounded} size="lg" />
			<div
				style={{
					flex: 1,
					gap: 4,
				}}
			>
				<Text
					style={{
						flex: 1,
						fontSize: 22,
						letterSpacing: 0,
						fontWeight: "800",
						...t.atoms.text,
					}}
				>
					My Feeds
				</Text>
				<Text style={t.atoms.text_contrast_high}>All the feeds you've saved, right in one place.</Text>
			</div>
		</div>
	);
}

function FeedsAboutHeader() {
	const t = useTheme();

	return (
		<div
			style={{
				flexDirection: "row",
				paddingLeft: 12,
				paddingRight: 12,
				paddingTop: 16,
				paddingBottom: 16,
				gap: 12,
			}}
		>
			<IconCircle icon={ListMagnifyingGlass_Stroke2_Corner0_Rounded} size="lg" />
			<div
				style={{
					flex: 1,
					gap: 8,
				}}
			>
				<Text
					style={{
						flex: 1,
						fontSize: 22,
						letterSpacing: 0,
						fontWeight: "800",
						...t.atoms.text,
					}}
				>
					Discover New Feeds
				</Text>
				<Text style={t.atoms.text_contrast_high}>
					Choose your own timeline! Feeds built by the community help you find content you love.
				</Text>
			</div>
		</div>
	);
}

const styles = {
	contentContainer: {
		paddingBottom: 100,
	},

	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 16,
		padding: "12px 18px",
	},

	savedFeed: {
		flexDirection: "row",
		alignItems: "center",
		padding: "14px 16px",
		gap: 12,
		borderBottomWidth: 1,
	},
	savedFeedMobile: { paddingTop: 10, paddingBottom: 10 },
	offlineSlug: {
		borderWidth: 1,
		borderRadius: 4,
		padding: "2px 4px",
	},
	headerBtnGroup: {
		flexDirection: "row",
		gap: 15,
		alignItems: "center",
	},
} satisfies Record<string, React.CSSProperties>;
