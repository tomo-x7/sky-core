import React from "react";

import { atoms as a, tokens, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { TimesLarge_Stroke2_Corner0_Rounded as XIcon } from "#/components/icons/Times";
import { Login } from "#/screens/Login";
import { Signup } from "#/screens/Signup";
import { LandingScreen } from "#/screens/StarterPack/StarterPackLandingScreen";
import { useLoggedOutView, useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useSetMinimalShellMode } from "#/state/shell/minimal-mode";
import { ErrorBoundary } from "#/view/com/util/ErrorBoundary";
import { SplashScreen } from "./SplashScreen";

enum ScreenState {
	S_LoginOrCreateAccount = 0,
	S_Login = 1,
	S_CreateAccount = 2,
	S_StarterPack = 3,
}
export { ScreenState as LoggedOutScreenState };

export function LoggedOut({ onDismiss }: { onDismiss?: () => void }) {
	const t = useTheme();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { requestedAccountSwitchTo } = useLoggedOutView();
	const [screenState, setScreenState] = React.useState<ScreenState>(() => {
		if (requestedAccountSwitchTo === "new") {
			return ScreenState.S_CreateAccount;
		} else if (requestedAccountSwitchTo === "starterpack") {
			return ScreenState.S_StarterPack;
		} else if (requestedAccountSwitchTo != null) {
			return ScreenState.S_Login;
		} else {
			return ScreenState.S_LoginOrCreateAccount;
		}
	});
	const { clearRequestedAccount } = useLoggedOutViewControls();

	React.useEffect(() => {
		setMinimalShellMode(true);
	}, [setMinimalShellMode]);

	const onPressDismiss = React.useCallback(() => {
		if (onDismiss) {
			onDismiss();
		}
		clearRequestedAccount();
	}, [clearRequestedAccount, onDismiss]);

	return (
		<div
			style={{
				...a.util_screen_outer,
				...t.atoms.bg,
				...{ paddingTop: 0, paddingBottom: 0 },
			}}
		>
			<ErrorBoundary>
				{onDismiss && screenState === ScreenState.S_LoginOrCreateAccount ? (
					<Button
						label={"Go back"}
						variant="solid"
						color="secondary_inverted"
						size="small"
						shape="round"
						style={{
							...a.absolute,

							...{
								top: tokens.space.xl,
								right: tokens.space.xl,
								zIndex: 100,
							},
						}}
						onPress={onPressDismiss}
					>
						<ButtonIcon icon={XIcon} />
					</Button>
				) : null}

				{screenState === ScreenState.S_StarterPack ? (
					<LandingScreen setScreenState={setScreenState} />
				) : screenState === ScreenState.S_LoginOrCreateAccount ? (
					<SplashScreen
						onPressSignin={() => {
							setScreenState(ScreenState.S_Login);
						}}
						onPressCreateAccount={() => {
							setScreenState(ScreenState.S_CreateAccount);
						}}
					/>
				) : undefined}
				{screenState === ScreenState.S_Login ? (
					<Login
						onPressBack={() => {
							setScreenState(ScreenState.S_LoginOrCreateAccount);
							clearRequestedAccount();
						}}
					/>
				) : undefined}
				{screenState === ScreenState.S_CreateAccount ? (
					<Signup onPressBack={() => setScreenState(ScreenState.S_LoginOrCreateAccount)} />
				) : undefined}
			</ErrorBoundary>
		</div>
	);
}
