import { TID } from "@atproto/common-web";
import React from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { useHeaderOffset } from "#/components/hooks/useHeaderOffset";
import { ListSparkle_Stroke2_Corner0_Rounded as ListSparkle } from "#/components/icons/ListSparkle";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { DISCOVER_SAVED_FEED, TIMELINE_SAVED_FEED } from "#/lib/constants";
import { useOverwriteSavedFeedsMutation } from "#/state/queries/preferences";
import type { UsePreferencesQueryResponse } from "#/state/queries/preferences";
import { CenteredView } from "#/view/com/util/Views";

export function NoFeedsPinned({
	preferences,
}: {
	preferences: UsePreferencesQueryResponse;
}) {
	const headerOffset = useHeaderOffset();
	const { isPending, mutateAsync: overwriteSavedFeeds } = useOverwriteSavedFeedsMutation();

	const addRecommendedFeeds = React.useCallback(async () => {
		let skippedTimeline = false;
		let skippedDiscover = false;
		const remainingSavedFeeds = [];

		// remove first instance of both timeline and discover, since we're going to overwrite them
		for (const savedFeed of preferences.savedFeeds) {
			if (savedFeed.type === "timeline" && !skippedTimeline) {
				skippedTimeline = true;
			} else if (savedFeed.value === DISCOVER_SAVED_FEED.value && !skippedDiscover) {
				skippedDiscover = true;
			} else {
				remainingSavedFeeds.push(savedFeed);
			}
		}

		const toSave = [
			{
				...DISCOVER_SAVED_FEED,
				pinned: true,
				id: TID.nextStr(),
			},
			{
				...TIMELINE_SAVED_FEED,
				pinned: true,
				id: TID.nextStr(),
			},
			...remainingSavedFeeds,
		];

		await overwriteSavedFeeds(toSave);
	}, [overwriteSavedFeeds, preferences.savedFeeds]);

	return (
		<CenteredView sideBorders style={{ height:"100dvh" }}>
			<div
				style={{
					alignItems: "center",
					height: "100dvh",
					paddingBottom: 28,
					paddingLeft: 20,
					paddingRight: 20,
					paddingTop: headerOffset + 28,
				}}
			>
				<div
					style={{
						alignItems: "center",
						gap: 8,
						paddingBottom: 20,
					}}
				>
					<Text
						style={{
							fontSize: 20,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						Whoops!
					</Text>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							textAlign: "center",
							lineHeight: 1.3,
							...{ maxWidth: 340 },
						}}
					>
						Looks like you unpinned all your feeds. But don't worry, you can add some below 😄
					</Text>
				</div>

				<div
					style={{
						flexDirection: "row",
						gap: 12,
						justifyContent: "center",
						flexWrap: "wrap",
					}}
				>
					<Button
						disabled={isPending}
						label={"Apply default recommended feeds"}
						size="large"
						variant="solid"
						color="primary"
						onPress={addRecommendedFeeds}
					>
						<ButtonIcon icon={Plus} position="left" />
						<ButtonText>{"Add recommended feeds"}</ButtonText>
					</Button>

					<Link label={"Browse other feeds"} to="/feeds" size="large" variant="solid" color="secondary">
						<ButtonIcon icon={ListSparkle} position="left" />
						<ButtonText>{"Browse other feeds"}</ButtonText>
					</Link>
				</div>
			</div>
		</CenteredView>
	);
}
