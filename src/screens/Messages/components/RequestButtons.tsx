import { type ChatBskyActorDefs, ChatBskyConvoDefs } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { Button, ButtonIcon, type ButtonProps, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import * as Menu from "#/components/Menu";
import { ReportDialog } from "#/components/dms/ReportDialog";
import { CircleX_Stroke2_Corner0_Rounded } from "#/components/icons/CircleX";
import { Flag_Stroke2_Corner0_Rounded as FlagIcon } from "#/components/icons/Flag";
import { PersonX_Stroke2_Corner0_Rounded as PersonXIcon } from "#/components/icons/Person";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useAcceptConversation } from "#/state/queries/messages/accept-conversation";
import { precacheConvoQuery } from "#/state/queries/messages/conversation";
import { useLeaveConvo } from "#/state/queries/messages/leave-conversation";
import { useProfileBlockMutationQueue } from "#/state/queries/profile";
import * as Toast from "#/view/com/util/Toast";

export function RejectMenu({
	convo,
	profile,
	size = "tiny",
	variant = "outline",
	color = "secondary",
	label,
	showDeleteConvo,
	currentScreen,
	...props
}: Omit<ButtonProps, "onPress" | "children" | "label"> & {
	label?: string;
	convo: ChatBskyConvoDefs.ConvoView;
	profile: ChatBskyActorDefs.ProfileViewBasic;
	showDeleteConvo?: boolean;
	currentScreen: "list" | "conversation";
}) {
	const shadowedProfile = useProfileShadow(profile);
	const navigate = useNavigate();
	const { mutate: leaveConvo } = useLeaveConvo(convo.id, {
		onMutate: () => {
			if (currentScreen === "conversation") {
				// navigation.dispatch(StackActions.pop());
				navigate(-1);
			}
		},
		onError: () => {
			Toast.show("Failed to delete chat", "xmark");
		},
	});
	const [queueBlock] = useProfileBlockMutationQueue(shadowedProfile);

	const onPressDelete = useCallback(() => {
		Toast.show("Chat deleted", "check");
		leaveConvo();
	}, [leaveConvo]);

	const onPressBlock = useCallback(() => {
		Toast.show("Account blocked", "check");
		// block and also delete convo
		queueBlock();
		leaveConvo();
	}, [queueBlock, leaveConvo]);

	const reportControl = useDialogControl();

	const lastMessage = ChatBskyConvoDefs.isMessageView(convo.lastMessage) ? convo.lastMessage : null;

	return (
		<>
			<Menu.Root>
				<Menu.Trigger label={"Reject chat request"}>
					{({ props: triggerProps }) => (
						<Button
							{...triggerProps}
							{...props}
							style={{ flex: 1 }}
							color={color}
							variant={variant}
							size={size}
						>
							<ButtonText>{label || "Reject"}</ButtonText>
						</Button>
					)}
				</Menu.Trigger>
				<Menu.Outer>
					<Menu.Group>
						{showDeleteConvo && (
							<Menu.Item label={"Delete conversation"} onPress={onPressDelete}>
								<Menu.ItemText>Delete conversation</Menu.ItemText>
								<Menu.ItemIcon icon={CircleX_Stroke2_Corner0_Rounded} />
							</Menu.Item>
						)}
						<Menu.Item label={"Block account"} onPress={onPressBlock}>
							<Menu.ItemText>Block account</Menu.ItemText>
							<Menu.ItemIcon icon={PersonXIcon} />
						</Menu.Item>
						{/* note: last message will almost certainly be defined, since you can't
              delete messages for other people andit's impossible for a convo on this
              screen to have a message sent by you */}
						{lastMessage && (
							<Menu.Item label={"Report conversation"} onPress={reportControl.open}>
								<Menu.ItemText>Report conversation</Menu.ItemText>
								<Menu.ItemIcon icon={FlagIcon} />
							</Menu.Item>
						)}
					</Menu.Group>
				</Menu.Outer>
			</Menu.Root>
			{lastMessage && (
				<ReportDialog
					currentScreen={currentScreen}
					params={{
						type: "convoMessage",
						convoId: convo.id,
						message: lastMessage,
					}}
					control={reportControl}
				/>
			)}
		</>
	);
}

export function AcceptChatButton({
	convo,
	size = "tiny",
	variant = "solid",
	color = "secondary_inverted",
	label,
	currentScreen,
	onAcceptConvo,
	...props
}: Omit<ButtonProps, "onPress" | "children" | "label"> & {
	label?: string;
	convo: ChatBskyConvoDefs.ConvoView;
	onAcceptConvo?: () => void;
	currentScreen: "list" | "conversation";
}) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: acceptConvo, isPending } = useAcceptConversation(convo.id, {
		onMutate: () => {
			onAcceptConvo?.();
			if (currentScreen === "list") {
				precacheConvoQuery(queryClient, { ...convo, status: "accepted" });
				navigate(`messages/${convo.id}`, { state: { accept: true } });
			}
		},
		onError: () => {
			// Should we show a toast here? They'll be on the convo screen, and it'll make
			// no difference if the request failed - when they send a message, the convo will be accepted
			// automatically. The only difference is that when they back out of the convo (without sending a message), the conversation will be rejected.
			// the list will still have this chat in it -sfn
			Toast.show("Failed to accept chat", "xmark");
		},
	});

	const onPressAccept = useCallback(() => {
		acceptConvo();
	}, [acceptConvo]);

	return (
		<Button
			{...props}
			label={label || "Accept chat request"}
			size={size}
			variant={variant}
			color={color}
			style={{ flex: 1 }}
			onPress={onPressAccept}
		>
			{isPending ? <ButtonIcon icon={Loader} /> : <ButtonText>{label || "Accept"}</ButtonText>}
		</Button>
	);
}

export function DeleteChatButton({
	convo,
	size = "tiny",
	variant = "outline",
	color = "secondary",
	label,
	currentScreen,
	...props
}: Omit<ButtonProps, "children" | "label"> & {
	label?: string;
	convo: ChatBskyConvoDefs.ConvoView;
	currentScreen: "list" | "conversation";
}) {
	const navigate = useNavigate();

	const { mutate: leaveConvo } = useLeaveConvo(convo.id, {
		onMutate: () => {
			if (currentScreen === "conversation") {
				// navigation.dispatch(StackActions.pop());
				navigate(-1);
			}
		},
		onError: () => {
			Toast.show("Failed to delete chat", "xmark");
		},
	});

	const onPressDelete = useCallback(() => {
		Toast.show("Chat deleted", "check");
		leaveConvo();
	}, [leaveConvo]);

	return (
		<Button
			label={label || "Delete chat"}
			size={size}
			variant={variant}
			color={color}
			style={{ flex: 1 }}
			onPress={onPressDelete}
			{...props}
		>
			<ButtonText>{label || "Delete chat"}</ButtonText>
		</Button>
	);
}
