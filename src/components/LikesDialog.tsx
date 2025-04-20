import type { AppBskyFeedGetLikes as GetLikes } from "@atproto/api";
import { useCallback, useMemo } from "react";

import { atoms as a, useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { cleanError } from "#/lib/strings/errors";
import { useLikedByQuery } from "#/state/queries/post-liked-by";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";
import { ActivityIndicator } from "./ActivityIndicator";

interface LikesDialogProps {
	control: Dialog.DialogOuterProps["control"];
	uri: string;
}

export function LikesDialog(props: LikesDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<LikesDialogInner {...props} />
		</Dialog.Outer>
	);
}

export function LikesDialogInner({ control, uri }: LikesDialogProps) {
	const t = useTheme();

	const { data: resolvedUri, error: resolveError, isFetched: hasFetchedResolvedUri } = useResolveUriQuery(uri);
	const {
		data,
		isFetching: isFetchingLikedBy,
		isFetched: hasFetchedLikedBy,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		isError,
		error: likedByError,
	} = useLikedByQuery(resolvedUri?.uri);

	const isLoading = !hasFetchedResolvedUri || !hasFetchedLikedBy;
	const likes = useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.likes);
		}
		return [];
	}, [data]);

	const onEndReached = useCallback(async () => {
		if (isFetchingLikedBy || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more likes", { message: err });
		}
	}, [isFetchingLikedBy, hasNextPage, isError, fetchNextPage]);

	const renderItem = useCallback(
		({ item }: { item: GetLikes.Like }) => {
			return (
				<ProfileCardWithFollowBtn key={item.actor.did} profile={item.actor} onPress={() => control.close()} />
			);
		},
		[control],
	);

	return (
		<Dialog.Inner label={"Users that have liked this content or profile"}>
			<Text
				style={{
					fontSize: 22,
					letterSpacing: 0,
					fontWeight: "600",
					lineHeight: 1.15,
					paddingBottom: 16,
				}}
			>
				Liked by
			</Text>
			{isLoading ? (
				<div style={{ minHeight: 300 }}>
					<Loader size="xl" />
				</div>
			) : resolveError || likedByError || !data ? (
				<ErrorMessage message={cleanError(resolveError || likedByError)} />
			) : likes.length === 0 ? (
				<div
					style={{
						...t.atoms.bg_contrast_50,
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 20,
						paddingBottom: 20,
						borderRadius: 12,
					}}
				>
					<Text style={{ textAlign:"center" }}>Nobody has liked this yet. Maybe you should be the first!</Text>
				</div>
			) : (
				<div
				// FlatList
				// data={likes}
				// keyExtractor={(item) => item.actor.did}
				// onEndReached={onEndReached}
				// renderItem={renderItem}
				// initialNumToRender={15}
				// ListFooterComponent={<ListFooterComponent isFetching={isFetchingNextPage} />}
				/>
			)}
			<Dialog.Close />
		</Dialog.Inner>
	);
}

function ListFooterComponent({ isFetching }: { isFetching: boolean }) {
	if (isFetching) {
		return (
			<div style={{ paddingTop:16 }}>
				<ActivityIndicator />
			</div>
		);
	}
	return null;
}
