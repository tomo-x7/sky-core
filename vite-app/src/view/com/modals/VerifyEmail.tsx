import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { SafeAreaView } from "#/lib/safe-area-context";
import { cleanError } from "#/lib/strings/errors";
import { colors, s } from "#/lib/styles";
import { usePlaceholderStyle } from "#/lib/placeholderStyle";
import { useModalControls } from "#/state/modals";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "../util/Toast";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";
import { ScrollView } from "./util";

export const snapPoints = ["90%"];

enum Stages {
	Reminder = 0,
	Email = 1,
	ConfirmCode = 2,
}

export function Component({
	showReminder,
	onSuccess,
}: {
	showReminder?: boolean;
	onSuccess?: () => void;
}) {
	const pal = usePalette("default");
	const agent = useAgent();
	const { currentAccount } = useSession();
	const [stage, setStage] = useState<Stages>(showReminder ? Stages.Reminder : Stages.Email);
	const [confirmationCode, setConfirmationCode] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const { isMobile } = useWebMediaQueries();
	const { openModal, closeModal } = useModalControls();
	const phStyleCName = usePlaceholderStyle(pal.colors.textLight);

	React.useEffect(() => {
		if (!currentAccount) {
			console.error("VerifyEmail modal opened without currentAccount");
			closeModal();
		}
	}, [currentAccount, closeModal]);

	const onSendEmail = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.requestEmailConfirmation();
			setStage(Stages.ConfirmCode);
		} catch (e) {
			setError(cleanError(String(e)));
		} finally {
			setIsProcessing(false);
		}
	};

	const onConfirm = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.confirmEmail({
				email: (currentAccount?.email || "").trim(),
				token: confirmationCode.trim(),
			});
			await agent.resumeSession(agent.session!);
			Toast.show("Email verified");
			closeModal();
			onSuccess?.();
		} catch (e) {
			setError(cleanError(String(e)));
		} finally {
			setIsProcessing(false);
		}
	};

	const onEmailIncorrect = () => {
		closeModal();
		openModal({ name: "change-email" });
	};

	return (
		<SafeAreaView
			style={{
				...pal.view,
				...s.flex1,
			}}
		>
			<ScrollView
				style={{
					...s.flex1,
					...(isMobile && { paddingLeft: 18, paddingRight: 18 }),
				}}
			>
				{stage === Stages.Reminder && <ReminderIllustration />}
				<div style={styles.titleSection}>
					<Text
						type="title-lg"
						style={{
							...pal.text,
							...styles.title,
						}}
					>
						{stage === Stages.Reminder ? (
							<>Please Verify Your Email</>
						) : stage === Stages.Email ? (
							<>Verify Your Email</>
						) : stage === Stages.ConfirmCode ? (
							<>Enter Confirmation Code</>
						) : (
							""
						)}
					</Text>
				</div>

				<Text
					type="lg"
					style={{
						...pal.textLight,
						...{ marginBottom: 10 },
					}}
				>
					{stage === Stages.Reminder ? (
						<>
							Your email has not yet been verified. This is an important security step which we recommend.
						</>
					) : stage === Stages.Email ? (
						<>This is important in case you ever need to change your email or reset your password.</>
					) : stage === Stages.ConfirmCode ? (
						<>
							An email has been sent to {currentAccount?.email || "(no email)"}. It includes a
							confirmation code which you can enter below.
						</>
					) : (
						""
					)}
				</Text>

				{stage === Stages.Email ? (
					<>
						<div style={styles.emailContainer}>
							{/* @ts-expect-error */}
							<FontAwesomeIcon icon="envelope" color={pal.colors.text} size={16} />
							<Text
								type="xl-medium"
								style={{
									...pal.text,
									...s.flex1,
									...{ minWidth: 0 },
								}}
							>
								{currentAccount?.email || "(no email)"}
							</Text>
						</div>
						<button type="button" onClick={onEmailIncorrect} style={styles.changeEmailLink}>
							<Text type="lg" style={pal.link}>
								Change
							</Text>
						</button>
					</>
				) : stage === Stages.ConfirmCode ? (
					<input
						type="text"
						style={{
							...styles.textInput,
							...pal.border,
							...pal.text,
						}}
						placeholder="XXXXX-XXXXX"
						className={phStyleCName}
						value={confirmationCode}
						onChange={(ev) => setConfirmationCode(ev.target.value)}
						autoCapitalize="none"
						autoComplete="one-time-code"
						autoCorrect={"off"}
					/>
				) : undefined}

				{error ? <ErrorMessage message={error} style={styles.error} /> : undefined}

				<div style={styles.btnContainer}>
					{isProcessing ? (
						<div style={styles.btn}>
							<ActivityIndicator color="#fff" />
						</div>
					) : (
						<div style={{ gap: 6 }}>
							{stage === Stages.Reminder && (
								<Button
									type="primary"
									onPress={() => setStage(Stages.Email)}
									accessibilityLabel={"Get Started"}
									accessibilityHint=""
									label={"Get Started"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							{stage === Stages.Email && (
								<>
									<Button
										type="primary"
										onPress={onSendEmail}
										accessibilityLabel={"Send Confirmation Email"}
										accessibilityHint=""
										label={"Send Confirmation Email"}
										labelContainerStyle={{
											justifyContent: "center",
											padding: 4,
										}}
										labelStyle={s.f18}
									/>
									<Button
										type="default"
										accessibilityLabel={"I have a code"}
										accessibilityHint=""
										label={"I have a confirmation code"}
										labelContainerStyle={{
											justifyContent: "center",
											padding: 4,
										}}
										labelStyle={s.f18}
										onPress={() => setStage(Stages.ConfirmCode)}
									/>
								</>
							)}
							{stage === Stages.ConfirmCode && (
								<Button
									type="primary"
									onPress={onConfirm}
									accessibilityLabel={"Confirm"}
									accessibilityHint=""
									label={"Confirm"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							<Button
								type="default"
								onPress={() => {
									closeModal();
								}}
								accessibilityLabel={stage === Stages.Reminder ? "Not right now" : "Cancel"}
								accessibilityHint=""
								label={stage === Stages.Reminder ? "Not right now" : "Cancel"}
								labelContainerStyle={{ justifyContent: "center", padding: 4 }}
								labelStyle={s.f18}
							/>
						</div>
					)}
				</div>
			</ScrollView>
		</SafeAreaView>
	);
}

function ReminderIllustration() {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");
	return (
		<div
			style={{
				...pal.viewLight,
				...{ borderRadius: 8, marginBottom: 20 },
			}}
		>
			<svg viewBox="0 0 112 84" fill="none" height={200}>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M26 26.4264V55C26 60.5229 30.4772 65 36 65H76C81.5228 65 86 60.5229 86 55V27.4214L63.5685 49.8528C59.6633 53.7581 53.3316 53.7581 49.4264 49.8528L26 26.4264Z"
					fill={palInverted.colors.background}
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M83.666 19.5784C85.47 21.7297 84.4897 24.7895 82.5044 26.7748L60.669 48.6102C58.3259 50.9533 54.5269 50.9533 52.1838 48.6102L29.9502 26.3766C27.8241 24.2505 26.8952 20.8876 29.0597 18.8005C30.8581 17.0665 33.3045 16 36 16H76C79.0782 16 81.8316 17.3908 83.666 19.5784Z"
					fill={palInverted.colors.background}
				/>
				<circle cx="82" cy="61" r="13" fill="#20BC07" />
				<path d="M75 61L80 66L89 57" stroke="white" strokeWidth="2" />
			</svg>
		</div>
	);
}

const styles = {
	titleSection: {
		paddingTop: 0,
		paddingBottom: 14,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
		marginBottom: 5,
	},
	error: {
		borderRadius: 6,
		marginTop: 10,
	},
	emailContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingLeft: 14,
		paddingRight: 14,
		marginTop: 10,
	},
	changeEmailLink: {
		marginLeft: 12,
		marginRight: 12,
		marginBottom: 12,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 10,
		paddingBottom: 10,
		fontSize: 16,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 32,
		padding: 14,
		backgroundColor: colors.blue3,
	},
	btnContainer: {
		paddingTop: 20,
	},
} satisfies Record<string, React.CSSProperties>;
