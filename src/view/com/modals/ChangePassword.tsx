import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as EmailValidator from "email-validator";
import { useState } from "react";

import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { usePlaceholderStyle } from "#/lib/placeholderStyle";
import { SafeAreaView } from "#/lib/safe-area-context";
import { cleanError, isNetworkError } from "#/lib/strings/errors";
import { checkAndFormatResetCode } from "#/lib/strings/password";
import { colors, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { useAgent, useSession } from "#/state/session";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";
import { ScrollView } from "./util";

enum Stages {
	RequestCode = 0,
	ChangePassword = 1,
	Done = 2,
}

export const snapPoints = ["45%"];

export function Component() {
	const pal = usePalette("default");
	const { currentAccount } = useSession();
	const agent = useAgent();
	const [stage, setStage] = useState<Stages>(Stages.RequestCode);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [resetCode, setResetCode] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const { isMobile } = useWebMediaQueries();
	const { closeModal } = useModalControls();
	const phStyleCName = usePlaceholderStyle(pal.colors.textLight);

	const onRequestCode = async () => {
		if (!currentAccount?.email || !EmailValidator.validate(currentAccount.email)) {
			return setError("Your email appears to be invalid.");
		}

		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.requestPasswordReset({
				email: currentAccount.email,
			});
			setStage(Stages.ChangePassword);
		} catch (e: any) {
			const errMsg = e.toString();
			if (isNetworkError(e)) {
				setError("Unable to contact your service. Please check your Internet connection.");
			} else {
				setError(cleanError(errMsg));
			}
		} finally {
			setIsProcessing(false);
		}
	};

	const onChangePassword = async () => {
		const formattedCode = checkAndFormatResetCode(resetCode);
		if (!formattedCode) {
			setError("You have entered an invalid code. It should look like XXXXX-XXXXX.");
			return;
		}
		if (!newPassword) {
			setError("Please enter a password. It must be at least 8 characters long.");
			return;
		}
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.resetPassword({
				token: formattedCode,
				password: newPassword,
			});
			setStage(Stages.Done);
		} catch (e: any) {
			const errMsg = e.toString();
			if (isNetworkError(e)) {
				setError("Unable to contact your service. Please check your Internet connection.");
			} else {
				setError(cleanError(errMsg));
			}
		} finally {
			setIsProcessing(false);
		}
	};

	const onBlur = () => {
		const formattedCode = checkAndFormatResetCode(resetCode);
		if (!formattedCode) {
			setError("You have entered an invalid code. It should look like XXXXX-XXXXX.");
			return;
		}
		setResetCode(formattedCode);
	};

	return (
		<SafeAreaView
			style={{
				...pal.view,
				...s.flex1,
			}}
		>
			<ScrollView
				contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
				keyboardShouldPersistTaps="handled"
			>
				<div>
					<div style={styles.titleSection}>
						<Text
							type="title-lg"
							style={{
								...pal.text,
								...styles.title,
							}}
						>
							{stage !== Stages.Done ? "Change Password" : "Password Changed"}
						</Text>
					</div>

					<Text
						type="lg"
						style={{
							...pal.textLight,
							...{ marginBottom: 10 },
						}}
					>
						{stage === Stages.RequestCode ? (
							<>
								If you want to change your password, we will send you a code to verify that this is your
								account.
							</>
						) : stage === Stages.ChangePassword ? (
							<>Enter the code you received to change your password.</>
						) : (
							<>Your password has been changed successfully!</>
						)}
					</Text>

					{stage === Stages.RequestCode && (
						<div
							style={{
								...s.flexRow,
								...s.justifyCenter,
								...s.mt10,
							}}
						>
							<button type="button" onClick={() => setStage(Stages.ChangePassword)}>
								<Text
									type="xl"
									style={{
										...pal.link,
										...s.pr5,
									}}
								>
									Already have a code?
								</Text>
							</button>
						</div>
					)}
					{stage === Stages.ChangePassword && (
						<div
							style={{
								...pal.border,
								...styles.group,
							}}
						>
							<div style={styles.groupContent}>
								<FontAwesomeIcon
									icon="ticket"
									style={{
										...pal.textLight,
										...styles.groupContentIcon,
									}}
								/>
								<input
									type="text"
									style={{
										...pal.text,
										...styles.textInput,
									}}
									placeholder={"Reset code"}
									className={phStyleCName}
									value={resetCode}
									onChange={(ev) => setResetCode(ev.target.value)}
									onFocus={() => setError("")}
									onBlur={onBlur}
									autoCapitalize="none"
									autoCorrect={"off"}
									autoComplete="off"
								/>
							</div>
							<div
								style={{
									...pal.borderDark,
									...styles.groupContent,
									...styles.groupBottom,
								}}
							>
								<FontAwesomeIcon
									icon="lock"
									style={{
										...pal.textLight,
										...styles.groupContentIcon,
									}}
								/>
								<input
									type="password"
									style={{
										...pal.text,
										...styles.textInput,
									}}
									placeholder={"New password"}
									className={phStyleCName}
									onChange={(ev) => setNewPassword(ev.target.value)}
									autoCapitalize="none"
									autoComplete="new-password"
								/>
							</div>
						</div>
					)}
					{error ? <ErrorMessage message={error} style={styles.error} /> : undefined}
				</div>
				<div style={styles.btnContainer}>
					{isProcessing ? (
						<div style={styles.btn}>
							<ActivityIndicator color="#fff" />
						</div>
					) : (
						<div style={{ gap: 6 }}>
							{stage === Stages.RequestCode && (
								<Button
									type="primary"
									onPress={onRequestCode}
									accessibilityLabel={"Request Code"}
									accessibilityHint=""
									label={"Request Code"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							{stage === Stages.ChangePassword && (
								<Button
									type="primary"
									onPress={onChangePassword}
									accessibilityLabel={"Next"}
									accessibilityHint=""
									label={"Next"}
									labelContainerStyle={{ justifyContent: "center", padding: 4 }}
									labelStyle={s.f18}
								/>
							)}
							<Button
								type={stage !== Stages.Done ? "default" : "primary"}
								onPress={() => {
									closeModal();
								}}
								accessibilityLabel={stage !== Stages.Done ? "Cancel" : "Close"}
								accessibilityHint=""
								label={stage !== Stages.Done ? "Cancel" : "Close"}
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
	container: {
		justifyContent: "space-between",
	},
	containerMobile: {
		paddingLeft: 18,
		paddingRight: 18,
		paddingBottom: 35,
	},
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
	},
	textInput: {
		width: "100%",
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
	group: {
		borderWidth: 1,
		borderRadius: 10,
		marginTop: 20,
		marginBottom: 20,
	},
	groupLabel: {
		paddingLeft: 20,
		paddingRight: 20,
		paddingBottom: 5,
	},
	groupContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	groupBottom: {
		borderTopWidth: 1,
	},
	groupContentIcon: {
		marginLeft: 10,
	},
} satisfies Record<string, React.CSSProperties>;
