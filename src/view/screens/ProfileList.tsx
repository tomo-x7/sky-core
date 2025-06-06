import { AppBskyGraphDefs, AtUri, type ModerationOpts, RichText as RichTextAPI, moderateUserList } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { ButtonIcon, ButtonText, Button as NewButton } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { PersonPlus_Stroke2_Corner0_Rounded as PersonPlusIcon } from "#/components/icons/Person";
import * as Hider from "#/components/moderation/Hider";
import { ReportDialog, useReportDialogControl } from "#/components/moderation/ReportDialog";
import { usePalette } from "#/lib/hooks/usePalette";
import { useSetTitle } from "#/lib/hooks/useSetTitle";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { ComposeIcon2 } from "#/lib/icons";
import { makeListLink } from "#/lib/routes/links";
import type { RouteParam } from "#/lib/routes/types";
import { shareUrl } from "#/lib/sharing";
import { cleanError } from "#/lib/strings/errors";
import { toShareUrl } from "#/lib/strings/url-helpers";
import { s } from "#/lib/styles";
import { ListHiddenScreen } from "#/screens/List/ListHiddenScreen";
import { listenSoftReset } from "#/state/events";
import { useModalControls } from "#/state/modals";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useListBlockMutation, useListDeleteMutation, useListMuteMutation, useListQuery } from "#/state/queries/list";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { RQKEY as FEED_RQKEY } from "#/state/queries/post-feed";
import {
	type UsePreferencesQueryResponse,
	useAddSavedFeedsMutation,
	usePreferencesQuery,
	useRemoveFeedMutation,
	useUpdateSavedFeedsMutation,
} from "#/state/queries/preferences";
import { useResolveUriQuery } from "#/state/queries/resolve-uri";
import { truncateAndInvalidate } from "#/state/queries/util";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { useComposerControls } from "#/state/shell/composer";
import { ListMembers } from "#/view/com/lists/ListMembers";
import { PagerWithHeader } from "#/view/com/pager/PagerWithHeader";
import { PostFeed } from "#/view/com/posts/PostFeed";
import { ProfileSubpageHeader } from "#/view/com/profile/ProfileSubpageHeader";
import { EmptyState } from "#/view/com/util/EmptyState";
import type { ListRef } from "#/view/com/util/List";
import { LoadingScreen } from "#/view/com/util/LoadingScreen";
import * as Toast from "#/view/com/util/Toast";
import { FAB } from "#/view/com/util/fab/FAB";
import { Button } from "#/view/com/util/forms/Button";
import { type DropdownItem, NativeDropdown } from "#/view/com/util/forms/NativeDropdown";
import { LoadLatestBtn } from "#/view/com/util/load-latest/LoadLatestBtn";

const SECTION_TITLES_CURATE = ["Posts", "People"];

interface SectionRef {
	scrollToTop: () => void;
}

export function ProfileListScreen() {
	return (
		<Layout.Screen>
			<ProfileListScreenInner />
		</Layout.Screen>
	);
}

function ProfileListScreenInner() {
	const { name: handleOrDid, rkey } = useParams<RouteParam<"ProfileList">>();
	const { data: resolvedUri, error: resolveError } = useResolveUriQuery(
		AtUri.make(handleOrDid!, "app.bsky.graph.list", rkey).toString(),
	);
	const { data: preferences } = usePreferencesQuery();
	const { data: list, error: listError } = useListQuery(resolvedUri?.uri);
	const moderationOpts = useModerationOpts();

	if (resolveError) {
		return (
			<Layout.Content>
				<ErrorScreen
					error={`We're sorry, but we were unable to resolve this list. If this persists, please contact the list creator, @${handleOrDid}.`}
				/>
			</Layout.Content>
		);
	}
	if (listError) {
		return (
			<Layout.Content>
				<ErrorScreen error={cleanError(listError)} />
			</Layout.Content>
		);
	}

	return resolvedUri && list && moderationOpts && preferences ? (
		<ProfileListScreenLoaded
			uri={resolvedUri.uri}
			list={list}
			moderationOpts={moderationOpts}
			preferences={preferences}
			rkey={rkey!}
		/>
	) : (
		<LoadingScreen />
	);
}

