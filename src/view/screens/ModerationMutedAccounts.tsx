import type { AppBskyActorDefs as ActorDefs } from "@atproto/api";
import React from "react";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { cleanError } from "#/lib/strings/errors";
import { useMyMutedAccountsQuery } from "#/state/queries/my-muted-accounts";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileCard } from "#/view/com/profile/ProfileCard";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { ErrorScreen } from "#/view/com/util/error/ErrorScreen";

export function ModerationMutedAccounts() {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();
	const { isTabletOrDesktop } = useWebMediaQueries();

	const [isPTRing, setIsPTRing] = React.useState(false);
	const { data, isFetching, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMyMutedAccountsQuery();
	const isEmpty = !isFetching && !data?.pages[0]?.mutes.length;
	const profiles = React.useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.mutes);
		}
		return [];
	}, [data]);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh my muted accounts", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = React.useCallback(async () => {
		if (isFetching || !hasNextPage || isError) return;

		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more of my muted accounts", { message: err });
		}
	}, [isFetching, hasNextPage, isError, fetchNextPage]);

	const renderItem = ({
		item,
		index,
	}: {
		item: ActorDefs.ProfileView;
		index: number;
	}) => <ProfileCard key={item.did} profile={item} noModFilter />;
	return (
		<Layout.Screen>
			<ViewHeader title={"Muted Accounts"} showOnDesktop />
			<Layout.Center
				style={{
					flex: 1,
					...{ paddingBottom: 100 },
				}}
			>
				<Text
					type="sm"
					style={{
						...styles.description,
						...pal.text,
						...(isTabletOrDesktop && styles.descriptionDesktop),

						...{
							marginTop: 20,
						},
					}}
				>
					Muted accounts have their posts removed from your feed and from your notifications. Mutes are
					completely private.
				</Text>
				{isEmpty ? (
					<div style={pal.border}>
						{isError ? (
							<ErrorScreen title="Oops!" message={cleanError(error)} onPressTryAgain={refetch} />
						) : (
							<div
								style={{
									...styles.empty,
									...pal.viewLight,
								}}
							>
								<Text
									type="lg"
									style={{
										...pal.text,
										...styles.emptyText,
									}}
								>
									You have not muted any accounts yet. To mute an account, go to their profile and
									select "Mute account" from the menu on their account.
								</Text>
							</div>
						)}
					</div>
				) : (
					<div
						// FlatList
						style={!isTabletOrDesktop ? styles.flex1 : undefined}
						// data={profiles}
						// keyExtractor={(item) => item.did}
						// refreshControl={
						// 	<RefreshControl
						// 		refreshing={isPTRing}
						// 		onRefresh={onRefresh}
						// 		tintColor={pal.colors.text}
						// 		titleColor={pal.colors.text}
						// 	/>
						// }
						// onEndReached={onEndReached}
						// renderItem={renderItem}
						// initialNumToRender={15}
						// FIXME(dan)

						// ListFooterComponent={() => (
						// 	<div style={styles.footer}>
						// 		{(isFetching || isFetchingNextPage) && <ActivityIndicator />}
						// 	</div>
						// )}
						// @ts-expect-error our .web version only -prf
						desktopFixedHeight
					/>
				)}
			</Layout.Center>
		</Layout.Screen>
	);
}

const styles = {
	title: {
		textAlign: "center",
		marginTop: 12,
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		paddingRight: 30,
		paddingLeft: 30,
		marginBottom: 14,
	},
	descriptionDesktop: {
		marginTop: 14,
	},

	flex1: {
		flex: 1,
	},
	empty: {
		padding: 20,
		borderRadius: 16,
		marginLeft: 24,
		marginRight: 24,
		marginTop: 10,
	},
	emptyText: {
		textAlign: "center",
	},

	footer: {
		height: 200,
		paddingTop: 20,
	},
} satisfies Record<string, React.CSSProperties>;
