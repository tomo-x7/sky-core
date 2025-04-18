import React from "react";

import { useDialogControl } from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";
import { useModalControls } from "#/state/modals";
import { useAgent, useSession } from "#/state/session";
import { DisableEmail2FADialog } from "./DisableEmail2FADialog";
import * as SettingsList from "./SettingsList";

export function Email2FAToggle() {
	const { currentAccount } = useSession();
	const { openModal } = useModalControls();
	const disableDialogControl = useDialogControl();
	const enableDialogControl = useDialogControl();
	const agent = useAgent();

	const enableEmailAuthFactor = React.useCallback(async () => {
		if (currentAccount?.email) {
			await agent.com.atproto.server.updateEmail({
				email: currentAccount.email,
				emailAuthFactor: true,
			});
			await agent.resumeSession(agent.session!);
		}
	}, [currentAccount, agent]);

	const onToggle = React.useCallback(() => {
		if (!currentAccount) {
			return;
		}
		if (currentAccount.emailAuthFactor) {
			disableDialogControl.open();
		} else {
			if (!currentAccount.emailConfirmed) {
				openModal({
					name: "verify-email",
					onSuccess: enableDialogControl.open,
				});
				return;
			}
			enableDialogControl.open();
		}
	}, [currentAccount, enableDialogControl, openModal, disableDialogControl]);

	return (
		<>
			<DisableEmail2FADialog control={disableDialogControl} />
			<Prompt.Basic
				control={enableDialogControl}
				title={"Enable Email 2FA"}
				description={"Require an email code to sign in to your account."}
				onConfirm={enableEmailAuthFactor}
				confirmButtonCta={"Enable"}
			/>
			<SettingsList.BadgeButton
				label={currentAccount?.emailAuthFactor ? "Change" : "Enable"}
				onPress={onToggle}
			/>
		</>
	);
}