function ProfileListScreenLoaded({
	uri,
	list,
	moderationOpts,
	preferences,
	rkey,
}: {
	uri: string;
	list: AppBskyGraphDefs.ListView;
	moderationOpts: ModerationOpts;
	preferences: UsePreferencesQueryResponse;
	rkey: string;
}) {
	const queryClient = useQueryClient();
	const { openComposer } = useComposerControls();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { currentAccount } = useSession();
	const feedSectionRef = React.useRef<SectionRef>(null);
	const aboutSectionRef = React.useRef<SectionRef>(null);
	const { openModal } = useModalControls();
	const isCurateList = list.purpose === AppBskyGraphDefs.CURATELIST;
	const isScreenFocused = true; //useIsFocused();
	const isHidden = (list as AppBskyGraphDefs.ListView).labels?.findIndex((l) => l.val === "!hide") !== -1;
	const isOwner = currentAccount?.did === list.creator.did;
	const scrollElRef = useRef();

	const moderation = React.useMemo(() => {
		return moderateUserList(list, moderationOpts);
	}, [list, moderationOpts]);

	useSetTitle(isHidden ? "List Hidden" : list.name);

	useFocusEffect(
		useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onPressAddUser = useCallback(() => {
		openModal({
			name: "list-add-remove-users",
			list,
			onChange() {
				if (isCurateList) {
					truncateAndInvalidate(queryClient, FEED_RQKEY(`list|${list.uri}`));
				}
			},
		});
	}, [openModal, list, isCurateList, queryClient]);

	const onCurrentPageSelected = React.useCallback((index: number) => {
		if (index === 0) {
			feedSectionRef.current?.scrollToTop();
		} else if (index === 1) {
			aboutSectionRef.current?.scrollToTop();
		}
	}, []);

	const renderHeader = useCallback(() => {
		return <Header rkey={rkey} list={list} preferences={preferences} />;
	}, [rkey, list, preferences]);

	if (isCurateList) {
		return (
			<Hider.Outer modui={moderation.ui("contentView")} allowOverride={isOwner}>
				<Hider.Mask>
					<ListHiddenScreen list={list} preferences={preferences} />
				</Hider.Mask>
				<Hider.Content>
					<div style={s.hContentRegion}>
						<PagerWithHeader
							items={SECTION_TITLES_CURATE}
							isHeaderReady={true}
							renderHeader={renderHeader}
							onCurrentPageSelected={onCurrentPageSelected}
						>
							{({ headerHeight, scrollElRef, isFocused }) => (
								<FeedSection
									ref={feedSectionRef}
									feed={`list|${uri}`}
									scrollElRef={scrollElRef as ListRef}
									headerHeight={headerHeight}
									isFocused={isScreenFocused && isFocused}
									isOwner={isOwner}
									onPressAddUser={onPressAddUser}
								/>
							)}
							{({ headerHeight, scrollElRef }) => (
								<AboutSection
									ref={aboutSectionRef}
									scrollElRef={scrollElRef as ListRef}
									list={list}
									onPressAddUser={onPressAddUser}
									headerHeight={headerHeight}
								/>
							)}
						</PagerWithHeader>
						<FAB
							onPress={() => openComposer({})}
							icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={{ color: "white" }} />}
						/>
					</div>
				</Hider.Content>
			</Hider.Outer>
		);
	}
	return (
		<Hider.Outer modui={moderation.ui("contentView")} allowOverride={isOwner}>
			<Hider.Mask>
				<ListHiddenScreen list={list} preferences={preferences} />
			</Hider.Mask>
			<Hider.Content>
				<div style={s.hContentRegion}>
					<Layout.Center>{renderHeader()}</Layout.Center>
					<AboutSection
						list={list}
						scrollElRef={scrollElRef as ListRef}
						onPressAddUser={onPressAddUser}
						headerHeight={0}
					/>
					<FAB
						onPress={() => openComposer({})}
						icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={{ color: "white" }} />}
					/>
				</div>
			</Hider.Content>
		</Hider.Outer>
	);
}

