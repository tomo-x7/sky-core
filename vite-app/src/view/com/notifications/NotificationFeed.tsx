import React, { type JSX } from "react";
import { ActivityIndicator, type ListRenderItemInfo } from "react-native";

import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { s } from "#/lib/styles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useNotificationFeedQuery } from "#/state/queries/notifications/feed";
import { EmptyState } from "#/view/com/util/EmptyState";
import { List, type ListRef } from "#/view/com/util/List";
import { LoadMoreRetryBtn } from "#/view/com/util/LoadMoreRetryBtn";
import { NotificationFeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";
import { NotificationFeedItem } from "./NotificationFeedItem";

const EMPTY_FEED_ITEM = { _reactKey: "__empty__" };
const LOAD_MORE_ERROR_ITEM = { _reactKey: "__load_more_error__" };
const LOADING_ITEM = { _reactKey: "__loading__" };

export function NotificationFeed({
	filter,
	enabled,
	scrollElRef,
	onPressTryAgain,
	onScrolledDownChange,
	ListHeaderComponent,
	refreshNotifications,
}: {
	filter: "all" | "mentions";
	enabled: boolean;
	scrollElRef?: ListRef;
	onPressTryAgain?: () => void;
	onScrolledDownChange: (isScrolledDown: boolean) => void;
	ListHeaderComponent?: () => JSX.Element;
	refreshNotifications: () => Promise<void>;
}) {
	const initialNumToRender = useInitialNumToRender();
	const [isPTRing, setIsPTRing] = React.useState(false);
	const moderationOpts = useModerationOpts();
	const { data, isFetching, isFetched, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useNotificationFeedQuery({
			enabled: enabled && !!moderationOpts,
			filter,
		});
	const isEmpty = !isFetching && !data?.pages[0]?.items.length;

	const items = React.useMemo(() => {
		let arr: any[] = [];
		if (isFetched) {
			if (isEmpty) {
				arr = arr.concat([EMPTY_FEED_ITEM]);
			} else if (data) {
				for (const page of data.pages) {
					arr = arr.concat(page.items);
				}
			}
			if (isError && !isEmpty) {
				arr = arr.concat([LOAD_MORE_ERROR_ITEM]);
			}
		} else {
			arr.push(LOADING_ITEM);
		}
		return arr;
	}, [isFetched, isError, isEmpty, data]);

	const onRefresh = React.useCallback(async () => {
		try {
			setIsPTRing(true);
			await refreshNotifications();
		} catch (err) {
			console.error("Failed to refresh notifications feed", {
				message: err,
			});
		} finally {
			setIsPTRing(false);
		}
	}, [refreshNotifications]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;

		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more notifications", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const onPressRetryLoadMore = React.useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	const renderItem = React.useCallback(
		({ item, index }: ListRenderItemInfo<any>) => {
			if (item === EMPTY_FEED_ITEM) {
				return <EmptyState icon="bell" message={"No notifications yet!"} style={styles.emptyState} />;
			} else if (item === LOAD_MORE_ERROR_ITEM) {
				return (
					<LoadMoreRetryBtn
						label={"There was an issue fetching notifications. Tap here to try again."}
						onPress={onPressRetryLoadMore}
					/>
				);
			} else if (item === LOADING_ITEM) {
				return <NotificationFeedLoadingPlaceholder />;
			}
			return (
				<NotificationFeedItem
					highlightUnread={filter === "all"}
					item={item}
					moderationOpts={moderationOpts!}
					hideTopBorder={index === 0}
				/>
			);
		},
		[moderationOpts, onPressRetryLoadMore, filter],
	);

	const FeedFooter = React.useCallback(
		() =>
			isFetchingNextPage ? (
				<div style={styles.feedFooter}>
					<ActivityIndicator />
				</div>
			) : (
				<div />
			),
		[isFetchingNextPage],
	);

	return (
		<div style={s.hContentRegion}>
			{error && <ErrorMessage message={cleanError(error)} onPressTryAgain={onPressTryAgain} />}
			<List
				ref={scrollElRef}
				data={items}
				keyExtractor={(item) => item._reactKey}
				renderItem={renderItem}
				ListHeaderComponent={ListHeaderComponent}
				ListFooterComponent={FeedFooter}
				refreshing={isPTRing}
				onRefresh={onRefresh}
				onEndReached={onEndReached}
				onEndReachedThreshold={2}
				onScrolledDownChange={onScrolledDownChange}
				contentContainerStyle={s.contentContainer}
				desktopFixedHeight
				initialNumToRender={initialNumToRender}
				windowSize={11}
				sideBorders={false}
				removeClippedSubviews={true}
			/>
		</div>
	);
}

const styles = {
	feedFooter: { paddingTop: 20 },
	emptyState: { paddingTop: 40, paddingBottom: 40 },
} satisfies Record<string, React.CSSProperties>;
