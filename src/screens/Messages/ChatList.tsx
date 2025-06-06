import type { ChatBskyActorDefs, ChatBskyConvoDefs } from "@atproto/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { type DialogControlProps, useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import { ListFooter } from "#/components/Lists";
import { Text } from "#/components/Typography";
import { NewChat } from "#/components/dms/dialogs/NewChatDialog";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { useRefreshOnFocus } from "#/components/hooks/useRefreshOnFocus";
import { ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as Retry } from "#/components/icons/ArrowRotateCounterClockwise";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { Message_Stroke2_Corner0_Rounded as Message } from "#/components/icons/Message";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { SettingsSliderVertical_Stroke2_Corner0_Rounded as SettingsSlider } from "#/components/icons/SettingsSlider";
import { useAppState } from "#/lib/hooks/useAppState";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { listenSoftReset } from "#/state/events";
import { MESSAGE_SCREEN_POLL_INTERVAL } from "#/state/messages/convo/const";
import { useMessagesEventBus } from "#/state/messages/events";
import { useLeftConvos } from "#/state/queries/messages/leave-conversation";
import { useListConvosQuery } from "#/state/queries/messages/list-conversations";
import { useSession } from "#/state/session";
import { List, type ListRef } from "#/view/com/util/List";
import { ChatListLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { ChatListItem } from "./components/ChatListItem";
import { InboxPreview } from "./components/InboxPreview";

type ListItem =
	| {
			type: "INBOX";
			count: number;
			profiles: ChatBskyActorDefs.ProfileViewBasic[];
	  }
	| {
			type: "CONVERSATION";
			conversation: ChatBskyConvoDefs.ConvoView;
	  };

function renderItem({ item }: { item: ListItem }) {
	switch (item.type) {
		case "INBOX":
			return <InboxPreview count={item.count} profiles={item.profiles} />;
		case "CONVERSATION":
			return <ChatListItem convo={item.conversation} />;
	}
}

function keyExtractor(item: ListItem) {
	return item.type === "INBOX" ? "INBOX" : item.conversation.id;
}

export function MessagesScreen() {
	const t = useTheme();
	const { currentAccount } = useSession();
	const newChatControl = useDialogControl();
	const scrollElRef: ListRef = useRef(null);
	const pushToConversation = undefined; //route.params?.pushToConversation;
	const navigation = useNavigate();

	// Whenever we have `pushToConversation` set, it means we pressed a notification for a chat without being on
	// this tab. We should immediately push to the conversation after pressing the notification.
	// After we push, reset with `setParams` so that this effect will fire next time we press a notification, even if
	// the conversation is the same as before
	useEffect(() => {
		if (pushToConversation) {
			navigation(`/messages/${pushToConversation}`);
			// navigation.navigate("MessagesConversation", {
			// 	conversation: pushToConversation,
			// });
			// navigation.setParams({ pushToConversation: undefined });
		}
	}, [navigation, pushToConversation]);

	// Request the poll interval to be 10s (or whatever the MESSAGE_SCREEN_POLL_INTERVAL is set to in the future)
	// but only when the screen is active
	const messagesBus = useMessagesEventBus();
	const state = useAppState();
	const isActive = state === "active";
	useFocusEffect(
		useCallback(() => {
			if (isActive) {
				const unsub = messagesBus.requestPollInterval(MESSAGE_SCREEN_POLL_INTERVAL);
				return () => unsub();
			}
		}, [messagesBus, isActive]),
	);

	const initialNumToRender = useInitialNumToRender({ minItemHeight: 80 });
	const [isPTRing, setIsPTRing] = useState(false);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error, refetch } =
		useListConvosQuery({ status: "accepted" });

	const { data: inboxData, refetch: refetchInbox } = useListConvosQuery({
		status: "request",
	});

	useRefreshOnFocus(refetch);
	useRefreshOnFocus(refetchInbox);

	const leftConvos = useLeftConvos();

	const inboxPreviewConvos = useMemo(() => {
		const inbox =
			inboxData?.pages
				.flatMap((page) => page.convos)
				.filter((convo) => !leftConvos.includes(convo.id) && !convo.muted && convo.unreadCount > 0) ?? [];

		return inbox.map((x) => x.members.find((y) => y.did !== currentAccount?.did)).filter((x) => !!x);
	}, [inboxData, leftConvos, currentAccount?.did]);

	const conversations = useMemo(() => {
		if (data?.pages) {
			const conversations = data.pages
				.flatMap((page) => page.convos)
				// filter out convos that are actively being left
				.filter((convo) => !leftConvos.includes(convo.id));

			return [
				{
					type: "INBOX",
					count: inboxPreviewConvos.length,
					profiles: inboxPreviewConvos.slice(0, 3),
				},
				...conversations.map(
					(convo) =>
						({
							type: "CONVERSATION",
							conversation: convo,
						}) as const,
				),
			] satisfies ListItem[];
		}
		return [];
	}, [data, leftConvos, inboxPreviewConvos]);

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await Promise.all([refetch(), refetchInbox()]);
		} catch (err) {
			console.error("Failed to refresh conversations", { message: err });
		}
		setIsPTRing(false);
	}, [refetch, refetchInbox]);

	const onEndReached = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more conversations", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	const onNewChat = useCallback(
		(conversation: string) => {
			// navigation.navigate("MessagesConversation", { conversation })
			navigation(`/messages/${conversation}`);
		},
		[navigation],
	);

	const onSoftReset = useCallback(async () => {
		(scrollElRef.current as HTMLElement)?.scrollTo({
			top: 0,
		});
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh conversations", { message: err });
		}
	}, [refetch]);

	// const isScreenFocused = useIsFocused();
	// TODO
	const isScreenFocused = true;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!isScreenFocused) {
			return;
		}
		return listenSoftReset(onSoftReset);
	}, [onSoftReset, isScreenFocused]);

	// Will always have 1 item - the inbox button
	if (conversations.length < 2) {
		return (
			<Layout.Screen>
				<Header newChatControl={newChatControl} />
				<Layout.Center>
					<InboxPreview count={inboxPreviewConvos.length} profiles={inboxPreviewConvos} />
					{isLoading ? (
						<ChatListLoadingPlaceholder />
					) : (
						<>
							{isError ? (
								<>
									<div
										style={{
											paddingTop: 28,
											alignItems: "center",
										}}
									>
										<CircleInfo width={48} fill={t.atoms.text_contrast_low.color} />
										<Text
											style={{
												paddingTop: 12,
												paddingBottom: 8,
												fontSize: 22,
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
												paddingBottom: 20,
												textAlign: "center",
												lineHeight: 1.3,
												...t.atoms.text_contrast_medium,
												...{ maxWidth: 360 },
											}}
										>
											{cleanError(error) || "Failed to load conversations"}
										</Text>

										<Button
											label={"Reload conversations"}
											size="small"
											color="secondary_inverted"
											variant="solid"
											onPress={() => refetch()}
										>
											<ButtonText>Retry</ButtonText>
											<ButtonIcon icon={Retry} position="right" />
										</Button>
									</div>
								</>
							) : (
								<>
									<div
										style={{
											paddingTop: 28,
											alignItems: "center",
										}}
									>
										<Message width={48} fill={t.palette.primary_500} />
										<Text
											style={{
												paddingTop: 12,
												paddingBottom: 8,
												fontSize: 22,
												letterSpacing: 0,
												fontWeight: "600",
											}}
										>
											Nothing here
										</Text>
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												paddingBottom: 20,
												textAlign: "center",
												lineHeight: 1.3,
												...t.atoms.text_contrast_medium,
											}}
										>
											You have no conversations yet. Start one!
										</Text>
									</div>
								</>
							)}
						</>
					)}
				</Layout.Center>
				{!isLoading && !isError && <NewChat onNewChat={onNewChat} control={newChatControl} />}
			</Layout.Screen>
		);
	}

	return (
		<Layout.Screen>
			<Header newChatControl={newChatControl} />
			<NewChat onNewChat={onNewChat} control={newChatControl} />
			<List
				ref={scrollElRef}
				data={conversations}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				refreshing={isPTRing}
				onRefresh={onRefresh}
				onEndReached={onEndReached}
				ListFooterComponent={
					<ListFooter
						isFetchingNextPage={isFetchingNextPage}
						error={cleanError(error)}
						onRetry={fetchNextPage}
						style={{ borderColor: "transparent" }}
						hasNextPage={hasNextPage}
					/>
				}
				onEndReachedThreshold={0}
				initialNumToRender={initialNumToRender}
				// windowSize={11}
				desktopFixedHeight
				sideBorders={false}
			/>
		</Layout.Screen>
	);
}