function Header({
	rkey,
	list,
	preferences,
}: {
	rkey: string;
	list: AppBskyGraphDefs.ListView;
	preferences: UsePreferencesQueryResponse;
}) {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");
	const { currentAccount } = useSession();
	const reportDialogControl = useReportDialogControl();
	const { openModal } = useModalControls();
	const listMuteMutation = useListMuteMutation();
	const listBlockMutation = useListBlockMutation();
	const listDeleteMutation = useListDeleteMutation();
	const isCurateList = list.purpose === "app.bsky.graph.defs#curatelist";
	const isModList = list.purpose === "app.bsky.graph.defs#modlist";
	const isBlocking = !!list.viewer?.blocked;
	const isMuting = !!list.viewer?.muted;
	const isOwner = list.creator.did === currentAccount?.did;
	const navigate = useNavigate();

	const { mutateAsync: addSavedFeeds, isPending: isAddSavedFeedPending } = useAddSavedFeedsMutation();
	const { mutateAsync: removeSavedFeed, isPending: isRemovePending } = useRemoveFeedMutation();
	const { mutateAsync: updateSavedFeeds, isPending: isUpdatingSavedFeeds } = useUpdateSavedFeedsMutation();

	const isPending = isAddSavedFeedPending || isRemovePending || isUpdatingSavedFeeds;

	const deleteListPromptControl = useDialogControl();
	const subscribeMutePromptControl = useDialogControl();
	const subscribeBlockPromptControl = useDialogControl();

	const savedFeedConfig = preferences?.savedFeeds?.find((f) => f.value === list.uri);
	const isPinned = Boolean(savedFeedConfig?.pinned);

	const onTogglePinned = React.useCallback(async () => {
		try {
			if (savedFeedConfig) {
				const pinned = !savedFeedConfig.pinned;
				await updateSavedFeeds([
					{
						...savedFeedConfig,
						pinned,
					},
				]);
				Toast.show(pinned ? "Pinned to your feeds" : "Unpinned from your feeds");
			} else {
				await addSavedFeeds([
					{
						type: "list",
						value: list.uri,
						pinned: true,
					},
				]);
				Toast.show("Saved to your feeds");
			}
		} catch (e) {
			Toast.show("There was an issue contacting the server", "xmark");
			console.error("Failed to toggle pinned feed", { message: e });
		}
	}, [addSavedFeeds, updateSavedFeeds, list.uri, savedFeedConfig]);

	const onRemoveFromSavedFeeds = React.useCallback(async () => {
		if (!savedFeedConfig) return;
		try {
			await removeSavedFeed(savedFeedConfig);
			Toast.show("Removed from your feeds");
		} catch (e) {
			Toast.show("There was an issue contacting the server", "xmark");
			console.error("Failed to remove pinned list", { message: e });
		}
	}, [removeSavedFeed, savedFeedConfig]);

	const onSubscribeMute = useCallback(async () => {
		try {
			await listMuteMutation.mutateAsync({ uri: list.uri, mute: true });
			Toast.show("List muted");
		} catch {
			Toast.show("There was an issue. Please check your internet connection and try again.");
		}
	}, [list, listMuteMutation]);

	const onUnsubscribeMute = useCallback(async () => {
		try {
			await listMuteMutation.mutateAsync({ uri: list.uri, mute: false });
			Toast.show("List unmuted");
		} catch {
			Toast.show("There was an issue. Please check your internet connection and try again.");
		}
	}, [list, listMuteMutation]);

	const onSubscribeBlock = useCallback(async () => {
		try {
			await listBlockMutation.mutateAsync({ uri: list.uri, block: true });
			Toast.show("List blocked");
		} catch {
			Toast.show("There was an issue. Please check your internet connection and try again.");
		}
	}, [list, listBlockMutation]);

	const onUnsubscribeBlock = useCallback(async () => {
		try {
			await listBlockMutation.mutateAsync({ uri: list.uri, block: false });
			Toast.show("List unblocked");
		} catch {
			Toast.show("There was an issue. Please check your internet connection and try again.");
		}
	}, [list, listBlockMutation]);

	const onPressEdit = useCallback(() => {
		openModal({
			name: "create-or-edit-list",
			list,
		});
	}, [openModal, list]);

	const onPressDelete = useCallback(async () => {
		await listDeleteMutation.mutateAsync({ uri: list.uri });

		if (savedFeedConfig) {
			await removeSavedFeed(savedFeedConfig);
		}

		Toast.show("List deleted");
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	}, [list, listDeleteMutation, navigate, removeSavedFeed, savedFeedConfig]);

	const onPressReport = useCallback(() => {
		reportDialogControl.open();
	}, [reportDialogControl]);

	const onPressShare = useCallback(() => {
		const url = toShareUrl(`/profile/${list.creator.did}/lists/${rkey}`);
		shareUrl(url);
	}, [list, rkey]);

	const dropdownItems: DropdownItem[] = useMemo(() => {
		const items: DropdownItem[] = [
			{
				label: "Copy link to list",
				onPress: onPressShare,
				icon: {
					ios: {
						name: "square.and.arrow.up",
					},
					android: "",
					web: "share",
				},
			},
		];

		if (savedFeedConfig) {
			items.push({
				label: "Remove from my feeds",
				onPress: onRemoveFromSavedFeeds,
				icon: {
					ios: {
						name: "trash",
					},
					android: "",
					web: ["far", "trash-can"],
				},
			});
		}

		if (isOwner) {
			items.push({ label: "separator" });
			items.push({
				label: "Edit list details",
				onPress: onPressEdit,
				icon: {
					ios: {
						name: "pencil",
					},
					android: "",
					web: "pen",
				},
			});
			items.push({
				label: "Delete List",
				onPress: deleteListPromptControl.open,
				icon: {
					ios: {
						name: "trash",
					},
					android: "",
					web: ["far", "trash-can"],
				},
			});
		} else {
			items.push({ label: "separator" });
			items.push({
				label: "Report List",
				onPress: onPressReport,
				icon: {
					ios: {
						name: "exclamationmark.triangle",
					},
					android: "",
					web: "circle-exclamation",
				},
			});
		}
		if (isModList && isPinned) {
			items.push({ label: "separator" });
			items.push({
				label: "Unpin moderation list",
				onPress: isPending || !savedFeedConfig ? undefined : () => removeSavedFeed(savedFeedConfig),
				icon: {
					ios: {
						name: "pin",
					},
					android: "",
					web: "thumbtack",
				},
			});
		}
		if (isCurateList && (isBlocking || isMuting)) {
			items.push({ label: "separator" });

			if (isMuting) {
				items.push({
					label: "Un-mute list",
					onPress: onUnsubscribeMute,
					icon: {
						ios: {
							name: "eye",
						},
						android: "",
						web: "eye",
					},
				});
			}

			if (isBlocking) {
				items.push({
					label: "Un-block list",
					onPress: onUnsubscribeBlock,
					icon: {
						ios: {
							name: "person.fill.xmark",
						},
						android: "",
						web: "user-slash",
					},
				});
			}
		}
		return items;
	}, [
		onPressShare,
		isOwner,
		isModList,
		isPinned,
		isCurateList,
		onPressEdit,
		deleteListPromptControl.open,
		onPressReport,
		isPending,
		isBlocking,
		isMuting,
		onUnsubscribeMute,
		onUnsubscribeBlock,
		removeSavedFeed,
		savedFeedConfig,
		onRemoveFromSavedFeeds,
	]);

	const subscribeDropdownItems: DropdownItem[] = useMemo(() => {
		return [
			{
				label: "Mute accounts",
				onPress: subscribeMutePromptControl.open,
				icon: {
					ios: {
						name: "speaker.slash",
					},
					android: "",
					web: "user-slash",
				},
			},
			{
				label: "Block accounts",
				onPress: subscribeBlockPromptControl.open,
				icon: {
					ios: {
						name: "person.fill.xmark",
					},
					android: "",
					web: "ban",
				},
			},
		];
	}, [subscribeMutePromptControl.open, subscribeBlockPromptControl.open]);

	const descriptionRT = useMemo(
		() =>
			list.description
				? new RichTextAPI({
						text: list.description,
						facets: list.descriptionFacets,
					})
				: undefined,
		[list],
	);

	return (
		<>
			<ProfileSubpageHeader
				href={makeListLink(list.creator.handle || list.creator.did || "", rkey)}
				title={list.name}
				avatar={list.avatar}
				isOwner={list.creator.did === currentAccount?.did}
				creator={list.creator}
				purpose={list.purpose}
				avatarType="list"
			>
				<ReportDialog
					control={reportDialogControl}
					subject={{
						...list,
						$type: "app.bsky.graph.defs#listView",
					}}
				/>
				{isCurateList ? (
					<Button
						type={isPinned ? "default" : "inverted"}
						label={isPinned ? "Unpin" : "Pin to home"}
						onPress={onTogglePinned}
						disabled={isPending}
					/>
				) : isModList ? (
					isBlocking ? (
						<Button type="default" label={"Unblock"} onPress={onUnsubscribeBlock} />
					) : isMuting ? (
						<Button type="default" label={"Unmute"} onPress={onUnsubscribeMute} />
					) : (
						<NativeDropdown
							items={subscribeDropdownItems}
							accessibilityLabel={"Subscribe to this list"}
							accessibilityHint=""
						>
							<div
								style={{
									...palInverted.view,
									...styles.btn,
								}}
							>
								<Text style={palInverted.text}>Subscribe</Text>
							</div>
						</NativeDropdown>
					)
				) : null}
				<NativeDropdown items={dropdownItems} accessibilityLabel={"More options"} accessibilityHint="">
					<div
						style={{
							...pal.viewLight,
							...styles.btn,
						}}
					>
						{/* @ts-expect-error */}
						<FontAwesomeIcon icon="ellipsis" size={20} color={pal.colors.text} />
					</div>
				</NativeDropdown>

				<Prompt.Basic
					control={deleteListPromptControl}
					title={"Delete this list?"}
					description={`If you delete this list, you won't be able to recover it.`}
					onConfirm={onPressDelete}
					confirmButtonCta={"Delete"}
					confirmButtonColor="negative"
				/>

				<Prompt.Basic
					control={subscribeMutePromptControl}
					title={"Mute these accounts?"}
					description={
						"Muting is private. Muted accounts can interact with you, but you will not see their posts or receive notifications from them."
					}
					onConfirm={onSubscribeMute}
					confirmButtonCta={"Mute list"}
				/>

				<Prompt.Basic
					control={subscribeBlockPromptControl}
					title={"Block these accounts?"}
					description={
						"Blocking is public. Blocked accounts cannot reply in your threads, mention you, or otherwise interact with you."
					}
					onConfirm={onSubscribeBlock}
					confirmButtonCta={"Block list"}
					confirmButtonColor="negative"
				/>
			</ProfileSubpageHeader>
			{descriptionRT ? (
				<div
					style={{
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 8,
						paddingBottom: 8,
						gap: 12,
					}}
				>
					<RichText
						value={descriptionRT}
						style={{
							fontSize: 16,
							letterSpacing: 0,
							lineHeight: 1.3,
						}}
					/>
				</div>
			) : null}
		</>
	);
}

