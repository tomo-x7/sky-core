import { type AppBskyFeedDefs, AppBskyFeedPost, type ModerationDecision, moderatePost } from "@atproto/api";
import { useCallback, useState } from "react";

import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { usePostQuotesQuery } from "#/state/queries/post-quotes";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { Post } from "#/view/com/post/Post";
import { List } from "../util/List";

function renderItem({
	item,
	index,
}: {
	item: {
		post: AppBskyFeedDefs.PostView;
		moderation: ModerationDecision;
		record: AppBskyFeedPost.Record;
	};
	index: number;
}) {
	return <Post post={item.post} hideTopBorder={index === 0} />;
}

function keyExtractor(item: {
	post: AppBskyFeedDefs.PostView;
	moderation: ModerationDecision;
	record: AppBskyFeedPost.Record;
}) {
	return item.post.uri;
}

export function PostQuotes({ uri }: { uri: string }) {
	const initialNumToRender = useInitialNumToRender();
	const [isPTRing, setIsPTRing] = useState(false);

	const { data: resolvedUri, error: resolveError, isLoading: isLoadingUri } = useResolveUriQuery(uri);
	const {
		data,
		isLoading: isLoadingQuotes,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = usePostQuotesQuery(resolvedUri?.uri);

	const moderationOpts = useModerationOpts();

	const isError = Boolean(resolveError || error);

	const quotes =
		data?.pages
			.flatMap((page) =>
				page.posts.map((post) => {
					if (!AppBskyFeedPost.isRecord(post.record) || !moderationOpts) {
						return null;
					}
					const moderation = moderatePost(post, moderationOpts);
					return { post, record: post.record, moderation };
				}),
			)
			.filter((item) => item !== null) ?? [];

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh quotes", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more quotes", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	if (quotes.length < 1) {
		return (
			<ListMaybePlaceholder
				isLoading={isLoadingUri || isLoadingQuotes}
				isError={isError}
				emptyType="results"
				emptyTitle={"No quotes yet"}
				emptyMessage={"Nobody has quoted this yet. Maybe you should be the first!"}
				errorMessage={cleanError(resolveError || error)}
				sideBorders={false}
			/>
		);
	}

	// loaded
	// =
	return (
		<List
			data={quotes}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			refreshing={isPTRing}
			onRefresh={onRefresh}
			onEndReached={onEndReached}
			onEndReachedThreshold={4}
			ListFooterComponent={
				<ListFooter
					isFetchingNextPage={isFetchingNextPage}
					error={cleanError(error)}
					onRetry={fetchNextPage}
					showEndMessage
					endMessageText={`That's all, folks!`}
				/>
			}
			// @ts-ignore our .web version only -prf
			desktopFixedHeight
			initialNumToRender={initialNumToRender}
			windowSize={11}
			sideBorders={false}
		/>
	);
}
