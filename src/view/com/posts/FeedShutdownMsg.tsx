import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { InlineLinkText } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { PROD_DEFAULT_FEED } from "#/lib/constants";
import {
	usePreferencesQuery,
	useRemoveFeedMutation,
	useReplaceForYouWithDiscoverFeedMutation,
} from "#/state/queries/preferences";
import { useSetSelectedFeed } from "#/state/shell/selected-feed";
import * as Toast from "#/view/com/util/Toast";

export function FeedShutdownMsg({ feedUri }: { feedUri: string }) {
	const t = useTheme();
	const setSelectedFeed = useSetSelectedFeed();
	const { data: preferences } = usePreferencesQuery();
	const { mutateAsync: removeFeed, isPending: isRemovePending } = useRemoveFeedMutation();
	const { mutateAsync: replaceFeedWithDiscover, isPending: isReplacePending } =
		useReplaceForYouWithDiscoverFeedMutation();

	const feedConfig = preferences?.savedFeeds?.find((f) => f.value === feedUri && f.pinned);
	const discoverFeedConfig = preferences?.savedFeeds?.find((f) => f.value === PROD_DEFAULT_FEED("whats-hot"));
	const hasFeedPinned = Boolean(feedConfig);
	const hasDiscoverPinned = Boolean(discoverFeedConfig?.pinned);

	const onRemoveFeed = React.useCallback(async () => {
		try {
			if (feedConfig) {
				await removeFeed(feedConfig);
				Toast.show("Removed from your feeds");
			}
			if (hasDiscoverPinned) {
				setSelectedFeed(`feedgen|${PROD_DEFAULT_FEED("whats-hot")}`);
			}
		} catch (err: any) {
			Toast.show(
				"There was an issue updating your feeds, please check your internet connection and try again.",
				"exclamation-circle",
			);
			console.error("Failed to update feeds", { message: err });
		}
	}, [removeFeed, feedConfig, hasDiscoverPinned, setSelectedFeed]);

	const onReplaceFeed = React.useCallback(async () => {
		try {
			await replaceFeedWithDiscover({
				forYouFeedConfig: feedConfig,
				discoverFeedConfig,
			});
			setSelectedFeed(`feedgen|${PROD_DEFAULT_FEED("whats-hot")}`);
			Toast.show("The feed has been replaced with Discover.");
		} catch (err: any) {
			Toast.show(
				"There was an issue updating your feeds, please check your internet connection and try again.",
				"exclamation-circle",
			);
			console.error("Failed to update feeds", { message: err });
		}
	}, [replaceFeedWithDiscover, discoverFeedConfig, feedConfig, setSelectedFeed]);

	const isProcessing = isReplacePending || isRemovePending;
	return (
		<div
			style={{
				paddingTop: 28,
				paddingBottom: 28,
				paddingLeft: 24,
				paddingRight: 24,
				gap: 20,
				...t.atoms.border_contrast_low,
				borderTop: "1px solid black",
				borderTopWidth: 1,
			}}
		>
			<Text
				style={{
					fontSize: 40,
					letterSpacing: 0,
					fontWeight: "600",
					...t.atoms.text,
					textAlign: "center",
				}}
			>
				:(
			</Text>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					lineHeight: 1.3,
					...t.atoms.text,
					textAlign: "center",
				}}
			>
				<>
					This feed is no longer online. We are showing{" "}
					<InlineLinkText
						label={"The Discover feed"}
						to="/profile/bsky.app/feed/whats-hot"
						style={{ fontSize: 16 }}
					>
						Discover
					</InlineLinkText>{" "}
					instead.
				</>
			</Text>
			{hasFeedPinned ? (
				<div
					style={{
						flexDirection: "row",
						justifyContent: "center",
						gap: 8,
					}}
				>
					<Button
						variant="outline"
						color="primary"
						size="small"
						label={"Remove feed"}
						disabled={isProcessing}
						onPress={onRemoveFeed}
					>
						<ButtonText>Remove feed</ButtonText>
						{isRemovePending && <ButtonIcon icon={Loader} />}
					</Button>
					{!hasDiscoverPinned && (
						<Button
							variant="solid"
							color="primary"
							size="small"
							label={"Replace with Discover"}
							disabled={isProcessing}
							onPress={onReplaceFeed}
						>
							<ButtonText>Replace with Discover</ButtonText>
							{isReplacePending && <ButtonIcon icon={Loader} />}
						</Button>
					)}
				</div>
			) : undefined}
		</div>
	);
}
