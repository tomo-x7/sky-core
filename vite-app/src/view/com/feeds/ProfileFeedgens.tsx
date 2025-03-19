import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, type ListRenderItemInfo, findNodeHandle } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import * as FeedCard from "#/components/FeedCard";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { cleanError } from "#/lib/strings/errors";
import { usePreferencesQuery } from "#/state/queries/preferences";
import { RQKEY, useProfileFeedgensQuery } from "#/state/queries/profile-feedgens";
import { EmptyState } from "#/view/com/util/EmptyState";
import { FeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { List, type ListRef } from "../util/List";
import { LoadMoreRetryBtn } from "../util/LoadMoreRetryBtn";
import { ErrorMessage } from "../util/error/ErrorMessage";

const LOADING = { _reactKey: "__loading__" };
const EMPTY = { _reactKey: "__empty__" };
const ERROR_ITEM = { _reactKey: "__error__" };
const LOAD_MORE_ERROR_ITEM = { _reactKey: "__load_more_error__" };

interface SectionRef {
	scrollToTop: () => void;
}

interface ProfileFeedgensProps {
	did: string;
	scrollElRef: ListRef;
	headerOffset: number;
	enabled?: boolean;
	style?: React.CSSProperties;
	setScrollViewTag: (tag: number | null) => void;
}

export const ProfileFeedgens = React.forwardRef<SectionRef, ProfileFeedgensProps>(function ProfileFeedgensImpl(
	{ did, scrollElRef, headerOffset, enabled, style, setScrollViewTag },
	ref,
) {
	const t = useTheme();
	const [isPTRing, setIsPTRing] = React.useState(false);
	const opts = React.useMemo(() => ({ enabled }), [enabled]);
	const { data, isFetching, isFetched, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error, refetch } =
		useProfileFeedgensQuery(did, opts);
	const isEmpty = !isFetching && !data?.pages[0]?.feeds.length;
	const { data: preferences } = usePreferencesQuery();
	const { isMobile } = useWebMediaQueries();

	const items = React.useMemo(() => {
		let items: any[] = [];
		if (isError && isEmpty) {
			items = items.concat([ERROR_ITEM]);
		}
		if (!isFetched || isFetching) {
			items = items.concat([LOADING]);
		} else if (isEmpty) {
			items = items.concat([EMPTY]);
		} else if (data?.pages) {
			for (const page of data.pages) {
				items = items.concat(page.feeds);
			}
		} else if (isError && !isEmpty) {
			items = items.concat([LOAD_MORE_ERROR_ITEM]);
		}
		return items;
	}, [isError, isEmpty, isFetched, isFetching, data]);

	// events
	// =

	const queryClient = useQueryClient();

	const onScrollToTop = React.useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerOffset,
		});
		queryClient.invalidateQueries({ queryKey: RQKEY(did) });
	}, [scrollElRef, queryClient, headerOffset, did]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh feeds", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;

		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more feeds", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const onPressRetryLoadMore = React.useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	// rendering
	// =

	const renderItem = React.useCallback(
		({ item, index }: ListRenderItemInfo<any>) => {
			if (item === EMPTY) {
				return <EmptyState icon="hashtag" message={"You have no feeds."} />;
			} else if (item === ERROR_ITEM) {
				return <ErrorMessage message={cleanError(error)} onPressTryAgain={refetch} />;
			} else if (item === LOAD_MORE_ERROR_ITEM) {
				return (
					<LoadMoreRetryBtn
						label={"There was an issue fetching your lists. Tap here to try again."}
						onPress={onPressRetryLoadMore}
					/>
				);
			} else if (item === LOADING) {
				return <FeedLoadingPlaceholder />;
			}
			if (preferences) {
				return (
					<div
						style={{
							...a.border_t,
							...t.atoms.border_contrast_low,
							...a.px_lg,
							...a.py_lg,
						}}
					>
						<FeedCard.Default view={item} />
					</div>
				);
			}
			return null;
		},
		[t, error, refetch, onPressRetryLoadMore, preferences],
	);

	React.useEffect(() => {
		if (enabled && scrollElRef.current) {
			const nativeTag = findNodeHandle(scrollElRef.current);
			setScrollViewTag(nativeTag);
		}
	}, [enabled, scrollElRef, setScrollViewTag]);

	const ProfileFeedgensFooter = React.useCallback(() => {
		return isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null;
	}, [isFetchingNextPage]);

	return (
		<div style={style}>
			<List
				ref={scrollElRef}
				data={items}
				keyExtractor={(item: any) => item._reactKey || item.uri}
				renderItem={renderItem}
				ListFooterComponent={ProfileFeedgensFooter}
				refreshing={isPTRing}
				onRefresh={onRefresh}
				headerOffset={headerOffset}
				contentContainerStyle={isMobile ? { paddingBottom: headerOffset + 100 } : undefined}
				removeClippedSubviews={true}
				desktopFixedHeight
				onEndReached={onEndReached}
			/>
		</div>
	);
});

const styles = {
	footer: { paddingTop: 20 },
} satisfies Record<string, React.CSSProperties>;