interface FeedSectionProps {
	feed: FeedDescriptor;
	headerHeight: number;
	scrollElRef: ListRef;
	isFocused: boolean;
	isOwner: boolean;
	onPressAddUser: () => void;
}
const FeedSection = React.forwardRef<SectionRef, FeedSectionProps>(function FeedSectionImpl(
	{ feed, scrollElRef, headerHeight, isFocused, isOwner, onPressAddUser },
	ref,
) {
	const queryClient = useQueryClient();
	const [hasNew, setHasNew] = React.useState(false);
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const isScreenFocused = true; //useIsFocused();

	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
		queryClient.resetQueries({ queryKey: FEED_RQKEY(feed) });
		setHasNew(false);
	}, [scrollElRef, headerHeight, queryClient, feed]);
	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	React.useEffect(() => {
		if (!isScreenFocused) {
			return;
		}
		return listenSoftReset(onScrollToTop);
	}, [onScrollToTop]);

	const renderPostsEmpty = useCallback(() => {
		return (
			<div
				style={{
					gap: 20,
					alignItems: "center",
				}}
			>
				<EmptyState icon="hashtag" message={"This feed is empty."} />
				{isOwner && (
					<NewButton
						label={"Start adding people"}
						onPress={onPressAddUser}
						color="primary"
						size="small"
						variant="solid"
					>
						<ButtonIcon icon={PersonPlusIcon} />
						<ButtonText>Start adding people!</ButtonText>
					</NewButton>
				)}
			</div>
		);
	}, [onPressAddUser, isOwner]);

	return (
		<div>
			<PostFeed
				enabled={isFocused}
				feed={feed}
				pollInterval={60e3}
				disablePoll={hasNew}
				scrollElRef={scrollElRef}
				onHasNew={setHasNew}
				onScrolledDownChange={setIsScrolledDown}
				renderEmptyState={renderPostsEmpty}
				headerOffset={headerHeight}
			/>
			{(isScrolledDown || hasNew) && (
				<LoadLatestBtn onPress={onScrollToTop} label={"Load new posts"} showIndicator={hasNew} />
			)}
		</div>
	);
});

