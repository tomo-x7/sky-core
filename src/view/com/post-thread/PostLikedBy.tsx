import type { AppBskyFeedGetLikes as GetLikes } from "@atproto/api";
import { useCallback, useMemo, useState } from "react";

import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { useLikedByQuery } from "#/state/queries/post-liked-by";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { List } from "#/view/com/util/List";

function renderItem({ item, index }: { item: GetLikes.Like; index: number }) {
	return <ProfileCardWithFollowBtn key={item.actor.did} profile={item.actor} noBorder={index === 0} />;
}

function keyExtractor(item: GetLikes.Like) {
	return item.actor.did;
}

export function PostLikedBy({ uri }: { uri: string }) {
	const initialNumToRender = useInitialNumToRender();

	const [isPTRing, setIsPTRing] = useState(false);

	const { data: resolvedUri, error: resolveError, isLoading: isLoadingUri } = useResolveUriQuery(uri);
	const {
		data,
		isLoading: isLoadingLikes,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = useLikedByQuery(resolvedUri?.uri);

	const isError = Boolean(resolveError || error);

	const likes = useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.likes);
		}
		return [];
	}, [data]);

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh likes", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more likes", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	if (likes.length < 1) {
		return (
			<ListMaybePlaceholder
				isLoading={isLoadingUri || isLoadingLikes}
				isError={isError}
				emptyType="results"
				emptyTitle={"No likes yet"}
				emptyMessage={"Nobody has liked this yet. Maybe you should be the first!"}
				errorMessage={cleanError(resolveError || error)}
				sideBorders={false}
				topBorder={false}
			/>
		);
	}

	return (
		<List
			data={likes}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			refreshing={isPTRing}
			onRefresh={onRefresh}
			onEndReached={onEndReached}
			onEndReachedThreshold={4}
			ListFooterComponent={
				<ListFooter isFetchingNextPage={isFetchingNextPage} error={cleanError(error)} onRetry={fetchNextPage} />
			}
			desktopFixedHeight
			initialNumToRender={initialNumToRender}
			// windowSize={11}
			sideBorders={false}
		/>
	);
}
