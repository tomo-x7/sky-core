import type { DialogControlProps } from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";

export function ReportConversationPrompt({
	control,
}: {
	control: DialogControlProps;
}) {
	return (
		<Prompt.Basic
			control={control}
			title="Report conversation"
			description="To report a conversation, please report one of its messages via the conversation screen. This lets our moderators understand the context of your issue."
			confirmButtonCta="I understand"
			onConfirm={() => {}}
			showCancel={false}
		/>
	);
}
