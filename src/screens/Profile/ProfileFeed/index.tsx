import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useRef } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useSetTitle } from "#/lib/hooks/useSetTitle";
import { ComposeIcon2 } from "#/lib/icons";
import type { RouteParam } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { s } from "#/lib/styles";
import { ProfileFeedHeader, ProfileFeedHeaderSkeleton } from "#/screens/Profile/components/ProfileFeedHeader";
import { listenSoftReset } from "#/state/events";
import { FeedFeedbackProvider, useFeedFeedback } from "#/state/feed-feedback";
import { type FeedSourceFeedInfo, useFeedSourceInfoQuery } from "#/state/queries/feed";
import type { FeedDescriptor, FeedParams } from "#/state/queries/post-feed";
import { RQKEY as FEED_RQKEY } from "#/state/queries/post-feed";
import { type UsePreferencesQueryResponse, usePreferencesQuery } from "#/state/queries/preferences";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { truncateAndInvalidate } from "#/state/queries/util";
import { useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { PostFeed } from "#/view/com/posts/PostFeed";
import { EmptyState } from "#/view/com/util/EmptyState";
import type { ListRef } from "#/view/com/util/List";
import { PostFeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { FAB } from "#/view/com/util/fab/FAB";
import { Button } from "#/view/com/util/forms/Button";
import { LoadLatestBtn } from "#/view/com/util/load-latest/LoadLatestBtn";

export function ProfileFeedScreen() {
	const { rkey, name: handleOrDid } = useParams<RouteParam<"ProfileFeed">>();
	const feedCacheKey: string | undefined = useLocation().state?.feedCacheKey;

	const feedParams: FeedParams | undefined = feedCacheKey ? ({ feedCacheKey } as FeedParams) : undefined;
	const pal = usePalette("default");

	const uri = useMemo(() => makeRecordUri(handleOrDid!, "app.bsky.feed.generator", rkey!), [rkey, handleOrDid]);
	const { error, data: resolvedUri } = useResolveUriQuery(uri);
	const navigate = useNavigate();

	const onPressBack = React.useCallback(() => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	}, [navigate]);

	if (error) {
		return (
			<Layout.Screen>
				<Layout.Content>
					<div
						style={{
							...pal.view,
							...pal.border,
							...styles.notFoundContainer,
						}}
					>
						<Text
							type="title-lg"
							style={{
								...pal.text,
								...s.mb10,
							}}
						>
							Could not load feed
						</Text>
						<Text
							type="md"
							style={{
								...pal.text,
								...s.mb20,
							}}
						>
							{error.toString()}
						</Text>

						<div style={{ flexDirection: "row" }}>
							<Button
								type="default"
								accessibilityLabel={"Go back"}
								accessibilityHint={"Returns to previous page"}
								onPress={onPressBack}
								style={{ flexShrink: 1 }}
							>
								<Text type="button" style={pal.text}>
									Go Back
								</Text>
							</Button>
						</div>
					</div>
				</Layout.Content>
			</Layout.Screen>
		);
	}

	return resolvedUri ? (
		<Layout.Screen>
			<ProfileFeedScreenIntermediate feedUri={resolvedUri.uri} feedParams={feedParams} />
		</Layout.Screen>
	) : (
		<Layout.Screen>
			<ProfileFeedHeaderSkeleton />
			<Layout.Content>
				<PostFeedLoadingPlaceholder />
			</Layout.Content>
		</Layout.Screen>
	);
}

function ProfileFeedScreenIntermediate({
	feedUri,
	feedParams,
}: {
	feedUri: string;
	feedParams: FeedParams | undefined;
}) {
	const { data: preferences } = usePreferencesQuery();
	const { data: info } = useFeedSourceInfoQuery({ uri: feedUri });

	if (!preferences || !info) {
		return (
			<Layout.Content>
				<ProfileFeedHeaderSkeleton />
				<PostFeedLoadingPlaceholder />
			</Layout.Content>
		);
	}

	return (
		<ProfileFeedScreenInner
			preferences={preferences}
			feedInfo={info as FeedSourceFeedInfo}
			feedParams={feedParams}
		/>
	);
}

function ProfileFeedScreenInner({
	feedInfo,
	feedParams,
}: {
	preferences: UsePreferencesQueryResponse;
	feedInfo: FeedSourceFeedInfo;
	feedParams: FeedParams | undefined;
}) {
	const { hasSession } = useSession();
	const { openComposer } = useComposerControls();
	const isScreenFocused = true; //useIsFocused();

	useSetTitle(feedInfo?.displayName);

	const feed = `feedgen|${feedInfo.uri}` as FeedDescriptor;

	const [hasNew, setHasNew] = React.useState(false);
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const queryClient = useQueryClient();
	const feedFeedback = useFeedFeedback(feed, hasSession);
	const scrollElRef = useRef(null) as ListRef;

	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: 0, // -headerHeight,
		});
		truncateAndInvalidate(queryClient, FEED_RQKEY(feed));
		setHasNew(false);
	}, [scrollElRef, queryClient, feed]);

	React.useEffect(() => {
		if (!isScreenFocused) {
			return;
		}
		return listenSoftReset(onScrollToTop);
	}, [onScrollToTop]);

	const renderPostsEmpty = useCallback(() => {
		return <EmptyState icon="hashtag" message={"This feed is empty."} />;
	}, []);

	const isVideoFeed = false;

	return (
		<>
			<ProfileFeedHeader info={feedInfo} />

			<FeedFeedbackProvider value={feedFeedback}>
				<PostFeed
					feed={feed}
					feedParams={feedParams}
					pollInterval={60e3}
					disablePoll={hasNew}
					onHasNew={setHasNew}
					scrollElRef={scrollElRef}
					onScrolledDownChange={setIsScrolledDown}
					renderEmptyState={renderPostsEmpty}
					isVideoFeed={isVideoFeed}
				/>
			</FeedFeedbackProvider>

			{(isScrolledDown || hasNew) && (
				<LoadLatestBtn onPress={onScrollToTop} label={"Load new posts"} showIndicator={hasNew} />
			)}

			{hasSession && (
				<FAB
					onPress={() => openComposer({})}
					icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={{ color: "white" }} />}
				/>
			)}
		</>
	);
}

const styles = {
	btn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		padding: "7px 14px",
		borderRadius: 50,
		marginLeft: 6,
	},
	notFoundContainer: {
		margin: 10,
		padding: "14px 18px",
		borderRadius: 6,
	},
	aboutSectionContainer: {
		padding: "4px 16px",
		gap: 12,
	},
} satisfies Record<string, React.CSSProperties>;
