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
		<CenteredView sideBorders style={a.h_full_vh}>
			<div
				style={{
					...a.align_center,
					...a.h_full_vh,
					...a.py_3xl,
					...a.px_xl,
					paddingTop: headerOffset + a.py_3xl.paddingTop,
				}}
			>
				<div
					style={{
						...a.align_center,
						...a.gap_sm,
						...a.pb_xl,
					}}
				>
					<Text
						style={{
							...a.text_xl,
							...a.font_bold,
						}}
					>
						Whoops!
					</Text>
					<Text
						style={{
							...a.text_md,
							...a.text_center,
							...a.leading_snug,
							...{ maxWidth: 340 },
						}}
					>
						Looks like you unpinned all your feeds. But don't worry, you can add some below 😄
					</Text>
				</div>

				<div
					style={{
						...a.flex_row,
						...a.gap_md,
						...a.justify_center,
						...a.flex_wrap,
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
