import { useCallback } from "react";

import * as Dialog from "#/components/Dialog";
import { useGetConvoForMembers } from "#/state/queries/messages/get-convo-for-members";
import * as Toast from "#/view/com/util/Toast";
import { SearchablePeopleList } from "./SearchablePeopleList";

export function SendViaChatDialog({
	control,
	onSelectChat,
}: {
	control: Dialog.DialogControlProps;
	onSelectChat: (chatId: string) => void;
}) {
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<SendViaChatDialogInner control={control} onSelectChat={onSelectChat} />
		</Dialog.Outer>
	);
}

function SendViaChatDialogInner({
	control,
	onSelectChat,
}: {
	control: Dialog.DialogControlProps;
	onSelectChat: (chatId: string) => void;
}) {
	const { mutate: createChat } = useGetConvoForMembers({
		onSuccess: (data) => {
			onSelectChat(data.convo.id);
		},
		onError: (error) => {
			console.error("Failed to share post to chat", { message: error });
			Toast.show("An issue occurred while trying to open the chat", "xmark");
		},
	});

	const onCreateChat = useCallback(
		(did: string) => {
			control.close(() => createChat([did]));
		},
		[control, createChat],
	);

	return <SearchablePeopleList title={"Send post to..."} onSelectChat={onCreateChat} showRecentConvos />;
}
