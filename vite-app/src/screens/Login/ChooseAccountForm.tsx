import React from "react";
import { View } from "react-native";

import { atoms as a } from "#/alf";
import { AccountList } from "#/components/AccountList";
import { Button, ButtonText } from "#/components/Button";
import * as TextField from "#/components/forms/TextField";
import { type SessionAccount, useSession, useSessionApi } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import * as Toast from "#/view/com/util/Toast";
import { FormContainer } from "./FormContainer";

export const ChooseAccountForm = ({
	onSelectAccount,
	onPressBack,
}: {
	onSelectAccount: (account?: SessionAccount) => void;
	onPressBack: () => void;
}) => {
	const [pendingDid, setPendingDid] = React.useState<string | null>(null);
	const { currentAccount } = useSession();
	const { resumeSession } = useSessionApi();
	const { setShowLoggedOut } = useLoggedOutViewControls();

	const onSelect = React.useCallback(
		async (account: SessionAccount) => {
			if (pendingDid) {
				// The session API isn't resilient to race conditions so let's just ignore this.
				return;
			}
			if (!account.accessJwt) {
				// Move to login form.
				onSelectAccount(account);
				return;
			}
			if (account.did === currentAccount?.did) {
				setShowLoggedOut(false);
				Toast.show(`Already signed in as @${account.handle}`);
				return;
			}
			try {
				setPendingDid(account.did);
				await resumeSession(account);
				Toast.show(`Signed in as @${account.handle}`);
			} catch (e: any) {
				console.error("choose account: initSession failed", {
					message: e.message,
				});
				// Move to login form.
				onSelectAccount(account);
			} finally {
				setPendingDid(null);
			}
		},
		[currentAccount, resumeSession, pendingDid, onSelectAccount, setShowLoggedOut],
	);

	return (
		<FormContainer titleText={<>Select account</>}>
			<View>
				<TextField.LabelText>Sign in as...</TextField.LabelText>
				<AccountList
					onSelectAccount={onSelect}
					onSelectOther={() => onSelectAccount()}
					pendingDid={pendingDid}
				/>
			</View>
			<div style={a.flex_row}>
				<Button label={"Back"} variant="solid" color="secondary" size="large" onPress={onPressBack}>
					<ButtonText>{"Back"}</ButtonText>
				</Button>
				<div style={a.flex_1} />
			</div>
		</FormContainer>
	);
};
