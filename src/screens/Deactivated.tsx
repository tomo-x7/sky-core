import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { AccountList } from "#/components/AccountList";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Divider } from "#/components/Divider";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import { type SessionAccount, useAgent, useSession, useSessionApi } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { Logo } from "#/view/icons/Logo";

const COL_WIDTH = 400;

export function Deactivated() {
	const t = useTheme();
	const { currentAccount, accounts } = useSession();
	const { onPressSwitchAccount, pendingDid } = useAccountSwitcher();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const hasOtherAccounts = accounts.length > 1;
	const setMinimalShellMode = useSetMinimalShellMode();
	const { logoutCurrentAccount } = useSessionApi();
	const agent = useAgent();
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState<string | undefined>();
	const queryClient = useQueryClient();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(true);
		}, [setMinimalShellMode]),
	);

	const onSelectAccount = React.useCallback(
		(account: SessionAccount) => {
			if (account.did !== currentAccount?.did) {
				onPressSwitchAccount(account);
			}
		},
		[currentAccount, onPressSwitchAccount],
	);

	const onPressAddAccount = React.useCallback(() => {
		setShowLoggedOut(true);
	}, [setShowLoggedOut]);

	const onPressLogout = React.useCallback(() => {
		// We're switching accounts, which remounts the entire app.
		// On mobile, this gets us Home, but on the web we also need reset the URL.
		// We can't change the URL via a navigate() call because the navigator
		// itself is about to unmount, and it calls pushState() too late.
		// So we change the URL ourselves. The navigator will pick it up on remount.
		history.pushState(null, "", "/");

		logoutCurrentAccount();
	}, [logoutCurrentAccount]);

	const handleActivate = React.useCallback(async () => {
		try {
			setPending(true);
			await agent.com.atproto.server.activateAccount();
			await queryClient.resetQueries();
			await agent.resumeSession(agent.session!);
		} catch (e: any) {
			switch (e.message) {
				case "Bad token scope":
					setError(
						`You're signed in with an App Password. Please sign in with your main password to continue deactivating your account.`,
					);
					break;
				default:
					setError("Something went wrong, please try again");
					break;
			}

			console.error(e, {
				message: "Failed to activate account",
			});
		} finally {
			setPending(false);
		}
	}, [agent, queryClient]);

	return (
		<div
			style={{
				minHeight: "100dvh",
				flex: 1,
			}}
		>
			<Layout.Content
				ignoreTabletLayoutOffset
				contentContainerStyle={{
					paddingTop: 64,
					paddingBottom: 64,
					paddingLeft: 24,
					paddingRight: 24,
				}}
			>
				<div
					style={{
						width: "100%",
						...{ marginLeft: "auto", marginRight: "auto", maxWidth: COL_WIDTH },
					}}
				>
					<div
						style={{
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
							paddingBottom: 40,
						}}
					>
						<Logo width={40} />
					</div>

					<div
						style={{
							gap: 4,
							paddingBottom: 28,
						}}
					>
						<Text
							style={{
								fontSize: 20,
								letterSpacing: 0,
								fontWeight: "600",
								lineHeight: 1.3,
							}}
						>
							Welcome back!
						</Text>
						<Text
							style={{
								fontSize: 14,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							<>You previously deactivated @{currentAccount?.handle}.</>
						</Text>
						<Text
							style={{
								fontSize: 14,
								letterSpacing: 0,
								lineHeight: 1.3,
								paddingBottom: 12,
							}}
						>
							You can reactivate your account to continue logging in. Your profile and posts will be
							visible to other users.
						</Text>

						<div style={{ gap: 8 }}>
							<Button
								label={"Reactivate your account"}
								size="large"
								variant="solid"
								color="primary"
								onPress={handleActivate}
							>
								<ButtonText>Yes, reactivate my account</ButtonText>
								{pending && <ButtonIcon icon={Loader} position="right" />}
							</Button>
							<Button
								label={"Cancel reactivation and sign out"}
								size="large"
								variant="solid"
								color="secondary"
								onPress={onPressLogout}
							>
								<ButtonText>Cancel</ButtonText>
							</Button>
						</div>

						{error && (
							<div
								style={{
									flexDirection: "row",
									gap: 8,
									marginTop: 12,
									padding: 12,
									borderRadius: 8,
									...t.atoms.bg_contrast_25,
								}}
							>
								<CircleInfo size="md" fill={t.palette.negative_400} />
								<Text
									style={{
										flex: 1,
										lineHeight: 1.3,
									}}
								>
									{error}
								</Text>
							</div>
						)}
					</div>

					<div style={{ paddingBottom: 28 }}>
						<Divider />
					</div>

					{hasOtherAccounts ? (
						<>
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									paddingBottom: 12,
									lineHeight: 1.3,
								}}
							>
								Or, sign in to one of your other accounts.
							</Text>
							<AccountList
								onSelectAccount={onSelectAccount}
								onSelectOther={onPressAddAccount}
								otherLabel={"Add account"}
								pendingDid={pendingDid}
							/>
						</>
					) : (
						<>
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									paddingBottom: 12,
									lineHeight: 1.3,
								}}
							>
								Or, continue with another account.
							</Text>
							<Button
								label={"Sign in or sign up"}
								size="large"
								variant="solid"
								color="secondary"
								onPress={() => setShowLoggedOut(true)}
							>
								<ButtonText>Sign in or sign up</ButtonText>
							</Button>
						</>
					)}
				</div>
			</Layout.Content>
		</div>
	);
}
