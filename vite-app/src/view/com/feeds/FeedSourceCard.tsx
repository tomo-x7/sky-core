import { AtUri } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "#/alf";
import { atoms as a } from "#/alf";
import { shouldClickOpenNewTab } from "#/components/Link";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { useNavigationDeduped } from "#/lib/hooks/useNavigationDeduped";
import { usePalette } from "#/lib/hooks/usePalette";
import { sanitizeHandle } from "#/lib/strings/handles";
import { s } from "#/lib/styles";
import { type FeedSourceInfo, useFeedSourceInfoQuery } from "#/state/queries/feed";
import {
	type UsePreferencesQueryResponse,
	useAddSavedFeedsMutation,
	usePreferencesQuery,
	useRemoveFeedMutation,
} from "#/state/queries/preferences";
import { FeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "../util/UserAvatar";

export function FeedSourceCard({
	feedUri,
	style,
	showSaveBtn = false,
	showDescription = false,
	showLikes = false,
	pinOnSave = false,
	showMinimalPlaceholder,
	hideTopBorder,
}: {
	feedUri: string;
	style?: React.CSSProperties;
	showSaveBtn?: boolean;
	showDescription?: boolean;
	showLikes?: boolean;
	pinOnSave?: boolean;
	showMinimalPlaceholder?: boolean;
	hideTopBorder?: boolean;
}) {
	const { data: preferences } = usePreferencesQuery();
	const { data: feed } = useFeedSourceInfoQuery({ uri: feedUri });

	return (
		<FeedSourceCardLoaded
			feedUri={feedUri}
			feed={feed}
			preferences={preferences}
			style={style}
			showSaveBtn={showSaveBtn}
			showDescription={showDescription}
			showLikes={showLikes}
			pinOnSave={pinOnSave}
			showMinimalPlaceholder={showMinimalPlaceholder}
			hideTopBorder={hideTopBorder}
		/>
	);
}

export function FeedSourceCardLoaded({
	feedUri,
	feed,
	preferences,
	style,
	showSaveBtn = false,
	showDescription = false,
	showLikes = false,
	pinOnSave = false,
	showMinimalPlaceholder,
	hideTopBorder,
}: {
	feedUri: string;
	feed?: FeedSourceInfo;
	preferences?: UsePreferencesQueryResponse;
	style?: React.CSSProperties;
	showSaveBtn?: boolean;
	showDescription?: boolean;
	showLikes?: boolean;
	pinOnSave?: boolean;
	showMinimalPlaceholder?: boolean;
	hideTopBorder?: boolean;
}) {
	const t = useTheme();
	const pal = usePalette("default");
	const removePromptControl = Prompt.usePromptControl();
	const navigation = useNavigationDeduped();

	const { isPending: isAddSavedFeedPending, mutateAsync: addSavedFeeds } = useAddSavedFeedsMutation();
	const { isPending: isRemovePending, mutateAsync: removeFeed } = useRemoveFeedMutation();

	const savedFeedConfig = preferences?.savedFeeds?.find((f) => f.value === feedUri);
	const isSaved = Boolean(savedFeedConfig);

	const onSave = React.useCallback(async () => {
		if (!feed || isSaved) return;

		try {
			await addSavedFeeds([
				{
					type: "feed",
					value: feed.uri,
					pinned: pinOnSave,
				},
			]);
			Toast.show("Added to my feeds");
		} catch (e) {
			Toast.show("There was an issue contacting your server", "xmark");
			console.error("Failed to save feed", { message: e });
		}
	}, [feed, pinOnSave, addSavedFeeds, isSaved]);

	const onUnsave = React.useCallback(async () => {
		if (!savedFeedConfig) return;

		try {
			await removeFeed(savedFeedConfig);
			// await item.unsave()
			Toast.show("Removed from my feeds");
		} catch (e) {
			Toast.show("There was an issue contacting your server", "xmark");
			console.error("Failed to unsave feed", { message: e });
		}
	}, [removeFeed, savedFeedConfig]);

	const onToggleSaved = React.useCallback(async () => {
		if (isSaved) {
			removePromptControl.open();
		} else {
			await onSave();
		}
	}, [isSaved, removePromptControl, onSave]);

	/*
	 * LOAD STATE
	 *
	 * This state also captures the scenario where a feed can't load for whatever
	 * reason.
	 */
	if (!feed || !preferences)
		return (
			<div
				style={{
					...pal.border,

					...{
						borderTopWidth: showMinimalPlaceholder || hideTopBorder ? 0 : StyleSheet.hairlineWidth,
						flexDirection: "row",
						alignItems: "center",
						flex: 1,
						paddingRight: 18,
					},
				}}
			>
				{showMinimalPlaceholder ? (
					<FeedLoadingPlaceholder style={{ flex: 1 }} showTopBorder={false} showLowerPlaceholder={false} />
				) : (
					<FeedLoadingPlaceholder style={{ flex: 1 }} showTopBorder={false} />
				)}
				{showSaveBtn && (
					<Pressable
						disabled={isRemovePending}
						accessibilityRole="button"
						accessibilityLabel={"Remove from my feeds"}
						accessibilityHint=""
						onPress={onUnsave}
						hitSlop={15}
						style={styles.btn}
					>
						{/* @ts-ignore */}
						<FontAwesomeIcon icon={["far", "trash-can"]} size={19} color={pal.colors.icon} />
					</Pressable>
				)}
			</div>
		);

	return (
		<>
			<button
				type="button"
				style={{
					...styles.container,
					...pal.border,
					...style,
					...{ borderTopWidth: hideTopBorder ? 0 : 1 },
				}}
				onClick={(e) => {
					const shouldOpenInNewTab = shouldClickOpenNewTab(e);
					if (feed.type === "feed") {
						if (shouldOpenInNewTab) {
							Linking.openURL(`/profile/${feed.creatorDid}/feed/${new AtUri(feed.uri).rkey}`);
						} else {
							navigation.push("ProfileFeed", {
								name: feed.creatorDid,
								rkey: new AtUri(feed.uri).rkey,
							});
						}
					} else if (feed.type === "list") {
						if (shouldOpenInNewTab) {
							Linking.openURL(`/profile/${feed.creatorDid}/lists/${new AtUri(feed.uri).rkey}`);
						} else {
							navigation.push("ProfileList", {
								name: feed.creatorDid,
								rkey: new AtUri(feed.uri).rkey,
							});
						}
					}
				}}
				key={feed.uri}
			>
				<View
					style={{
						...styles.headerContainer,
						...a.align_center,
					}}
				>
					<View style={s.mr10}>
						<UserAvatar type="algo" size={36} avatar={feed.avatar} />
					</View>
					<div style={styles.headerTextContainer}>
						<Text
							emoji
							style={{
								...pal.text,
								...s.bold,
							}}
							numberOfLines={1}
						>
							{feed.displayName}
						</Text>
						<Text style={pal.textLight} numberOfLines={1}>
							{feed.type === "feed" ? (
								<>Feed by {sanitizeHandle(feed.creatorHandle, "@")}</>
							) : (
								<>List by {sanitizeHandle(feed.creatorHandle, "@")}</>
							)}
						</Text>
					</div>

					{showSaveBtn && (
						<View style={{ alignSelf: "center" }}>
							<Pressable
								disabled={isAddSavedFeedPending || isRemovePending}
								accessibilityRole="button"
								accessibilityLabel={isSaved ? "Remove from my feeds" : "Add to my feeds"}
								accessibilityHint=""
								onPress={onToggleSaved}
								hitSlop={15}
								style={styles.btn}
							>
								{isSaved ? (
									//@ts-ignore
									<FontAwesomeIcon icon={["far", "trash-can"]} size={19} color={pal.colors.icon} />
								) : (
									//@ts-ignore
									<FontAwesomeIcon icon="plus" size={18} color={pal.colors.link} />
								)}
							</Pressable>
						</View>
					)}
				</View>

				{showDescription && feed.description ? (
					<RichText
						style={{
							...t.atoms.text_contrast_high,
							...styles.description,
						}}
						value={feed.description}
						numberOfLines={3}
					/>
				) : null}

				{showLikes && feed.type === "feed" ? (
					<Text
						type="sm-medium"
						style={{
							...pal.text,
							...pal.textLight,
						}}
					>
						<>
							Liked by {feed.likeCount || 0} {feed.likeCount === 1 ? "user" : "users"}
						</>
					</Text>
				) : null}
			</button>
			<Prompt.Basic
				control={removePromptControl}
				title={"Remove from your feeds?"}
				description={`Are you sure you want to remove ${feed.displayName} from your feeds?`}
				onConfirm={onUnsave}
				confirmButtonCta={"Remove"}
				confirmButtonColor="negative"
			/>
		</>
	);
}

const styles = {
	container: {
		padding: "20px 18px",
		flexDirection: "column",
		flex: 1,
		gap: 14,
	},
	border: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	headerContainer: {
		flexDirection: "row",
	},
	headerTextContainer: {
		flexDirection: "column",
		columnGap: 4,
		flex: 1,
	},
	description: {
		flex: 1,
		flexWrap: "wrap",
	},
	btn: {
		paddingTop: 6,
		paddingBottom: 6,
	},
} satisfies Record<string, React.CSSProperties>;
