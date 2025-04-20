import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import * as ListCard from "#/components/ListCard";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { cleanError } from "#/lib/strings/errors";
import { RQKEY, useProfileListsQuery } from "#/state/queries/profile-lists";
import type { ListRenderItemInfo } from "#/temp";
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

interface ProfileListsProps {
	did: string;
	scrollElRef: ListRef;
	headerOffset: number;
	enabled?: boolean;
	style?: React.CSSProperties;
}

export const ProfileLists = React.forwardRef<SectionRef, ProfileListsProps>(function ProfileListsImpl(
	{ did, scrollElRef, headerOffset, enabled, style },
	ref,
) {
	const t = useTheme();
	const [isPTRing, setIsPTRing] = React.useState(false);
	const opts = React.useMemo(() => ({ enabled }), [enabled]);
	const { data, isFetching, isFetched, hasNextPage, fetchNextPage, isFetchingNextPage, isError, error, refetch } =
		useProfileListsQuery(did, opts);
	const { isMobile } = useWebMediaQueries();
	const isEmpty = !isFetching && !data?.pages[0]?.lists.length;

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
				items = items.concat(page.lists);
			}
		}
		if (isError && !isEmpty) {
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
			console.error("Failed to refresh lists", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more lists", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const onPressRetryLoadMore = React.useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	// rendering
	// =

	const renderItemInner = React.useCallback(
		({ item, index }: ListRenderItemInfo<any>) => {
			if (item === EMPTY) {
				return <EmptyState icon="list-ul" message={"You have no lists."} />;
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
			return (
				<div
					style={{
						borderTop: "1px solid black",
						borderTopWidth: 1,
						...t.atoms.border_contrast_low,
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 16,
						paddingBottom: 16,
					}}
				>
					<ListCard.Default view={item} />
				</div>
			);
		},
		[error, refetch, onPressRetryLoadMore, t.atoms.border_contrast_low],
	);

	const ProfileListsFooter = React.useCallback(() => {
		return isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null;
	}, [isFetchingNextPage]);

	return (
		<div style={style}>
			<List
				ref={scrollElRef}
				data={items}
				keyExtractor={(item: any) => item._reactKey || item.uri}
				renderItem={renderItemInner}
				ListFooterComponent={ProfileListsFooter}
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
