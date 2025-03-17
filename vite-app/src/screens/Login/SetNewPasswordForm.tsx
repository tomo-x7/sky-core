import { BskyAgent } from "@atproto/api";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { FormError } from "#/components/forms/FormError";
import * as TextField from "#/components/forms/TextField";
import { Lock_Stroke2_Corner0_Rounded as Lock } from "#/components/icons/Lock";
import { Ticket_Stroke2_Corner0_Rounded as Ticket } from "#/components/icons/Ticket";
import { isNetworkError } from "#/lib/strings/errors";
import { cleanError } from "#/lib/strings/errors";
import { checkAndFormatResetCode } from "#/lib/strings/password";
import { FormContainer } from "./FormContainer";

export const SetNewPasswordForm = ({
	error,
	serviceUrl,
	setError,
	onPressBack,
	onPasswordSet,
}: {
	error: string;
	serviceUrl: string;
	setError: (v: string) => void;
	onPressBack: () => void;
	onPasswordSet: () => void;
}) => {
	const t = useTheme();

	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [resetCode, setResetCode] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const onPressNext = async () => {
		// Check that the code is correct. We do this again just incase the user enters the code after their pw and we
		// don't get to call onBlur first
		const formattedCode = checkAndFormatResetCode(resetCode);

		if (!formattedCode) {
			setError("You have entered an invalid code. It should look like XXXXX-XXXXX.");
			return;
		}

		// TODO Better password strength check
		if (!password) {
			setError("Please enter a password.");
			return;
		}

		setError("");
		setIsProcessing(true);

		try {
			const agent = new BskyAgent({ service: serviceUrl });
			await agent.com.atproto.server.resetPassword({
				token: formattedCode,
				password,
			});
			onPasswordSet();
		} catch (e: any) {
			const errMsg = e.toString();
			setIsProcessing(false);
			if (isNetworkError(e)) {
				setError("Unable to contact your service. Please check your Internet connection.");
			} else {
				setError(cleanError(errMsg));
			}
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
		<FormContainer titleText={<>Set new password</>}>
			<Text
				style={{
					...a.leading_snug,
					...a.mb_sm,
				}}
			>
				You will receive an email with a "reset code." Enter that code here, then enter your new password.
			</Text>
			<View>
				<TextField.LabelText>Reset code</TextField.LabelText>
				<TextField.Root>
					<TextField.Icon icon={Ticket} />
					<TextField.Input
						label={"Looks like XXXXX-XXXXX"}
						autoCapitalize="none"
						autoFocus={true}
						autoCorrect={"off"}
						autoComplete="off"
						value={resetCode}
						onChangeText={setResetCode}
						onFocus={() => setError("")}
						onBlur={onBlur}
						disabled={isProcessing}
					/>
				</TextField.Root>
			</View>
			<View>
				<TextField.LabelText>New password</TextField.LabelText>
				<TextField.Root>
					<TextField.Icon icon={Lock} />
					<TextField.Input
						label={"Enter a password"}
						autoCapitalize="none"
						autoCorrect={"off"}
						autoComplete="password"
						returnKeyType="done"
						type="password"
						// TODO
						// clearButtonMode="while-editing"
						value={password}
						onChangeText={setPassword}
						onSubmitEditing={onPressNext}
						disabled={isProcessing}
					/>
				</TextField.Root>
			</View>
			<FormError error={error} />
			<div
				style={{
					...a.flex_row,
					...a.align_center,
					...a.pt_lg,
				}}
			>
				<Button label={"Back"} variant="solid" color="secondary" size="large" onPress={onPressBack}>
					<ButtonText>Back</ButtonText>
				</Button>
				<div style={a.flex_1} />
				{isProcessing ? (
					<ActivityIndicator />
				) : (
					<Button label={"Next"} variant="solid" color="primary" size="large" onPress={onPressNext}>
						<ButtonText>Next</ButtonText>
					</Button>
				)}
				{isProcessing ? (
					<Text
						style={{
							...t.atoms.text_contrast_high,
							...a.pl_md,
						}}
					>
						Updating...
					</Text>
				) : undefined}
			</div>
		</FormContainer>
	);
};
