import { useNavigate } from "react-router-dom";
import type { DialogOuterProps } from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";
import { useLeaveConvo } from "#/state/queries/messages/leave-conversation";
import * as Toast from "#/view/com/util/Toast";

export function LeaveConvoPrompt({
	control,
	convoId,
	currentScreen,
	hasMessages = true,
}: {
	control: DialogOuterProps["control"];
	convoId: string;
	currentScreen: "list" | "conversation";
	hasMessages?: boolean;
}) {
	const navigate = useNavigate();

	const { mutate: leaveConvo } = useLeaveConvo(convoId, {
		onMutate: () => {
			if (currentScreen === "conversation") {
				// navigation.dispatch(StackActions.replace("Messages", {}));
				navigate("/messages");
			}
		},
		onError: () => {
			Toast.show("Could not leave chat", "xmark");
		},
	});

	return (
		<Prompt.Basic
			control={control}
			title="Leave conversation"
			description={
				hasMessages
					? "Are you sure you want to leave this conversation? Your messages will be deleted for you, but not for the other participant."
					: "Are you sure you want to leave this conversation?"
			}
			confirmButtonCta="Leave"
			confirmButtonColor="negative"
			onConfirm={() => leaveConvo()}
		/>
	);
}
