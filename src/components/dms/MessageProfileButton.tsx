import type { AppBskyActorDefs } from "@atproto/api";
import React from "react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { canBeMessaged } from "#/components/dms/util";
import { Message_Stroke2_Corner0_Rounded as Message } from "#/components/icons/Message";
import { useEmail } from "#/lib/hooks/useEmail";
import { useGetConvoAvailabilityQuery } from "#/state/queries/messages/get-convo-availability";
import { useGetConvoForMembers } from "#/state/queries/messages/get-convo-for-members";
import * as Toast from "#/view/com/util/Toast";

export function MessageProfileButton({
	profile,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const t = useTheme();
	const { needsEmailVerification } = useEmail();
	const verifyEmailControl = useDialogControl();
	const navigate = useNavigate();

	const { data: convoAvailability } = useGetConvoAvailabilityQuery(profile.did);
	const { mutate: initiateConvo } = useGetConvoForMembers({
		onSuccess: ({ convo }) => {
			navigate(`/messages/${convo.id}`);
		},
		onError: () => {
			Toast.show("Failed to create conversation");
		},
	});

	const onPress = React.useCallback(() => {
		if (!convoAvailability?.canChat) {
			return;
		}

		if (needsEmailVerification) {
			verifyEmailControl.open();
			return;
		}

		if (convoAvailability.convo) {
			navigate(`/messages/${convoAvailability.convo.id}`);
		} else {
			initiateConvo([profile.did]);
		}
	}, [needsEmailVerification, verifyEmailControl, navigate, profile.did, initiateConvo, convoAvailability]);

	if (!convoAvailability) {
		// show pending state based on declaration
		if (canBeMessaged(profile)) {
			return (
				<div
					aria-hidden={true}
					style={{
						justifyContent: "center",
						alignItems: "center",
						...t.atoms.bg_contrast_25,
						borderRadius: 999,
						...{ width: 34, height: 34 },
					}}
				>
					<Message
						style={{
							...t.atoms.text,
							...{ opacity: 0.3 },
						}}
						size="md"
					/>
				</div>
			);
		} else {
			return null;
		}
	}

	if (convoAvailability.canChat) {
		return (
			<>
				<Button
					size="small"
					color="secondary"
					variant="solid"
					shape="round"
					label={`Message ${profile.handle}`}
					style={{ justifyContent: "center" }}
					onPress={onPress}
				>
					<ButtonIcon icon={Message} size="md" />
				</Button>
				<VerifyEmailDialog
					reasonText={"Before you may message another user, you must first verify your email."}
					control={verifyEmailControl}
				/>
			</>
		);
	} else {
		return null;
	}
}
