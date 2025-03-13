import React from "react";
import { View } from "react-native";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
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
			style={[gtMobile ? { width: "auto", maxWidth: 420 } : a.w_full]}
		>
			<View style={[a.p_2xl]}>
				<View style={[a.flex_row, a.align_center, a.justify_center, a.gap_sm, a.pb_lg]}>
					<Logo width={36} />
					<View style={{ paddingTop: 6 }}>
						<Logotype width={120} fill={t.atoms.text.color} />
					</View>
				</View>

				<Text
					style={[
						a.text_lg,
						a.text_center,
						t.atoms.text,
						a.pb_2xl,
						a.leading_snug,
						a.mx_auto,
						{
							maxWidth: 300,
						},
					]}
				>
					Sign in or create your account to join the conversation!
				</Text>

				<View style={[a.flex_col, a.gap_md]}>
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
				</View>
			</View>

			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
