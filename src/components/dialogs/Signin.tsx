import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import { useGlobalDialogsControlContext } from "#/components/dialogs/Context";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";

export function SigninDialog() {
	const { signinDialogControl: control } = useGlobalDialogsControlContext();
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<SigninDialogInner control={control} />
		</Dialog.Outer>
	);
}

function SigninDialogInner(params: { control: Dialog.DialogOuterProps["control"] }) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { requestSwitchToAccount } = useLoggedOutViewControls();
	const closeAllActiveElements = useCloseAllActiveElements();

	const showSignIn = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "none" });
	}, [requestSwitchToAccount, closeAllActiveElements]);

	const showCreateAccount = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "new" });
	}, [requestSwitchToAccount, closeAllActiveElements]);

	return (
		<Dialog.ScrollableInner
			label="Sign in to Bluesky or create a new account"
			style={gtMobile ? { width: "auto", maxWidth: 420 } : { width: "100%" }}
		>
			<div style={{ padding: 24 }}>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
						paddingBottom: 16,
					}}
				>
					<Logo width={36} />
					<div style={{ paddingTop: 6 }}>
						<Logotype width={120} fill={t.atoms.text.color} />
					</div>
				</div>

				<Text
					style={{
						fontSize: 18,
						letterSpacing: 0,
						textAlign: "center",
						...t.atoms.text,
						paddingBottom: 24,
						lineHeight: 1.3,
						marginLeft: "auto",
						marginRight: "auto",

						...{
							maxWidth: 300,
						},
					}}
				>
					Sign in or create your account to join the conversation!
				</Text>

				<div
					style={{
						flexDirection: "column",
						gap: 12,
					}}
				>
					<Button
						variant="solid"
						color="primary"
						size="large"
						onPress={showCreateAccount}
						label="Create an account"
					>
						<ButtonText>Create an account</ButtonText>
					</Button>

					<Button variant="solid" color="secondary" size="large" onPress={showSignIn} label="Sign in">
						<ButtonText>Sign in</ButtonText>
					</Button>
				</div>
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
