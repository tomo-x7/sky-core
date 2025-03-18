import { useState } from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { P, Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { Lock_Stroke2_Corner0_Rounded as Lock } from "#/components/icons/Lock";
import { cleanError } from "#/lib/strings/errors";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";

enum Stages {
	Email = 0,
	ConfirmCode = 1,
}

export function DisableEmail2FADialog({
	control,
}: {
	control: Dialog.DialogOuterProps["control"];
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { currentAccount } = useSession();
	const agent = useAgent();

	const [stage, setStage] = useState<Stages>(Stages.Email);
	const [confirmationCode, setConfirmationCode] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const onSendEmail = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.requestEmailUpdate();
			setStage(Stages.ConfirmCode);
		} catch (e) {
			setError(cleanError(String(e)));
		} finally {
			setIsProcessing(false);
		}
	};

	const onConfirmDisable = async () => {
		setError("");
		setIsProcessing(true);
		try {
			if (currentAccount?.email) {
				await agent.com.atproto.server.updateEmail({
					email: currentAccount!.email,
					token: confirmationCode.trim(),
					emailAuthFactor: false,
				});
				await agent.resumeSession(agent.session!);
				Toast.show("Email 2FA disabled");
			}
			control.close();
		} catch (e) {
			const errMsg = String(e);
			if (errMsg.includes("Token is invalid")) {
				setError("Invalid 2FA confirmation code.");
			} else {
				setError(cleanError(errMsg));
			}
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner
				accessibilityDescribedBy="dialog-description"
				accessibilityLabelledBy="dialog-title"
			>
				<div
					style={{
						...a.relative,
						...a.gap_md,
						...a.w_full,
					}}
				>
					<Text
						style={{
							...a.text_2xl,
							...a.font_bold,
							...t.atoms.text,
						}}
					>
						Disable Email 2FA
					</Text>
					<P>
						{stage === Stages.ConfirmCode ? (
							<>
								An email has been sent to {currentAccount?.email || "(no email)"}. It includes a
								confirmation code which you can enter below.
							</>
						) : (
							<>To disable the email 2FA method, please verify your access to the email address.</>
						)}
					</P>

					{error ? <ErrorMessage message={error} /> : undefined}

					{stage === Stages.Email ? (
						<div
							style={{
								...a.gap_sm,
								...flatten(gtMobile && [a.flex_row, a.justify_end, a.gap_md]),
							}}
						>
							<Button
								variant="solid"
								color="primary"
								size={gtMobile ? "small" : "large"}
								onPress={onSendEmail}
								label={"Send verification email"}
								disabled={isProcessing}
							>
								<ButtonText>Send verification email</ButtonText>
								{isProcessing && <ButtonIcon icon={Loader} />}
							</Button>
							<Button
								variant="ghost"
								color="primary"
								size={gtMobile ? "small" : "large"}
								onPress={() => setStage(Stages.ConfirmCode)}
								label={"I have a code"}
								disabled={isProcessing}
							>
								<ButtonText>I have a code</ButtonText>
							</Button>
						</div>
					) : stage === Stages.ConfirmCode ? (
						<div>
							<div style={a.mb_md}>
								<TextField.LabelText>Confirmation code</TextField.LabelText>
								<TextField.Root>
									<TextField.Icon icon={Lock} />
									<Dialog.Input
										label={"Confirmation code"}
										autoCapitalize="none"
										autoFocus
										autoCorrect={"off"}
										autoComplete="off"
										value={confirmationCode}
										onChangeText={setConfirmationCode}
										onSubmitEditing={onConfirmDisable}
										contentEditable={!isProcessing}
									/>
								</TextField.Root>
							</div>
							<div
								style={{
									...a.gap_sm,
									...flatten(gtMobile && [a.flex_row, a.justify_end, a.gap_md]),
								}}
							>
								<Button
									variant="ghost"
									color="primary"
									size={gtMobile ? "small" : "large"}
									onPress={onSendEmail}
									label={"Resend email"}
									disabled={isProcessing}
								>
									<ButtonText>Resend email</ButtonText>
								</Button>
								<Button
									variant="solid"
									color="primary"
									size={gtMobile ? "small" : "large"}
									onPress={onConfirmDisable}
									label={"Confirm"}
									disabled={isProcessing}
								>
									<ButtonText>Confirm</ButtonText>
									{isProcessing && <ButtonIcon icon={Loader} />}
								</Button>
							</div>
						</div>
					) : undefined}
				</div>
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}
