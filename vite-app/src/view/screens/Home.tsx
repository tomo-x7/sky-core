import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useNavigate, useParams } from "react-router-dom";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import * as Layout from "#/components/Layout";
import { PROD_DEFAULT_FEED } from "#/lib/constants";
import { useSetTitle } from "#/lib/hooks/useSetTitle";
import type { HomeTabNavigatorParams, RouteParam } from "#/lib/routes/types";
import { NoFeedsPinned } from "#/screens/Home/NoFeedsPinned";
import { emitSoftReset } from "#/state/events";
import { type SavedFeedSourceInfo, usePinnedFeedsInfos } from "#/state/queries/feed";
import type { FeedDescriptor, FeedParams } from "#/state/queries/post-feed";
import { usePreferencesQuery } from "#/state/queries/preferences";
import type { UsePreferencesQueryResponse } from "#/state/queries/preferences/types";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useSelectedFeed, useSetSelectedFeed } from "#/state/shell/selected-feed";
import { FeedPage } from "#/view/com/feeds/FeedPage";
import { HomeHeader } from "#/view/com/home/HomeHeader";
import { Pager, type PagerRef, type RenderTabBarFnProps } from "#/view/com/pager/Pager";
import { CustomFeedEmptyState } from "#/view/com/posts/CustomFeedEmptyState";
import { FollowingEmptyState } from "#/view/com/posts/FollowingEmptyState";
import { FollowingEndOfFeed } from "#/view/com/posts/FollowingEndOfFeed";

export function HomeScreen() {
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const { data: preferences } = usePreferencesQuery();
	const { currentAccount } = useSession();
	const { data: pinnedFeedInfos, isLoading: isPinnedFeedsLoading } = usePinnedFeedsInfos();
	const params = useParams<RouteParam<"Home" | "Start", HomeTabNavigatorParams>>();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!currentAccount) {
			const getParams = new URLSearchParams(window.location.search);
			const splash = getParams.get("splash");
			if (splash === "true") {
				setShowLoggedOut(true);
				return;
			}
		}

		if (currentAccount && params.name === "Start" && params?.name && params?.rkey) {
			navigate(`/starter-pack/${params.name}/${params.rkey}`);
			// props.navigation.navigate("StarterPack", {
			// 	rkey: params.rkey,
			// 	name: params.name,
			// });
		}
	}, [currentAccount, params.name, params.rkey, navigate, setShowLoggedOut]);

	if (preferences && pinnedFeedInfos && !isPinnedFeedsLoading) {
		return (
			<Layout.Screen>
				<HomeScreenReady preferences={preferences} pinnedFeedInfos={pinnedFeedInfos} />
			</Layout.Screen>
		);
	} else {
		return (
			<Layout.Screen>
				<Layout.Center style={styles.loading}>
					<ActivityIndicator size="large" />
				</Layout.Center>
			</Layout.Screen>
		);
	}
}

