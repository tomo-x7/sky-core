import { useCallback } from "react";
import * as Dialog from "#/components/Dialog";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import { type SessionAccount, useSession } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { AccountList } from "../AccountList";
import { Text } from "../Typography";

export function SwitchAccountDialog({
	control,
}: {
	control: Dialog.DialogControlProps;
}) {
	const { currentAccount } = useSession();
	const { onPressSwitchAccount, pendingDid } = useAccountSwitcher();
	const { setShowLoggedOut } = useLoggedOutViewControls();

	const onSelectAccount = useCallback(
		(account: SessionAccount) => {
			if (account.did !== currentAccount?.did) {
				control.close(() => {
					onPressSwitchAccount(account);
				});
			} else {
				control.close();
			}
		},
		[currentAccount, control, onPressSwitchAccount],
	);

	const onPressAddAccount = useCallback(() => {
		control.close(() => {
			setShowLoggedOut(true);
		});
	}, [setShowLoggedOut, control]);

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner label="Switch Account">
				<div style={{ gap: 16 }}>
					<Text
						style={{
							fontSize: 22,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						Switch Account
					</Text>

					<AccountList
						onSelectAccount={onSelectAccount}
						onSelectOther={onPressAddAccount}
						otherLabel="Add account"
						pendingDid={pendingDid}
					/>
				</div>

				<Dialog.Close />
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}
