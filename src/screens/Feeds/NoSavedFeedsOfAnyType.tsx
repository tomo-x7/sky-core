import { TID } from "@atproto/common-web";
import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { RECOMMENDED_SAVED_FEEDS } from "#/lib/constants";
import { useOverwriteSavedFeedsMutation } from "#/state/queries/preferences";

/**
 * Explicitly named, since the CTA in this component will overwrite all saved
 * feeds if pressed. It should only be presented to the user if they actually
 * have no other feeds saved.
 */
export function NoSavedFeedsOfAnyType() {
	const t = useTheme();
	const { isPending, mutateAsync: overwriteSavedFeeds } = useOverwriteSavedFeedsMutation();

	const addRecommendedFeeds = React.useCallback(async () => {
		await overwriteSavedFeeds(
			RECOMMENDED_SAVED_FEEDS.map((f) => ({
				...f,
				id: TID.nextStr(),
			})),
		);
	}, [overwriteSavedFeeds]);

	return (
		<div
			style={{
				flexDirection: "row",
				flexWrap: "wrap",
				justifyContent: "space-between",
				padding: 20,
				gap: 12,
			}}
		>
			<Text
				style={{
					lineHeight: 1.3,
					...t.atoms.text_contrast_medium,
					...{ maxWidth: 310 },
				}}
			>
				Looks like you haven't saved any feeds! Use our recommendations or browse more below.
			</Text>
			<Button
				disabled={isPending}
				label={"Apply default recommended feeds"}
				size="small"
				variant="solid"
				color="primary"
				onPress={addRecommendedFeeds}
			>
				<ButtonIcon icon={Plus} position="left" />
				<ButtonText>{"Use recommended"}</ButtonText>
			</Button>
		</div>
	);
}
