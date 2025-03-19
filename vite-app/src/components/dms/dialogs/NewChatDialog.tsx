import { useCallback } from "react";

import { useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { useDialogControl } from "#/components/Dialog";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { useEmail } from "#/lib/hooks/useEmail";
import { useGetConvoForMembers } from "#/state/queries/messages/get-convo-for-members";
import * as Toast from "#/view/com/util/Toast";
import { FAB } from "#/view/com/util/fab/FAB";
import { SearchablePeopleList } from "./SearchablePeopleList";

export function NewChat({
	control,
	onNewChat,
}: {
	control: Dialog.DialogControlProps;
	onNewChat: (chatId: string) => void;
}) {
	const t = useTheme();
	const { needsEmailVerification } = useEmail();
	const verifyEmailControl = useDialogControl();

	const { mutate: createChat } = useGetConvoForMembers({
		onSuccess: (data) => {
			onNewChat(data.convo.id);
		},
		onError: (error) => {
			console.error("Failed to create chat", { safeMessage: error });
			Toast.show("An issue occurred starting the chat", "xmark");
		},
	});

	const onCreateChat = useCallback(
		(did: string) => {
			control.close(() => createChat([did]));
		},
		[control, createChat],
	);

	return (
		<>
			<FAB
				onPress={() => {
					if (needsEmailVerification) {
						verifyEmailControl.open();
					} else {
						control.open();
					}
				}}
				icon={<Plus size="lg" fill={t.palette.white} />}
			/>

			<Dialog.Outer control={control}>
				<Dialog.Handle />
				<SearchablePeopleList title={"Start a new chat"} onSelectChat={onCreateChat} />
			</Dialog.Outer>

			<VerifyEmailDialog
				reasonText={"Before you may message another user, you must first verify your email."}
				control={verifyEmailControl}
			/>
		</>
	);
}
