import type { AppBskyActorDefs } from "@atproto/api";
import React from "react";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import type { RouteParam } from "#/lib/routes/types";
import { cleanError } from "#/lib/strings/errors";
import { useProfileKnownFollowersQuery } from "#/state/queries/known-followers";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { List } from "#/view/com/util/List";
import { ViewHeader } from "#/view/com/util/ViewHeader";

function renderItem({
	item,
	index,
}: {
	item: AppBskyActorDefs.ProfileView;
	index: number;
}) {
	return <ProfileCardWithFollowBtn key={item.did} profile={item} noBorder={index === 0} />;
}

function keyExtractor(item: AppBskyActorDefs.ProfileViewBasic) {
	return item.did;
}

export const ProfileKnownFollowersScreen = () => {
	const setMinimalShellMode = useSetMinimalShellMode();
	const initialNumToRender = useInitialNumToRender();

	const { name } = useParams<RouteParam<"ProfileKnownFollowers">>();

	const [isPTRing, setIsPTRing] = React.useState(false);
	const { data: resolvedDid, isLoading: isDidLoading, error: resolveError } = useResolveDidQuery(name);
	const {
		data,
		isLoading: isFollowersLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = useProfileKnownFollowersQuery(resolvedDid);

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh followers", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || !!error) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more followers", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, error, fetchNextPage]);

	const followers = React.useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.followers);
		}
		return [];
	}, [data]);

	const isError = Boolean(resolveError || error);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	if (followers.length < 1) {
		return (
			<Layout.Screen>
				<ViewHeader title={"Followers you know"} />
				<ListMaybePlaceholder
					isLoading={isDidLoading || isFollowersLoading}
					isError={isError}
					emptyType="results"
					emptyMessage={`You don't follow any users who follow @${name}.`}
					errorMessage={cleanError(resolveError || error)}
					onRetry={isError ? refetch : undefined}
					topBorder={false}
					sideBorders={false}
				/>
			</Layout.Screen>
		);
	}

	return (
		<Layout.Screen>
			<ViewHeader title={"Followers you know"} />
			<List
				data={followers}
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
					/>
				}
				desktopFixedHeight
				initialNumToRender={initialNumToRender}
				// windowSize={11}
				sideBorders={false}
			/>
		</Layout.Screen>
	);
};
