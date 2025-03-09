import type { ComAtprotoServerDescribeServer } from "@atproto/api";
import { BskyAgent } from "@atproto/api";
import * as EmailValidator from "email-validator";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard, View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { FormError } from "#/components/forms/FormError";
import { HostingProvider } from "#/components/forms/HostingProvider";
import * as TextField from "#/components/forms/TextField";
import { At_Stroke2_Corner0_Rounded as At } from "#/components/icons/At";
import { isNetworkError } from "#/lib/strings/errors";
import { cleanError } from "#/lib/strings/errors";
import { FormContainer } from "./FormContainer";

type ServiceDescription = ComAtprotoServerDescribeServer.OutputSchema;

export const ForgotPasswordForm = ({
	error,
	serviceUrl,
	serviceDescription,
	setError,
	setServiceUrl,
	onPressBack,
	onEmailSent,
}: {
	error: string;
	serviceUrl: string;
	serviceDescription: ServiceDescription | undefined;
	setError: (v: string) => void;
	setServiceUrl: (v: string) => void;
	onPressBack: () => void;
	onEmailSent: () => void;
}) => {
	const t = useTheme();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [email, setEmail] = useState<string>("");

	const onPressSelectService = React.useCallback(() => {
		Keyboard.dismiss();
	}, []);

	const onPressNext = async () => {
		if (!EmailValidator.validate(email)) {
			return setError("Your email appears to be invalid.");
		}

		setError("");
		setIsProcessing(true);

		try {
			const agent = new BskyAgent({ service: serviceUrl });
			await agent.com.atproto.server.requestPasswordReset({ email });
			onEmailSent();
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

	return (
		<FormContainer testID="forgotPasswordForm" titleText={<>Reset password</>}>
			<View>
				<TextField.LabelText>Hosting provider</TextField.LabelText>
				<HostingProvider
					serviceUrl={serviceUrl}
					onSelectServiceUrl={setServiceUrl}
					onOpenDialog={onPressSelectService}
				/>
			</View>
			<View>
				<TextField.LabelText>Email address</TextField.LabelText>
				<TextField.Root>
					<TextField.Icon icon={At} />
					<TextField.Input
						testID="forgotPasswordEmail"
						label={"Enter your email address"}
						autoCapitalize="none"
						autoFocus
						autoCorrect={false}
						autoComplete="email"
						value={email}
						onChangeText={setEmail}
						editable={!isProcessing}
						accessibilityHint={"Sets email for password reset"}
					/>
				</TextField.Root>
			</View>

			<Text style={[t.atoms.text_contrast_high, a.leading_snug]}>
				Enter the email you used to create your account. We'll send you a "reset code" so you can set a new
				password.
			</Text>

			<FormError error={error} />

			<View style={[a.flex_row, a.align_center, a.pt_md]}>
				<Button label={"Back"} variant="solid" color="secondary" size="large" onPress={onPressBack}>
					<ButtonText>Back</ButtonText>
				</Button>
				<View style={a.flex_1} />
				{!serviceDescription || isProcessing ? (
					<ActivityIndicator />
				) : (
					<Button label={"Next"} variant="solid" color={"primary"} size="large" onPress={onPressNext}>
						<ButtonText>Next</ButtonText>
					</Button>
				)}
				{!serviceDescription || isProcessing ? (
					<Text style={[t.atoms.text_contrast_high, a.pl_md]}>Processing...</Text>
				) : undefined}
			</View>
			<View style={[t.atoms.border_contrast_medium, a.border_t, a.pt_2xl, a.mt_md, a.flex_row, a.justify_center]}>
				<Button
					testID="skipSendEmailButton"
					onPress={onEmailSent}
					label={"Go to next"}
					accessibilityHint={"Navigates to the next screen"}
					size="large"
					variant="ghost"
					color="secondary"
				>
					<ButtonText>Already have a code?</ButtonText>
				</Button>
			</View>
		</FormContainer>
	);
};