function HomeScreenReady({
	preferences,
	pinnedFeedInfos,
}: {
	preferences: UsePreferencesQueryResponse;
	pinnedFeedInfos: SavedFeedSourceInfo[];
}) {
	const allFeeds = React.useMemo(() => pinnedFeedInfos.map((f) => f.feedDescriptor), [pinnedFeedInfos]);
	const maybeRawSelectedFeed: FeedDescriptor | undefined = useSelectedFeed() ?? allFeeds[0];
	const setSelectedFeed = useSetSelectedFeed();
	const maybeFoundIndex = allFeeds.indexOf(maybeRawSelectedFeed);
	const selectedIndex = Math.max(0, maybeFoundIndex);
	const maybeSelectedFeed: FeedDescriptor | undefined = allFeeds[selectedIndex];

	useSetTitle(pinnedFeedInfos[selectedIndex]?.displayName);

	const pagerRef = React.useRef<PagerRef>(null);
	const lastPagerReportedIndexRef = React.useRef(selectedIndex);
	React.useLayoutEffect(() => {
		// Since the pager is not a controlled component, adjust it imperatively
		// if the selected index gets out of sync with what it last reported.
		// This is supposed to only happen on the web when you use the right nav.
		if (selectedIndex !== lastPagerReportedIndexRef.current) {
			lastPagerReportedIndexRef.current = selectedIndex;
			pagerRef.current?.setPage(selectedIndex);
		}
	}, [selectedIndex]);

	const { hasSession } = useSession();
	const setMinimalShellMode = useSetMinimalShellMode();
	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onPageSelected = React.useCallback(
		(index: number) => {
			setMinimalShellMode(false);
			const maybeFeed = allFeeds[index];

			// Mutate the ref before setting state to avoid the imperative syncing effect
			// above from starting a loop on Android when swiping back and forth.
			lastPagerReportedIndexRef.current = index;
			setSelectedFeed(maybeFeed);
		},
		[setSelectedFeed, setMinimalShellMode, allFeeds],
	);

	const onPressSelected = React.useCallback(() => {
		emitSoftReset();
	}, []);

	const renderTabBar = React.useCallback(
		(props: RenderTabBarFnProps) => {
			return (
				<HomeHeader key="FEEDS_TAB_BAR" {...props} onPressSelected={onPressSelected} feeds={pinnedFeedInfos} />
			);
		},
		[onPressSelected, pinnedFeedInfos],
	);

	const renderFollowingEmptyState = React.useCallback(() => {
		return <FollowingEmptyState />;
	}, []);

	const renderCustomFeedEmptyState = React.useCallback(() => {
		return <CustomFeedEmptyState />;
	}, []);

	const homeFeedParams = React.useMemo<FeedParams>(() => {
		return {
			mergeFeedEnabled: Boolean(preferences.feedViewPrefs.lab_mergeFeedEnabled),
			mergeFeedSources: preferences.feedViewPrefs.lab_mergeFeedEnabled
				? preferences.savedFeeds.filter((f) => f.type === "feed" || f.type === "list").map((f) => f.value)
				: [],
		};
	}, [preferences]);

	return hasSession ? (
		<Pager
			key={allFeeds.join(",")}
			ref={pagerRef}
			initialPage={selectedIndex}
			onPageSelected={onPageSelected}
			renderTabBar={renderTabBar}
		>
			{pinnedFeedInfos.length ? (
				pinnedFeedInfos.map((feedInfo, index) => {
					const feed = feedInfo.feedDescriptor;
					if (feed === "following") {
						return (
							<FeedPage
								key={feed}
								isPageFocused={maybeSelectedFeed === feed}
								isPageAdjacent={Math.abs(selectedIndex - index) === 1}
								feed={feed}
								feedParams={homeFeedParams}
								renderEmptyState={renderFollowingEmptyState}
								renderEndOfFeed={FollowingEndOfFeed}
								feedInfo={feedInfo}
							/>
						);
					}
					const savedFeedConfig = feedInfo.savedFeed;
					return (
						<FeedPage
							key={feed}
							isPageFocused={maybeSelectedFeed === feed}
							isPageAdjacent={Math.abs(selectedIndex - index) === 1}
							feed={feed}
							renderEmptyState={renderCustomFeedEmptyState}
							savedFeedConfig={savedFeedConfig}
							feedInfo={feedInfo}
						/>
					);
				})
			) : (
				<NoFeedsPinned preferences={preferences} />
			)}
		</Pager>
	) : (
		<Pager onPageSelected={onPageSelected} renderTabBar={renderTabBar}>
			<FeedPage
				isPageFocused
				isPageAdjacent={false}
				feed={`feedgen|${PROD_DEFAULT_FEED("whats-hot")}`}
				renderEmptyState={renderCustomFeedEmptyState}
				feedInfo={pinnedFeedInfos[0]}
			/>
		</Pager>
	);
}

const styles = {
	loading: {
		height: "100%",
		alignContent: "center",
		justifyContent: "center",
		paddingBottom: 100,
	},
} satisfies Record<string, React.CSSProperties>;
