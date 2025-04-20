import { useCallback } from "react";

import { atoms as a, useTheme } from "#/alf";
import { KnownFollowers } from "#/components/KnownFollowers";
import { usePromptControl } from "#/components/Prompt";
import { LeaveConvoPrompt } from "#/components/dms/LeaveConvoPrompt";
import type { ActiveConvoStates } from "#/state/messages/convo";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useSession } from "#/state/session";
import { AcceptChatButton, DeleteChatButton, RejectMenu } from "./RequestButtons";

export function ChatStatusInfo({ convoState }: { convoState: ActiveConvoStates }) {
	const t = useTheme();
	const moderationOpts = useModerationOpts();
	const { currentAccount } = useSession();
	const leaveConvoControl = usePromptControl();

	const onAcceptChat = useCallback(() => {
		convoState.markConvoAccepted();
	}, [convoState]);

	const otherUser = convoState.recipients.find((user) => user.did !== currentAccount?.did);

	if (!moderationOpts) {
		return null;
	}

	return (
		<div
			style={{
				...t.atoms.bg,
				padding: 16,
				gap: 12,
				alignItems: "center",
			}}
		>
			{otherUser && <KnownFollowers profile={otherUser} moderationOpts={moderationOpts} showIfEmpty />}
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					width: "100%",
					...(otherUser && a.pt_sm),
				}}
			>
				{otherUser && (
					<RejectMenu
						label={"Block or report"}
						convo={convoState.convo}
						profile={otherUser}
						color="negative"
						size="small"
						currentScreen="conversation"
					/>
				)}
				<DeleteChatButton
					label={"Delete"}
					convo={convoState.convo}
					color="secondary"
					size="small"
					currentScreen="conversation"
					onPress={leaveConvoControl.open}
				/>
				<LeaveConvoPrompt
					convoId={convoState.convo.id}
					control={leaveConvoControl}
					currentScreen="conversation"
					hasMessages={false}
				/>
			</div>
			<div
				style={{
					width: "100%",
					flexDirection: "row",
				}}
			>
				<AcceptChatButton
					onAcceptConvo={onAcceptChat}
					convo={convoState.convo}
					color="primary"
					variant="outline"
					size="small"
					currentScreen="conversation"
				/>
			</div>
		</div>
	);
}
