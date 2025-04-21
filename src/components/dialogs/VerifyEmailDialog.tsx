import React from "react";

import { useBreakpoints } from "#/alf";
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
			style={gtMobile ? { width: "auto", maxWidth: 400, minWidth: 200 } : { width: "100%" }}
		>
			<Dialog.Close />
			<div style={{ gap: 20 }}>
				<div style={{ gap: 8 }}>
					<Text
						style={{
							fontWeight: "800",
							fontSize: 22,
							letterSpacing: 0,
						}}
					>
						{uiStrings[currentStep].title}
					</Text>
					{error ? (
						<div
							style={{
								borderRadius: 8,
								overflow: "hidden",
							}}
						>
							<ErrorMessage message={error} />
						</div>
					) : null}
					{currentStep === "StepOne" ? (
						<div>
							{reasonText ? (
								<div style={{ gap: 8 }}>
									<Text
										style={{
											fontSize: 16,
											letterSpacing: 0,
											lineHeight: 1.3,
										}}
									>
										{reasonText}
									</Text>
									<Text
										style={{
											fontSize: 16,
											letterSpacing: 0,
											lineHeight: 1.3,
										}}
									>
										Don't have access to{" "}
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												lineHeight: 1.3,
												fontWeight: "600",
											}}
										>
											{currentAccount?.email}
										</Text>
										?{" "}
										<InlineLinkText
											to="#"
											label="Change email address"
											style={{
												fontSize: 16,
												letterSpacing: 0,
												lineHeight: 1.3,
											}}
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
								</div>
							) : (
								<Text
									style={{
										fontSize: 16,
										letterSpacing: 0,
										lineHeight: 1.3,
									}}
								>
									<>
										You'll receive an email at{" "}
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												lineHeight: 1.3,
												fontWeight: "600",
											}}
										>
											{currentAccount?.email}
										</Text>{" "}
										to verify it's you.
									</>{" "}
									<InlineLinkText
										to="#"
										label="Change email address"
										style={{
											fontSize: 16,
											letterSpacing: 0,
											lineHeight: 1.3,
										}}
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
						</div>
					) : (
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							{uiStrings[currentStep].message}
						</Text>
					)}
				</div>
				{currentStep === "StepTwo" ? (
					<div>
						<TextField.LabelText>Confirmation Code</TextField.LabelText>
						<TextField.Root>
							<TextField.Input
								label="Confirmation code"
								placeholder="XXXXX-XXXXX"
								onChangeText={setConfirmationCode}
							/>
						</TextField.Root>
					</div>
				) : null}
				<div
					style={{
						gap: 8,
						...(gtMobile && { flexDirection: "row-reverse", marginLeft: "auto" }),
					}}
				>
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
								{isProcessing ? <Loader size="sm" style={{ color: "white" }} /> : null}
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
								{isProcessing ? <Loader size="sm" style={{ color: "white" }} /> : null}
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
				</div>
			</div>
		</Dialog.ScrollableInner>
	);
}
