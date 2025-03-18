import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";

import { atoms as a, useTheme as useNewTheme } from "#/alf";
import { Text as NewText } from "#/components/Typography";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { cleanError } from "#/lib/strings/errors";
import { colors, gradients, s } from "#/lib/styles";
import { usePlaceholderStyle } from "#/placeholderStyle";
import { useModalControls } from "#/state/modals";
import { DM_SERVICE_HEADERS } from "#/state/queries/messages/const";
import { useAgent, useSession, useSessionApi } from "#/state/session";
import { resetToTab } from "../../../Navigation";
import * as Toast from "../util/Toast";
import { ErrorMessage } from "../util/error/ErrorMessage";

export const snapPoints = ["55%"];

export function Component(props: {}) {
	const pal = usePalette("default");
	const theme = useTheme();
	const t = useNewTheme();
	const { currentAccount } = useSession();
	const agent = useAgent();
	const { removeAccount } = useSessionApi();
	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();
	const [isEmailSent, setIsEmailSent] = React.useState<boolean>(false);
	const [confirmCode, setConfirmCode] = React.useState<string>("");
	const [password, setPassword] = React.useState<string>("");
	const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string>("");
	const phStyleCName = usePlaceholderStyle(pal.textLight.color!);
	const onPressSendEmail = async () => {
		setError("");
		setIsProcessing(true);
		try {
			await agent.com.atproto.server.requestAccountDelete();
			setIsEmailSent(true);
		} catch (e: any) {
			setError(cleanError(e));
		}
		setIsProcessing(false);
	};
	const onPressConfirmDelete = async () => {
		if (!currentAccount?.did) {
			throw new Error("DeleteAccount modal: currentAccount.did is undefined");
		}

		setError("");
		setIsProcessing(true);
		const token = confirmCode.replace(/\s/g, "");

		try {
			// inform chat service of intent to delete account
			const { success } = await agent.api.chat.bsky.actor.deleteAccount(undefined, {
				headers: DM_SERVICE_HEADERS,
			});
			if (!success) {
				throw new Error("Failed to inform chat service of account deletion");
			}
			await agent.com.atproto.server.deleteAccount({
				did: currentAccount.did,
				password,
				token,
			});
			Toast.show("Your account has been deleted");
			resetToTab("HomeTab");
			removeAccount(currentAccount);
			closeModal();
		} catch (e: any) {
			setError(cleanError(e));
		}
		setIsProcessing(false);
	};
	const onCancel = () => {
		closeModal();
	};
	return (
		<SafeAreaView style={s.flex1}>
			{/* 元ScrollView */}
			<div style={pal.view} /*keyboardShouldPersistTaps="handled"*/>
				<div
					style={{
						...styles.titleContainer,
						...pal.view,
					}}
				>
					<Text
						type="title-xl"
						style={{
							...s.textCenter,
							...pal.text,
						}}
					>
						<>
							Delete Account{" "}
							<Text
								type="title-xl"
								style={{
									...pal.text,
									...s.bold,
								}}
							>
								"
							</Text>
							<Text
								type="title-xl"
								numberOfLines={1}
								style={{
									...(isMobile ? styles.titleMobile : styles.titleDesktop),
									...pal.text,
									...s.bold,
								}}
							>
								{currentAccount?.handle}
							</Text>
							<Text
								type="title-xl"
								style={{
									...pal.text,
									...s.bold,
								}}
							>
								"
							</Text>
						</>
					</Text>
				</div>
				{!isEmailSent ? (
					<>
						<Text
							type="lg"
							style={{
								...styles.description,
								...pal.text,
							}}
						>
							For security reasons, we'll need to send a confirmation code to your email address.
						</Text>
						{error ? (
							<div style={s.mt10}>
								<ErrorMessage message={error} />
							</div>
						) : undefined}
						{isProcessing ? (
							<div
								style={{
									...styles.btn,
									...s.mt10,
								}}
							>
								<ActivityIndicator />
							</div>
						) : (
							<>
								<TouchableOpacity
									style={styles.mt20}
									onPress={onPressSendEmail}
									accessibilityRole="button"
									accessibilityLabel={"Send email"}
									accessibilityHint={"Sends email with confirmation code for account deletion"}
								>
									<LinearGradient
										colors={[gradients.blueLight.start, gradients.blueLight.end]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={styles.btn}
									>
										<Text
											type="button-lg"
											style={{
												...s.white,
												...s.bold,
											}}
										>
											Send Email
										</Text>
									</LinearGradient>
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										...styles.btn,
										...s.mt10,
									}}
									onPress={onCancel}
									accessibilityRole="button"
									accessibilityLabel={"Cancel account deletion"}
									accessibilityHint=""
									onAccessibilityEscape={onCancel}
								>
									<Text type="button-lg" style={pal.textLight}>
										Cancel
									</Text>
								</TouchableOpacity>
							</>
						)}

						<div>
							<div
								style={{
									...a.w_full,
									...a.flex_row,
									...a.gap_sm,
									...a.mt_lg,
									...a.p_lg,
									...a.rounded_sm,
									...t.atoms.bg_contrast_25,
								}}
							>
								<CircleInfo
									size="md"
									style={{
										...a.relative,

										...{
											top: -1,
										},
									}}
								/>

								<NewText
									style={{
										...a.leading_snug,
										...a.flex_1,
									}}
								>
									You can also temporarily deactivate your account instead, and reactivate it at any
									time.
								</NewText>
							</div>
						</div>
					</>
				) : (
					<>
						{/* TODO: Update this label to be more concise */}
						<Text
							type="lg"
							style={{
								...pal.text,
								...styles.description,
							}}
						>
							Check your inbox for an email with the confirmation code to enter below:
						</Text>
						<input
							type="text"
							style={{
								...styles.textInput,
								...pal.borderDark,
								...pal.text,
								...styles.mb20,
							}}
							placeholder={"Confirmation code"}
							className={phStyleCName}
							value={confirmCode}
							onChange={(ev) => setConfirmCode(ev.target.value)}
						/>
						<Text
							type="lg"
							style={{
								...pal.text,
								...styles.description,
							}}
						>
							Please enter your password as well:
						</Text>
						<input
							type="password"
							style={{
								...styles.textInput,
								...pal.borderDark,
								...pal.text,
							}}
							placeholder={"Password"}
							className={phStyleCName}
							value={password}
							onChange={(ev) => setPassword(ev.target.value)}
						/>
						{error ? (
							<div style={styles.mt20}>
								<ErrorMessage message={error} />
							</div>
						) : undefined}
						{isProcessing ? (
							<div
								style={{
									...styles.btn,
									...s.mt10,
								}}
							>
								<ActivityIndicator />
							</div>
						) : (
							<>
								<TouchableOpacity
									style={{
										...styles.btn,
										...styles.evilBtn,
										...styles.mt20,
									}}
									onPress={onPressConfirmDelete}
									accessibilityRole="button"
									accessibilityLabel={"Confirm delete account"}
									accessibilityHint=""
								>
									<Text
										type="button-lg"
										style={{
											...s.white,
											...s.bold,
										}}
									>
										Delete my account
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										...styles.btn,
										...s.mt10,
									}}
									onPress={onCancel}
									accessibilityRole="button"
									accessibilityLabel={"Cancel account deletion"}
									accessibilityHint={"Exits account deletion process"}
									onAccessibilityEscape={onCancel}
								>
									<Text type="button-lg" style={pal.textLight}>
										Cancel
									</Text>
								</TouchableOpacity>
							</>
						)}
					</>
				)}
			</div>
		</SafeAreaView>
	);
}

const styles = {
	titleContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		flexWrap: "wrap",
		marginTop: 12,
		marginBottom: 12,
		marginLeft: 20,
		marginRight: 20,
	},
	titleMobile: {
		textAlign: "center",
	},
	titleDesktop: {
		textAlign: "center",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		maxWidth: "400px",
	},
	description: {
		textAlign: "center",
		paddingLeft: 22,
		paddingRight: 22,
		marginBottom: 10,
	},
	mt20: {
		marginTop: 20,
	},
	mb20: {
		marginBottom: 20,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		padding: "12px 16px",
		fontSize: 20,
		marginLeft: 20,
		marginRight: 20,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 32,
		padding: 14,
		marginLeft: 20,
		marginRight: 20,
	},
	evilBtn: {
		backgroundColor: colors.red4,
	},
} satisfies Record<string, React.CSSProperties>;
