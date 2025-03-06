import React from "react";
import { View } from "react-native";

import { atoms as a, useBreakpoints } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { cleanError } from "#/lib/strings/errors";
import { useModalControls } from "#/state/modals";
import { useAgent, useSession } from "#/state/session";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";

export function VerifyEmailDialog({
	control,
	onCloseWithoutVerifying,
	onCloseAfterVerifying,
	reasonText,
}: {
	control: Dialog.DialogControlProps;
	onCloseWithoutVerifying?: () => void;
	onCloseAfterVerifying?: () => void;
	reasonText?: string;
}) {
	const agent = useAgent();

	const [didVerify, setDidVerify] = React.useState(false);

	return (
		<Dialog.Outer
			control={control}
			onClose={async () => {
				if (!didVerify) {
					onCloseWithoutVerifying?.();
					return;
				}

				try {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					await agent.resumeSession(agent.session!);
					onCloseAfterVerifying?.();
				} catch (e: unknown) {
					console.error(String(e));
					return;
				}
			}}
		>
			<Dialog.Handle />
			<Inner control={control} setDidVerify={setDidVerify} reasonText={reasonText} />
		</Dialog.Outer>
	);
}

export function Inner({
	control,
	setDidVerify,
	reasonText,
}: {
	control: Dialog.DialogControlProps;
	setDidVerify: (value: boolean) => void;
	reasonText?: string;
}) {
	const { currentAccount } = useSession();
	const agent = useAgent();
	const { openModal } = useModalControls();
	const { gtMobile } = useBreakpoints();

	const [currentStep, setCurrentStep] = React.useState<"StepOne" | "StepTwo" | "StepThree">("StepOne");
	const [confirmationCode, setConfirmationCode] = React.useState("");
	const [isProcessing, setIsProcessing] = React.useState(false);
	const [error, setError] = React.useState("");

	const uiStrings = {
		StepOne: {
			title: "Verify Your Email",
			message: "",
		},
		StepTwo: {
			title: "Enter Code",
			message: "An email has been sent! Please enter the confirmation code included in the email below.",
		},
		StepThree: {
			title: "Success!",
			message: "Thank you! Your email has been successfully verified.",
		},
	};

	const onSendEmail = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.requestEmailConfirmation();
			setCurrentStep("StepTwo");
		} catch (e: unknown) {
			setError(cleanError(e));
		} finally {
			setIsProcessing(false);
		}
	};

	const onVerifyEmail = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.confirmEmail({
				email: (currentAccount?.email || "").trim(),
				token: confirmationCode.trim(),
			});
		} catch (e: unknown) {
			setError(cleanError(String(e)));
			setIsProcessing(false);
			return;
		}

		setIsProcessing(false);
		setDidVerify(true);
		setCurrentStep("StepThree");
	};

	return (
		<Dialog.ScrollableInner
			label="Verify email dialog"
			style={[gtMobile ? { width: "auto", maxWidth: 400, minWidth: 200 } : a.w_full]}
		>
			<Dialog.Close />
			<View style={[a.gap_xl]}>
				<View style={[a.gap_sm]}>
					<Text style={[a.font_heavy, a.text_2xl]}>{uiStrings[currentStep].title}</Text>
					{error ? (
						<View style={[a.rounded_sm, a.overflow_hidden]}>
							<ErrorMessage message={error} />
						</View>
					) : null}
					{currentStep === "StepOne" ? (
						<View>
							{reasonText ? (
								<View style={[a.gap_sm]}>
									<Text style={[a.text_md, a.leading_snug]}>{reasonText}</Text>
									<Text style={[a.text_md, a.leading_snug]}>
										Don't have access to{" "}
										<Text style={[a.text_md, a.leading_snug, a.font_bold]}>
											{currentAccount?.email}
										</Text>
										?{" "}
										<InlineLinkText
											to="#"
											label="Change email address"
											style={[a.text_md, a.leading_snug]}
											onPress={(e) => {
												e.preventDefault();
												control.close(() => {
													openModal({ name: "change-email" });
												});
												return false;
											}}
										>
											Change your email address
										</InlineLinkText>
										.
									</Text>
								</View>
							) : (
								<Text style={[a.text_md, a.leading_snug]}>
									<>
										You'll receive an email at{" "}
										<Text style={[a.text_md, a.leading_snug, a.font_bold]}>
											{currentAccount?.email}
										</Text>{" "}
										to verify it's you.
									</>{" "}
									<InlineLinkText
										to="#"
										label="Change email address"
										style={[a.text_md, a.leading_snug]}
										onPress={(e) => {
											e.preventDefault();
											control.close(() => {
												openModal({ name: "change-email" });
											});
											return false;
										}}
									>
										Need to change it?
									</InlineLinkText>
								</Text>
							)}
						</View>
					) : (
						<Text style={[a.text_md, a.leading_snug]}>{uiStrings[currentStep].message}</Text>
					)}
				</View>
				{currentStep === "StepTwo" ? (
					<View>
						<TextField.LabelText>Confirmation Code</TextField.LabelText>
						<TextField.Root>
							<TextField.Input
								label="Confirmation code"
								placeholder="XXXXX-XXXXX"
								onChangeText={setConfirmationCode}
							/>
						</TextField.Root>
					</View>
				) : null}
				<View style={[a.gap_sm, gtMobile && [a.flex_row_reverse, a.ml_auto]]}>
					{currentStep === "StepOne" ? (
						<>
							<Button
								label="Send confirmation email"
								variant="solid"
								color="primary"
								size="large"
								disabled={isProcessing}
								onPress={onSendEmail}
							>
								<ButtonText>Send Confirmation</ButtonText>
								{isProcessing ? <Loader size="sm" style={[{ color: "white" }]} /> : null}
							</Button>
							<Button
								label="I Have a Code"
								variant="solid"
								color="secondary"
								size="large"
								disabled={isProcessing}
								onPress={() => setCurrentStep("StepTwo")}
							>
								<ButtonText>I Have a Code</ButtonText>
							</Button>
						</>
					) : currentStep === "StepTwo" ? (
						<>
							<Button
								label="Confirm"
								variant="solid"
								color="primary"
								size="large"
								disabled={isProcessing}
								onPress={onVerifyEmail}
							>
								<ButtonText>Confirm</ButtonText>
								{isProcessing ? <Loader size="sm" style={[{ color: "white" }]} /> : null}
							</Button>
							<Button
								label="Resend Email"
								variant="solid"
								color="secondary"
								size="large"
								disabled={isProcessing}
								onPress={() => {
									setConfirmationCode("");
									setCurrentStep("StepOne");
								}}
							>
								<ButtonText>Resend Email</ButtonText>
							</Button>
						</>
					) : currentStep === "StepThree" ? (
						<Button
							label="Confirm"
							variant="solid"
							color="primary"
							size="large"
							onPress={() => control.close()}
						>
							<ButtonText>Close</ButtonText>
						</Button>
					) : null}
				</View>
			</View>
		</Dialog.ScrollableInner>
	);
}
