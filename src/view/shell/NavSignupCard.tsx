import React from "react";

import { atoms as a } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Button, ButtonText } from "#/components/Button";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import { Logo } from "#/view/icons/Logo";

let NavSignupCard = (props: unknown): React.ReactNode => {
	const { requestSwitchToAccount } = useLoggedOutViewControls();
	const closeAllActiveElements = useCloseAllActiveElements();

	const showSignIn = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "none" });
	}, [requestSwitchToAccount, closeAllActiveElements]);

	const showCreateAccount = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "new" });
		// setShowLoggedOut(true)
	}, [requestSwitchToAccount, closeAllActiveElements]);

	return (
		<div style={{ maxWidth: 200 }}>
			<Link to="/" label="Bluesky - Home">
				<Logo width={32} />
			</Link>
			<div style={{ paddingTop: 16 }}>
				<Text
					style={{
						fontSize: 26,
						letterSpacing: 0,
						fontWeight: "800",
						...{ lineHeight: `${a.text_3xl.fontSize}px` },
					}}
				>
					Join the conversation
				</Text>
			</div>
			<div
				style={{
					flexDirection: "row",
					flexWrap: "wrap",
					gap: 8,
					paddingTop: 12,
				}}
			>
				<Button
					onPress={showCreateAccount}
					label={"Create account"}
					size="small"
					variant="solid"
					color="primary"
				>
					<ButtonText>Create account</ButtonText>
				</Button>
				<Button onPress={showSignIn} label={"Sign in"} size="small" variant="solid" color="secondary">
					<ButtonText>Sign in</ButtonText>
				</Button>
			</div>
			<div
				style={{
					marginTop: 12,
					width: "100%",
					...{ height: 32 },
				}}
			>
				<AppLanguageDropdown style={{ marginTop: 0 }} />
			</div>
		</div>
	);
};
NavSignupCard = React.memo(NavSignupCard);
export { NavSignupCard };