function Header({ newChatControl }: { newChatControl: DialogControlProps }) {
	const { gtMobile } = useBreakpoints();

	const settingsLink = (
		<Link
			to="/messages/settings"
			label={"Chat settings"}
			size="small"
			variant="ghost"
			color="secondary"
			shape="square"
			style={{ justifyContent: "center" }}
		>
			<ButtonIcon icon={SettingsSlider} size="md" />
		</Link>
	);

	return (
		<Layout.Header.Outer>
			{gtMobile ? (
				<>
					<Layout.Header.Content>
						<Layout.Header.TitleText>Chats</Layout.Header.TitleText>
					</Layout.Header.Content>

					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
					>
						{settingsLink}
						<Button
							label={"New chat"}
							color="primary"
							size="small"
							variant="solid"
							onPress={newChatControl.open}
						>
							<ButtonIcon icon={Plus} position="left" />
							<ButtonText>New chat</ButtonText>
						</Button>
					</div>
				</>
			) : (
				<>
					<Layout.Header.MenuButton />
					<Layout.Header.Content>
						<Layout.Header.TitleText>Chats</Layout.Header.TitleText>
					</Layout.Header.Content>
					<Layout.Header.Slot>{settingsLink}</Layout.Header.Slot>
				</>
			)}
		</Layout.Header.Outer>
	);
}
