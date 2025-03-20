import type { AppBskyActorDefs } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";

import { atoms as a, useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { FilterTimeline_Stroke2_Corner0_Rounded as FilterTimeline } from "#/components/icons/FilterTimeline";
import { FloppyDisk_Stroke2_Corner0_Rounded as SaveIcon } from "#/components/icons/FloppyDisk";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import type { CommonNavigatorParams, NavigationProp } from "#/lib/routes/types";
import { colors, s } from "#/lib/styles";
import { NoFollowingFeed } from "#/screens/Feeds/NoFollowingFeed";
import { NoSavedFeedsOfAnyType } from "#/screens/Feeds/NoSavedFeedsOfAnyType";
import { useOverwriteSavedFeedsMutation, usePreferencesQuery } from "#/state/queries/preferences";
import type { UsePreferencesQueryResponse } from "#/state/queries/preferences/types";
import { useSetMinimalShellMode } from "#/state/shell";
import { FeedSourceCard } from "#/view/com/feeds/FeedSourceCard";
import { TextLink } from "#/view/com/util/Link";
import * as Toast from "#/view/com/util/Toast";

type Props = NativeStackScreenProps<CommonNavigatorParams, "SavedFeeds">;
export function SavedFeeds(props: Props) {
	const { data: preferences } = usePreferencesQuery();
	if (!preferences) {
		return <div />;
	}
	return <SavedFeedsInner preferences={preferences} />;
}

function SavedFeedsInner({
	preferences,
}: {
	preferences: UsePreferencesQueryResponse;
}) {
	const pal = usePalette("default");
	const { isMobile, isDesktop } = useWebMediaQueries();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { mutateAsync: overwriteSavedFeeds, isPending: isOverwritePending } = useOverwriteSavedFeedsMutation();
	const navigation = useNavigation<NavigationProp>();

	/*
	 * Use optimistic data if exists and no error, otherwise fallback to remote
	 * data
	 */
	const [currentFeeds, setCurrentFeeds] = React.useState(() => preferences.savedFeeds || []);
	const hasUnsavedChanges = currentFeeds !== preferences.savedFeeds;
	const pinnedFeeds = currentFeeds.filter((f) => f.pinned);
	const unpinnedFeeds = currentFeeds.filter((f) => !f.pinned);
	const noSavedFeedsOfAnyType = pinnedFeeds.length + unpinnedFeeds.length === 0;
	const noFollowingFeed = currentFeeds.every((f) => f.type !== "timeline") && !noSavedFeedsOfAnyType;

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onSaveChanges = React.useCallback(async () => {
		try {
			await overwriteSavedFeeds(currentFeeds);
			Toast.show("Feeds updated!");
			navigation.navigate("Feeds");
		} catch (e) {
			Toast.show("There was an issue contacting the server", "xmark");
			console.error("Failed to toggle pinned feed", { message: e });
		}
	}, [overwriteSavedFeeds, currentFeeds, navigation]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content align="left">
					<Layout.Header.TitleText>Feeds</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Button
					size="small"
					variant={hasUnsavedChanges ? "solid" : "solid"}
					color={hasUnsavedChanges ? "primary" : "secondary"}
					onPress={onSaveChanges}
					label={"Save changes"}
					disabled={isOverwritePending || !hasUnsavedChanges}
				>
					<ButtonIcon icon={isOverwritePending ? Loader : SaveIcon} />
					<ButtonText>{isDesktop ? <>Save changes</> : <>Save</>}</ButtonText>
				</Button>
			</Layout.Header.Outer>
			<Layout.Content>
				{noSavedFeedsOfAnyType && (
					<div
						style={{
							...pal.border,
							...a.border_b,
						}}
					>
						<NoSavedFeedsOfAnyType />
					</div>
				)}

				<div
					style={{
						...pal.text,
						...pal.border,
						...styles.title,
					}}
				>
					<Text type="title" style={pal.text}>
						Pinned Feeds
					</Text>
				</div>

				{preferences ? (
					!pinnedFeeds.length ? (
						<div
							style={{
								...pal.border,
								...(isMobile && s.flex1),
								...pal.viewLight,
								...styles.empty,
							}}
						>
							<Text type="lg" style={pal.text}>
								You don't have any pinned feeds.
							</Text>
						</div>
					) : (
						pinnedFeeds.map((f) => (
							<ListItem
								key={f.id}
								feed={f}
								isPinned
								currentFeeds={currentFeeds}
								setCurrentFeeds={setCurrentFeeds}
								preferences={preferences}
							/>
						))
					)
				) : (
					<ActivityIndicator style={{ marginTop: 20 }} />
				)}

				{noFollowingFeed && (
					<div
						style={{
							...pal.border,
							...a.border_b,
						}}
					>
						<NoFollowingFeed />
					</div>
				)}

				<div
					style={{
						...pal.text,
						...pal.border,
						...styles.title,
					}}
				>
					<Text type="title" style={pal.text}>
						Saved Feeds
					</Text>
				</div>
				{preferences ? (
					!unpinnedFeeds.length ? (
						<div
							style={{
								...pal.border,
								...(isMobile && s.flex1),
								...pal.viewLight,
								...styles.empty,
							}}
						>
							<Text type="lg" style={pal.text}>
								You don't have any saved feeds.
							</Text>
						</div>
					) : (
						unpinnedFeeds.map((f) => (
							<ListItem
								key={f.id}
								feed={f}
								isPinned={false}
								currentFeeds={currentFeeds}
								setCurrentFeeds={setCurrentFeeds}
								preferences={preferences}
							/>
						))
					)
				) : (
					<ActivityIndicator style={{ marginTop: 20 }} />
				)}

				<div style={styles.footerText}>
					<Text type="sm" style={pal.textLight}>
						<>
							Feeds are custom algorithms that users build with a little coding expertise.{" "}
							<TextLink
								type="sm"
								style={pal.link}
								href="https://github.com/bluesky-social/feed-generator"
								text={"See this guide"}
							/>{" "}
							for more information.
						</>
					</Text>
				</div>
			</Layout.Content>
		</Layout.Screen>
	);
}

function ListItem({
	feed,
	isPinned,
	currentFeeds,
	setCurrentFeeds,
}: {
	feed: AppBskyActorDefs.SavedFeed;
	isPinned: boolean;
	currentFeeds: AppBskyActorDefs.SavedFeed[];
	setCurrentFeeds: React.Dispatch<AppBskyActorDefs.SavedFeed[]>;
	preferences: UsePreferencesQueryResponse;
}) {
	const pal = usePalette("default");
	const feedUri = feed.value;

	const onTogglePinned = React.useCallback(async () => {
		setCurrentFeeds(currentFeeds.map((f) => (f.id === feed.id ? { ...feed, pinned: !feed.pinned } : f)));
	}, [feed, currentFeeds, setCurrentFeeds]);

	const onPressUp = React.useCallback(async () => {
		if (!isPinned) return;

		const nextFeeds = currentFeeds.slice();
		const ids = currentFeeds.map((f) => f.id);
		const index = ids.indexOf(feed.id);
		const nextIndex = index - 1;

		if (index === -1 || index === 0) return;
		[nextFeeds[index], nextFeeds[nextIndex]] = [nextFeeds[nextIndex], nextFeeds[index]];

		setCurrentFeeds(nextFeeds);
	}, [feed, isPinned, setCurrentFeeds, currentFeeds]);

	const onPressDown = React.useCallback(async () => {
		if (!isPinned) return;

		const nextFeeds = currentFeeds.slice();
		const ids = currentFeeds.map((f) => f.id);
		const index = ids.indexOf(feed.id);
		const nextIndex = index + 1;

		if (index === -1 || index >= nextFeeds.filter((f) => f.pinned).length - 1) return;
		[nextFeeds[index], nextFeeds[nextIndex]] = [nextFeeds[nextIndex], nextFeeds[index]];

		setCurrentFeeds(nextFeeds);
	}, [feed, isPinned, setCurrentFeeds, currentFeeds]);

	const onPressRemove = React.useCallback(async () => {
		setCurrentFeeds(currentFeeds.filter((f) => f.id !== feed.id));
	}, [feed, currentFeeds, setCurrentFeeds]);
	const [pressed, setPressed] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const btnProps = {
		onMouseDown: () => setPressed(true),
		onMouseUp: () => setPressed(false),
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
	} satisfies JSX.IntrinsicElements["button"];
	return (
		<Animated.View
			// @ts-expect-error
			style={{
				...styles.itemContainer,
				...pal.border,
			}}
			layout={LinearTransition.duration(100)}
		>
			{feed.type === "timeline" ? (
				<FollowingFeedCard />
			) : (
				<FeedSourceCard
					key={feedUri}
					feedUri={feedUri}
					style={isPinned ? { paddingRight: 8 } : undefined}
					showMinimalPlaceholder
					hideTopBorder={true}
				/>
			)}
			{isPinned ? (
				<>
					<button
						type="button"
						onClick={onPressUp}
						// hitSlop={5}
						style={{
							backgroundColor: pal.viewLight.backgroundColor,
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 10,
							paddingBottom: 10,
							borderRadius: 4,
							marginRight: 8,
							opacity: hovered || pressed ? 0.5 : 1,
						}}
						{...btnProps}
					>
						{/* @ts-expect-error */}
						<FontAwesomeIcon icon="arrow-up" size={14} style={pal.textLight} />
					</button>
					<button
						type="button"
						onClick={onPressDown}
						// hitSlop={5}
						style={{
							backgroundColor: pal.viewLight.backgroundColor,
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 10,
							paddingBottom: 10,
							borderRadius: 4,
							marginRight: 8,
							opacity: hovered || pressed ? 0.5 : 1,
						}}
						{...btnProps}
					>
						{/* @ts-expect-error */}
						<FontAwesomeIcon icon="arrow-down" size={14} style={pal.textLight} />
					</button>
				</>
			) : (
				<button
					type="button"
					onClick={onPressRemove}
					// hitSlop={5}
					style={{
						marginRight: 8,
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 10,
						paddingBottom: 10,
						borderRadius: 4,
						opacity: hovered || focused ? 0.5 : 1,
					}}
					{...btnProps}
				>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon={["far", "trash-can"]} size={19} color={pal.colors.icon} />
				</button>
			)}
			<div style={{ paddingRight: 16 }}>
				<button
					type="button"
					// hitSlop={5}
					onClick={onTogglePinned}
					style={{
						backgroundColor: pal.viewLight.backgroundColor,
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 10,
						paddingBottom: 10,
						borderRadius: 4,
						opacity: hovered || focused ? 0.5 : 1,
					}}
				>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon="thumb-tack" size={14} color={isPinned ? colors.blue3 : pal.colors.icon} />
				</button>
			</div>
		</Animated.View>
	);
}

function FollowingFeedCard() {
	const t = useTheme();
	return (
		<div
			style={{
				...a.flex_row,
				...a.align_center,
				...a.flex_1,

				...{
					paddingLeft: 18,
					paddingRight: 18,
					paddingTop: 20,
					paddingBottom: 20,
				},
			}}
		>
			<div
				style={{
					...a.align_center,
					...a.justify_center,
					...a.rounded_sm,

					...{
						width: 36,
						height: 36,
						backgroundColor: t.palette.primary_500,
						marginRight: 10,
					},
				}}
			>
				<FilterTimeline
					style={{
						width: 22,
						height: 22,
					}}
					fill={t.palette.white}
				/>
			</div>
			<div style={{ flex: 1, flexDirection: "row", gap: 8, alignItems: "center" }}>
				<Text type="lg-medium" style={t.atoms.text} numberOfLines={1}>
					Following
				</Text>
			</div>
		</div>
	);
}

const styles = {
	empty: {
		padding: 20,
		borderRadius: 8,
		margin: 10,
		marginBottom: "unset",
	},
	title: {
		padding: 14,
		paddingTop: 20,
		paddingBottom: 10,
		borderBottomWidth: 1,
	},
	itemContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
	},
	footerText: { padding: "22px 26px" },
} satisfies Record<string, React.CSSProperties>;