interface AboutSectionProps {
	list: AppBskyGraphDefs.ListView;
	onPressAddUser: () => void;
	headerHeight: number;
	scrollElRef: ListRef;
}
const AboutSection = React.forwardRef<SectionRef, AboutSectionProps>(function AboutSectionImpl(
	{ list, onPressAddUser, headerHeight, scrollElRef },
	ref,
) {
	const { currentAccount } = useSession();
	const { isMobile } = useWebMediaQueries();
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const isOwner = list.creator.did === currentAccount?.did;

	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
	}, [scrollElRef, headerHeight]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const renderHeader = React.useCallback(() => {
		if (!isOwner) {
			return <div />;
		}
		if (isMobile) {
			return (
				<div
					style={{
						paddingLeft: 8,
						paddingRight: 8,
						paddingTop: 8,
						paddingBottom: 8,
					}}
				>
					<NewButton
						label={"Add a user to this list"}
						onPress={onPressAddUser}
						color="primary"
						size="small"
						variant="outline"
						style={{ paddingTop: 12, paddingBottom: 12 }}
					>
						<ButtonIcon icon={PersonPlusIcon} />
						<ButtonText>Add people</ButtonText>
					</NewButton>
				</div>
			);
		}
		return (
			<div
				style={{
					paddingLeft: 16,
					paddingRight: 16,
					paddingTop: 12,
					paddingBottom: 12,
					flexDirection: "row-reverse",
				}}
			>
				<NewButton
					label={"Add a user to this list"}
					onPress={onPressAddUser}
					color="primary"
					size="small"
					variant="ghost"
					style={{ paddingTop: 8, paddingBottom: 8 }}
				>
					<ButtonIcon icon={PersonPlusIcon} />
					<ButtonText>Add people</ButtonText>
				</NewButton>
			</div>
		);
	}, [isOwner, onPressAddUser, isMobile]);

	const renderEmptyState = useCallback(() => {
		return (
			<div
				style={{
					gap: 20,
					alignItems: "center",
				}}
			>
				<EmptyState icon="users-slash" message={"This list is empty."} />
				{isOwner && (
					<NewButton
						label={"Start adding people"}
						onPress={onPressAddUser}
						color="primary"
						size="small"
						variant="solid"
					>
						<ButtonIcon icon={PersonPlusIcon} />
						<ButtonText>Start adding people!</ButtonText>
					</NewButton>
				)}
			</div>
		);
	}, [onPressAddUser, isOwner]);

	return (
		<div>
			<ListMembers
				list={list.uri}
				scrollElRef={scrollElRef}
				renderHeader={renderHeader}
				renderEmptyState={renderEmptyState}
				headerOffset={headerHeight}
				onScrolledDownChange={setIsScrolledDown}
			/>
			{isScrolledDown && <LoadLatestBtn onPress={onScrollToTop} label={"Scroll to top"} showIndicator={false} />}
		</div>
	);
});

function ErrorScreen({ error }: { error: string }) {
	const pal = usePalette("default");
	const navigate = useNavigate();
	const onPressBack = useCallback(() => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	}, [navigate]);

	return (
		<div
			style={{
				...pal.view,
				...pal.border,

				...{
					paddingLeft: 18,
					paddingRight: 18,
					paddingTop: 14,
					paddingBottom: 14,
					borderTopWidth: 1,
				},
			}}
		>
			<Text
				type="title-lg"
				style={{
					...pal.text,
					...s.mb10,
				}}
			>
				Could not load list
			</Text>
			<Text
				type="md"
				style={{
					...pal.text,
					...s.mb20,
				}}
			>
				{error}
			</Text>
			<div style={{ flexDirection: "row" }}>
				<Button
					type="default"
					accessibilityLabel={"Go back"}
					accessibilityHint={"Returns to previous page"}
					onPress={onPressBack}
					style={{ flexShrink: 1 }}
				>
					<Text type="button" style={pal.text}>
						Go Back
					</Text>
				</Button>
			</div>
		</div>
	);
}

const styles = {
	btn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		padding: "7px 14px",
		borderRadius: 50,
		marginLeft: 6,
	},
} satisfies Record<string, React.CSSProperties>;
