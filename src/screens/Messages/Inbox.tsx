import type { ChatBskyConvoDefs, ChatBskyConvoListConvos } from "@atproto/api";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { ListFooter } from "#/components/Lists";
import { Text } from "#/components/Typography";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { useRefreshOnFocus } from "#/components/hooks/useRefreshOnFocus";
import { ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeftIcon } from "#/components/icons/Arrow";
import { ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as RetryIcon } from "#/components/icons/ArrowRotateCounterClockwise";
import { Check_Stroke2_Corner0_Rounded as CheckIcon } from "#/components/icons/Check";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfoIcon } from "#/components/icons/CircleInfo";
import { Message_Stroke2_Corner0_Rounded as MessageIcon } from "#/components/icons/Message";
import { useAppState } from "#/lib/hooks/useAppState";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { cleanError } from "#/lib/strings/errors";
import { MESSAGE_SCREEN_POLL_INTERVAL } from "#/state/messages/convo/const";
import { useMessagesEventBus } from "#/state/messages/events";
import { useLeftConvos } from "#/state/queries/messages/leave-conversation";
import { useListConvosQuery } from "#/state/queries/messages/list-conversations";
import { useUpdateAllRead } from "#/state/queries/messages/update-all-read";
import { List } from "#/view/com/util/List";
import { ChatListLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import * as Toast from "#/view/com/util/Toast";
import { FAB } from "#/view/com/util/fab/FAB";
import { RequestListItem } from "./components/RequestListItem";

export function MessagesInboxScreen() {
	const { gtTablet } = useBreakpoints();

	const listConvosQuery = useListConvosQuery({ status: "request" });
	const { data } = listConvosQuery;

	const leftConvos = useLeftConvos();

	const conversations = useMemo(() => {
		if (data?.pages) {
			const convos = data.pages
				.flatMap((page) => page.convos)
				// filter out convos that are actively being left
				.filter((convo) => !leftConvos.includes(convo.id));

			return convos;
		}
		return [];
	}, [data, leftConvos]);

	const hasUnreadConvos = useMemo(() => {
		return conversations.some((conversation) => conversation.unreadCount > 0);
	}, [conversations]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content align={gtTablet ? "left" : "platform"}>
					<Layout.Header.TitleText>Chat requests</Layout.Header.TitleText>
				</Layout.Header.Content>
				{hasUnreadConvos && gtTablet ? <MarkAsReadHeaderButton /> : <Layout.Header.Slot />}
			</Layout.Header.Outer>
			<RequestList
				listConvosQuery={listConvosQuery}
				conversations={conversations}
				hasUnreadConvos={hasUnreadConvos}
			/>
		</Layout.Screen>
	);
}

function RequestList({
	listConvosQuery,
	conversations,
	hasUnreadConvos,
}: {
	listConvosQuery: UseInfiniteQueryResult<InfiniteData<ChatBskyConvoListConvos.OutputSchema>, Error>;
	conversations: ChatBskyConvoDefs.ConvoView[];
	hasUnreadConvos: boolean;
}) {
	const t = useTheme();

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

	const initialNumToRender = useInitialNumToRender({ minItemHeight: 130 });
	const [isPTRing, setIsPTRing] = useState(false);
	const navigate = useNavigate();

	const { isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error, refetch } = listConvosQuery;

	useRefreshOnFocus(refetch);

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh conversations", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage || isError) return;
		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more conversations", { message: err });
		}
	}, [isFetchingNextPage, hasNextPage, isError, fetchNextPage]);

	if (conversations.length < 1) {
		return (
			<Layout.Center>
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
									<CircleInfoIcon width={48} fill={t.atoms.text_contrast_low.color} />
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
										<ButtonIcon icon={RetryIcon} position="right" />
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
									<MessageIcon width={48} fill={t.palette.primary_500} />
									<Text
										style={{
											paddingTop: 12,
											paddingBottom: 8,
											fontSize: 22,
											letterSpacing: 0,
											fontWeight: "600",
										}}
									>
										Inbox zero!
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
										You don't have any chat requests at the moment.
									</Text>
									<Button
										variant="solid"
										color="secondary"
										size="small"
										label={"Go back"}
										onPress={() => {
											if (history.length > 1) {
												navigate(-1);
											} else {
												// navigation.navigate("Messages", { animation: "pop" });
												navigate("/messages", { state: { animation: "pop" } });
											}
										}}
									>
										<ButtonIcon icon={ArrowLeftIcon} />
										<ButtonText>Back to Chats</ButtonText>
									</Button>
								</div>
							</>
						)}
					</>
				)}
			</Layout.Center>
		);
	}

	return (
		<>
			<List
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
			{hasUnreadConvos && <MarkAllReadFAB />}
		</>
	);
}

function keyExtractor(item: ChatBskyConvoDefs.ConvoView) {
	return item.id;
}

function renderItem({ item }: { item: ChatBskyConvoDefs.ConvoView }) {
	return <RequestListItem convo={item} />;
}

function MarkAllReadFAB() {
	const t = useTheme();
	const { mutate: markAllRead } = useUpdateAllRead("request", {
		onMutate: () => {
			Toast.show("Marked all as read", "check");
		},
		onError: () => {
			Toast.show("Failed to mark all requests as read", "xmark");
		},
	});

	return <FAB onPress={() => markAllRead()} icon={<CheckIcon size="lg" fill={t.palette.white} />} />;
}

function MarkAsReadHeaderButton() {
	const { mutate: markAllRead } = useUpdateAllRead("request", {
		onMutate: () => {
			Toast.show("Marked all as read", "check");
		},
		onError: () => {
			Toast.show("Failed to mark all requests as read", "xmark");
		},
	});

	return (
		<Button label={"Mark all as read"} size="small" color="secondary" variant="solid" onPress={() => markAllRead()}>
			<ButtonIcon icon={CheckIcon} />
			<ButtonText>Mark all as read</ButtonText>
		</Button>
	);
}
