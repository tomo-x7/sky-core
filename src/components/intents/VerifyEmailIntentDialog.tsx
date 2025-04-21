import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as Resend } from "#/components/icons/ArrowRotateCounterClockwise";
import { useIntentDialogs } from "#/components/intents/IntentDialogs";
import { useAgent, useSession } from "#/state/session";

export function VerifyEmailIntentDialog() {
	const { verifyEmailDialogControl: control } = useIntentDialogs();

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Inner control={control} />
		</Dialog.Outer>
	);
}

function Inner({ control }: { control: DialogControlProps }) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { verifyEmailState: state } = useIntentDialogs();
	const [status, setStatus] = React.useState<"loading" | "success" | "failure" | "resent">("loading");
	const [sending, setSending] = React.useState(false);
	const agent = useAgent();
	const { currentAccount } = useSession();

	React.useEffect(() => {
		(async () => {
			if (!state?.code) {
				return;
			}
			try {
				await agent.com.atproto.server.confirmEmail({
					email: (currentAccount?.email || "").trim(),
					token: state.code.trim(),
				});
				setStatus("success");
			} catch (e) {
				setStatus("failure");
			}
		})();
	}, [agent.com.atproto.server, currentAccount?.email, state?.code]);

	const onPressResendEmail = async () => {
		setSending(true);
		await agent.com.atproto.server.requestEmailConfirmation();
		setSending(false);
		setStatus("resent");
	};

	return (
		<Dialog.ScrollableInner
			label={"Verify email dialog"}
			style={gtMobile ? { width: "auto", maxWidth: 400, minWidth: 200 } : { width: "100%" }}
		>
			<div style={{ gap: 20 }}>
				{status === "loading" ? (
					<div
						style={{
							paddingTop: 24,
							paddingBottom: 24,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Loader size="xl" fill={t.atoms.text_contrast_low.color} />
					</div>
				) : status === "success" ? (
					<div style={{ gap: 8 }}>
						<Text
							style={{
								fontWeight: "800",
								fontSize: 22,
								letterSpacing: 0,
							}}
						>
							Email Verified
						</Text>
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							Thanks, you have successfully verified your email address. You can close this dialog.
						</Text>
					</div>
				) : status === "failure" ? (
					<div style={{ gap: 8 }}>
						<Text
							style={{
								fontWeight: "800",
								fontSize: 22,
								letterSpacing: 0,
							}}
						>
							Invalid Verification Code
						</Text>
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							The verification code you have provided is invalid. Please make sure that you have used the
							correct verification link or request a new one.
						</Text>
					</div>
				) : (
					<div style={{ gap: 8 }}>
						<Text
							style={{
								fontWeight: "800",
								fontSize: 22,
								letterSpacing: 0,
							}}
						>
							Email Resent
						</Text>
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							We have sent another verification email to{" "}
							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									fontWeight: "600",
								}}
							>
								{currentAccount?.email}
							</Text>
							.
						</Text>
					</div>
				)}

				{status === "failure" && (
					<>
						<Divider />
						<Button
							label={"Resend Verification Email"}
							onPress={onPressResendEmail}
							variant="solid"
							color="secondary_inverted"
							size="large"
							disabled={sending}
						>
							<ButtonIcon icon={sending ? Loader : Resend} position="left" />
							<ButtonText>Resend Email</ButtonText>
						</Button>
					</>
				)}
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
