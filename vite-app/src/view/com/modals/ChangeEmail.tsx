import { useState } from "react";

import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { SafeAreaView } from "#/lib/safe-area-context";
import { cleanError } from "#/lib/strings/errors";
import { colors, s } from "#/lib/styles";
import { usePlaceholderStyle } from "#/placeholderStyle";
import { useModalControls } from "#/state/modals";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "../util/Toast";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";
import { ScrollView } from "./util";

enum Stages {
	InputEmail = 0,
	ConfirmCode = 1,
	Done = 2,
}

export const snapPoints = ["90%"];

export function Component() {
	const pal = usePalette("default");
	const { currentAccount } = useSession();
	const agent = useAgent();
	const [stage, setStage] = useState<Stages>(Stages.InputEmail);
	const [email, setEmail] = useState<string>(currentAccount?.email || "");
	const [confirmationCode, setConfirmationCode] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const { isMobile } = useWebMediaQueries();
	const { openModal, closeModal } = useModalControls();
	const phStyleCName = usePlaceholderStyle(pal.colors.textLight);

	const onRequestChange = async () => {
		if (email === currentAccount?.email) {
			setError("Enter your new email above");
			return;
		}
		setError("");
		setIsProcessing(true);
		try {
			const res = await agent.com.atproto.server.requestEmailUpdate();
			if (res.data.tokenRequired) {
				setStage(Stages.ConfirmCode);
			} else {
				await agent.com.atproto.server.updateEmail({ email: email.trim() });
				await agent.resumeSession(agent.session!);
				Toast.show("Email updated");
				setStage(Stages.Done);
			}
		} catch (e) {
			let err = cleanError(String(e));
			// TEMP
			// while rollout is occuring, we're giving a temporary error message
			// you can remove this any time after Oct2023
			// -prf
			if (err === "email must be confirmed (temporary)") {
				err =
					"Please confirm your email before changing it. This is a temporary requirement while email-updating tools are added, and it will soon be removed.";
			}
			setError(err);
		} finally {
			setIsProcessing(false);
		}
	};

	const onConfirm = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.updateEmail({
				email: email.trim(),
				token: confirmationCode.trim(),
			});
			await agent.resumeSession(agent.session!);
			Toast.show("Email updated");
			setStage(Stages.Done);
		} catch (e) {
			setError(cleanError(String(e)));
		} finally {
			setIsProcessing(false);
		}
	};

	const onVerify = async () => {
		closeModal();
		openModal({ name: "verify-email" });
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
				<div style={styles.titleSection}>
					<Text
						type="title-lg"
						style={{
							...pal.text,
							...styles.title,
						}}
					>
						{stage === Stages.InputEmail ? "Change Your Email" : ""}
						{stage === Stages.ConfirmCode ? "Security Step Required" : ""}
						{stage === Stages.Done ? "Email Updated" : ""}
					</Text>
				</div>

				<Text
					type="lg"
					style={{
						...pal.textLight,
						...{ marginBottom: 10 },
					}}
				>
					{stage === Stages.InputEmail ? (
						<>Enter your new email address below.</>
					) : stage === Stages.ConfirmCode ? (
						<>
							An email has been sent to your previous address, {currentAccount?.email || "(no email)"}. It
							includes a confirmation code which you can enter below.
						</>
					) : (
						<>Your email has been updated but not verified. As a next step, please verify your new email.</>
					)}
				</Text>

				{stage === Stages.InputEmail && (
					<input
						type="text"
						style={{
							...styles.textInput,
							...pal.border,
							...pal.text,
						}}
						placeholder="alice@mail.com"
						value={email}
						onChange={(ev) => setEmail(ev.target.value)}
						autoCapitalize="none"
						autoComplete="email"
						autoCorrect={"off"}
						className={phStyleCName}
					/>
				)}
				{stage === Stages.ConfirmCode && (
					<input
						type="text"
						style={{
							...styles.textInput,
							...pal.border,
							...pal.text,
						}}
						placeholder="XXXXX-XXXXX"
						value={confirmationCode}
						onChange={(ev) => setConfirmationCode(ev.target.value)}
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect={"off"}
						className={phStyleCName}
					/>
				)}

				{error ? <ErrorMessage message={error} style={styles.error} /> : undefined}

				<div style={styles.btnContainer}>
					{isProcessing ? (
						<div style={styles.btn}>
							<ActivityIndicator color="#fff" />
						</div>
					) : (
						<div style={{ gap: 6 }}>
							{stage === Stages.InputEmail && (
								<Button
									type="primary"
									onPress={onRequestChange}
									accessibilityLabel={"Request Change"}
									accessibilityHint=""
									label={"Request Change"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							{stage === Stages.ConfirmCode && (
								<Button
									type="primary"
									onPress={onConfirm}
									accessibilityLabel={"Confirm Change"}
									accessibilityHint=""
									label={"Confirm Change"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							{stage === Stages.Done && (
								<Button
									type="primary"
									onPress={onVerify}
									accessibilityLabel={"Verify New Email"}
									accessibilityHint=""
									label={"Verify New Email"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							<Button
								type="default"
								onPress={() => {
									closeModal();
								}}
								accessibilityLabel={"Cancel"}
								accessibilityHint=""
								label={"Cancel"}
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
		borderWidth: 1,
		borderRadius: 6,
		padding: "12px 14px",
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		padding: "10px 14px",
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
