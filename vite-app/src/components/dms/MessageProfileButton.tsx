import type { AppBskyActorDefs } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { canBeMessaged } from "#/components/dms/util";
import { Message_Stroke2_Corner0_Rounded as Message } from "#/components/icons/Message";
import { useEmail } from "#/lib/hooks/useEmail";
import type { NavigationProp } from "#/lib/routes/types";
import { useGetConvoAvailabilityQuery } from "#/state/queries/messages/get-convo-availability";
import { useGetConvoForMembers } from "#/state/queries/messages/get-convo-for-members";
import * as Toast from "#/view/com/util/Toast";

export function MessageProfileButton({
	profile,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const t = useTheme();
	const navigation = useNavigation<NavigationProp>();
	const { needsEmailVerification } = useEmail();
	const verifyEmailControl = useDialogControl();

	const { data: convoAvailability } = useGetConvoAvailabilityQuery(profile.did);
	const { mutate: initiateConvo } = useGetConvoForMembers({
		onSuccess: ({ convo }) => {
			logEvent("chat:open", { logContext: "ProfileHeader" });
			navigation.navigate("MessagesConversation", { conversation: convo.id });
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
			logEvent("chat:open", { logContext: "ProfileHeader" });
			navigation.navigate("MessagesConversation", {
				conversation: convoAvailability.convo.id,
			});
		} else {
			logEvent("chat:create", { logContext: "ProfileHeader" });
			initiateConvo([profile.did]);
		}
	}, [needsEmailVerification, verifyEmailControl, navigation, profile.did, initiateConvo, convoAvailability]);

	if (!convoAvailability) {
		// show pending state based on declaration
		if (canBeMessaged(profile)) {
			return (
				<View
					testID="dmBtnLoading"
					aria-hidden={true}
					style={{
						...a.justify_center,
						...a.align_center,
						...t.atoms.bg_contrast_25,
						...a.rounded_full,
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
				</View>
			);
		} else {
			return null;
		}
	}

	if (convoAvailability.canChat) {
		return (
			<>
				<Button
					accessibilityRole="button"
					testID="dmBtn"
					size="small"
					color="secondary"
					variant="solid"
					shape="round"
					label={`Message ${profile.handle}`}
					style={a.justify_center}
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
