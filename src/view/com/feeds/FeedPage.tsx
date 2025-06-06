import type { AppBskyActorDefs } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { type JSX } from "react";

import { useHeaderOffset } from "#/components/hooks/useHeaderOffset";
import { ComposeIcon2 } from "#/lib/icons";
import { s } from "#/lib/styles";
import { listenSoftReset } from "#/state/events";
import { FeedFeedbackProvider, useFeedFeedback } from "#/state/feed-feedback";
import { useSetHomeBadge } from "#/state/home-badge";
import type { SavedFeedSourceInfo } from "#/state/queries/feed";
import { RQKEY as FEED_RQKEY } from "#/state/queries/post-feed";
import type { FeedDescriptor, FeedParams } from "#/state/queries/post-feed";
import { truncateAndInvalidate } from "#/state/queries/util";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { useComposerControls } from "#/state/shell/composer";
import { PostFeed } from "../posts/PostFeed";
import type { ListMethods } from "../util/List";
import { MainScrollProvider } from "../util/MainScrollProvider";
import { FAB } from "../util/fab/FAB";
import { LoadLatestBtn } from "../util/load-latest/LoadLatestBtn";

const POLL_FREQ = 60e3; // 60sec

export function FeedPage({
	isPageFocused,
	isPageAdjacent,
	feed,
	feedParams,
	renderEmptyState,
	renderEndOfFeed,
	savedFeedConfig,
	feedInfo,
}: {
	feed: FeedDescriptor;
	feedParams?: FeedParams;
	isPageFocused: boolean;
	isPageAdjacent: boolean;
	renderEmptyState: () => JSX.Element;
	renderEndOfFeed?: () => JSX.Element;
	savedFeedConfig?: AppBskyActorDefs.SavedFeed;
	feedInfo: SavedFeedSourceInfo;
}) {
	const { hasSession } = useSession();
	// const navigation = useNavigation<NavigationProp<AllNavigatorParams>>();
	const queryClient = useQueryClient();
	const { openComposer } = useComposerControls();
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const setMinimalShellMode = useSetMinimalShellMode();
	const headerOffset = useHeaderOffset();
	const feedFeedback = useFeedFeedback(feed, hasSession);
	const scrollElRef = React.useRef<ListMethods>(null);
	const [hasNew, setHasNew] = React.useState(false);
	const setHomeBadge = useSetHomeBadge();
	const isVideoFeed = false;

	React.useEffect(() => {
		if (isPageFocused) {
			setHomeBadge(hasNew);
		}
	}, [isPageFocused, hasNew, setHomeBadge]);

	const scrollToTop = React.useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerOffset,
		});
		setMinimalShellMode(false);
	}, [headerOffset, setMinimalShellMode]);

	const onSoftReset = React.useCallback(() => {
		// const isScreenFocused = getTabState(getRootNavigation(navigation).getState(), "Home") === TabState.InsideAtRoot;
		// if (isScreenFocused && isPageFocused) {
		scrollToTop();
		truncateAndInvalidate(queryClient, FEED_RQKEY(feed));
		setHasNew(false);
		// }
	}, [scrollToTop, queryClient, feed]);

	// fires when page within screen is activated/deactivated
	React.useEffect(() => {
		if (!isPageFocused) {
			return;
		}
		return listenSoftReset(onSoftReset);
	}, [onSoftReset, isPageFocused]);

	const onPressCompose = React.useCallback(() => {
		openComposer({});
	}, [openComposer]);

	const onPressLoadLatest = React.useCallback(() => {
		scrollToTop();
		truncateAndInvalidate(queryClient, FEED_RQKEY(feed));
		setHasNew(false);
	}, [scrollToTop, feed, queryClient]);

	const shouldPrefetch = false;
	return (
		<div>
			<MainScrollProvider>
				<FeedFeedbackProvider value={feedFeedback}>
					<PostFeed
						enabled={isPageFocused || shouldPrefetch}
						feed={feed}
						feedParams={feedParams}
						pollInterval={POLL_FREQ}
						disablePoll={hasNew || !isPageFocused}
						scrollElRef={scrollElRef}
						onScrolledDownChange={setIsScrolledDown}
						onHasNew={setHasNew}
						renderEmptyState={renderEmptyState}
						renderEndOfFeed={renderEndOfFeed}
						headerOffset={headerOffset}
						savedFeedConfig={savedFeedConfig}
						isVideoFeed={isVideoFeed}
					/>
				</FeedFeedbackProvider>
			</MainScrollProvider>
			{(isScrolledDown || hasNew) && (
				<LoadLatestBtn onPress={onPressLoadLatest} label={"Load new posts"} showIndicator={hasNew} />
			)}

			{hasSession && (
				<FAB onPress={onPressCompose} icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />} />
			)}
		</div>
	);
}
