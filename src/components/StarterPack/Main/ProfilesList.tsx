import { type AppBskyActorDefs, type AppBskyGraphGetList, AtUri, type ModerationOpts } from "@atproto/api";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import React, { useCallback } from "react";

import { useTheme } from "#/alf";
import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { Default as ProfileCard } from "#/components/ProfileCard";
import { useBottomBarOffset } from "#/lib/hooks/useBottomBarOffset";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { isBlockedOrBlocking } from "#/lib/moderation/blocked-and-muted";
import type { SectionRef } from "#/screens/Profile/Sections/types";
import { useAllListMembersQuery } from "#/state/queries/list-members";
import { useSession } from "#/state/session";
import type { ListRenderItemInfo } from "#/temp";
import { List, type ListRef } from "#/view/com/util/List";

function keyExtractor(item: AppBskyActorDefs.ProfileViewBasic, index: number) {
	return `${item.did}-${index}`;
}

interface ProfilesListProps {
	listUri: string;
	listMembersQuery: UseInfiniteQueryResult<InfiniteData<AppBskyGraphGetList.OutputSchema>>;
	moderationOpts: ModerationOpts;
	headerHeight: number;
	scrollElRef: ListRef;
}

export const ProfilesList = React.forwardRef<SectionRef, ProfilesListProps>(function ProfilesListImpl(
	{ listUri, moderationOpts, headerHeight, scrollElRef },
	ref,
) {
	const t = useTheme();
	const bottomBarOffset = useBottomBarOffset(headerHeight);
	const initialNumToRender = useInitialNumToRender();
	const { currentAccount } = useSession();
	const { data, refetch, isError } = useAllListMembersQuery(listUri);

	const [isPTRing, setIsPTRing] = React.useState(false);

	// The server returns these sorted by descending creation date, so we want to invert

	const profiles = data
		?.filter((p) => !isBlockedOrBlocking(p.subject) && !p.subject.associated?.labeler)
		.map((p) => p.subject)
		.reverse();
	const isOwn = new AtUri(listUri).host === currentAccount?.did;

	const getSortedProfiles = () => {
		if (!profiles) return;
		if (!isOwn) return profiles;

		const myIndex = profiles.findIndex((p) => p.did === currentAccount?.did);
		return myIndex !== -1
			? [profiles[myIndex], ...profiles.slice(0, myIndex), ...profiles.slice(myIndex + 1)]
			: profiles;
	};
	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
	}, [scrollElRef, headerHeight]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const renderItem = ({ item, index }: ListRenderItemInfo<AppBskyActorDefs.ProfileViewBasic>) => {
		return (
			<div
				style={{
					padding: 16,
					...t.atoms.border_contrast_low,
					borderTop: "1px solid black",
					borderTopWidth: 1,
				}}
			>
				<ProfileCard profile={item} moderationOpts={moderationOpts} logContext="StarterPackProfilesList" />
			</div>
		);
	};

	if (!data) {
		return (
			<div
				style={{
					height: "100dvh",
					...{ marginTop: headerHeight, marginBottom: bottomBarOffset },
				}}
			>
				<ListMaybePlaceholder isLoading={true} isError={isError} onRetry={refetch} />
			</div>
		);
	}

	if (data)
		return (
			<List
				data={getSortedProfiles()}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ref={scrollElRef}
				headerOffset={headerHeight}
				ListFooterComponent={<ListFooter style={{ paddingBottom: bottomBarOffset, borderTopWidth: 0 }} />}
				showsVerticalScrollIndicator={false}
				desktopFixedHeight
				initialNumToRender={initialNumToRender}
				refreshing={isPTRing}
				onRefresh={async () => {
					setIsPTRing(true);
					await refetch();
					setIsPTRing(false);
				}}
			/>
		);
});
