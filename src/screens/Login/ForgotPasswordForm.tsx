import type { ComAtprotoServerDescribeServer } from "@atproto/api";
import { BskyAgent } from "@atproto/api";
import * as EmailValidator from "email-validator";
import React, { useState } from "react";

import { useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { FormError } from "#/components/forms/FormError";
import { HostingProvider } from "#/components/forms/HostingProvider";
import * as TextField from "#/components/forms/TextField";
import { At_Stroke2_Corner0_Rounded as At } from "#/components/icons/At";
import { Keyboard } from "#/lib/Keyboard";
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
		<FormContainer titleText={<>Reset password</>}>
			<div>
				<TextField.LabelText>Hosting provider</TextField.LabelText>
				<HostingProvider
					serviceUrl={serviceUrl}
					onSelectServiceUrl={setServiceUrl}
					onOpenDialog={onPressSelectService}
				/>
			</div>
			<div>
				<TextField.LabelText>Email address</TextField.LabelText>
				<TextField.Root>
					<TextField.Icon icon={At} />
					<TextField.Input
						label={"Enter your email address"}
						autoCapitalize="none"
						autoFocus
						autoCorrect={""}
						autoComplete="email"
						value={email}
						onChangeText={setEmail}
						disabled={isProcessing}
					/>
				</TextField.Root>
			</div>
			<Text
				style={{
					...t.atoms.text_contrast_high,
					lineHeight: 1.3,
				}}
			>
				Enter the email you used to create your account. We'll send you a "reset code" so you can set a new
				password.
			</Text>
			<FormError error={error} />
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingTop: 12,
				}}
			>
				<Button label={"Back"} variant="solid" color="secondary" size="large" onPress={onPressBack}>
					<ButtonText>Back</ButtonText>
				</Button>
				<div style={{ flex: 1 }} />
				{!serviceDescription || isProcessing ? (
					<ActivityIndicator />
				) : (
					<Button label={"Next"} variant="solid" color={"primary"} size="large" onPress={onPressNext}>
						<ButtonText>Next</ButtonText>
					</Button>
				)}
				{!serviceDescription || isProcessing ? (
					<Text
						style={{
							...t.atoms.text_contrast_high,
							paddingLeft: 12,
						}}
					>
						Processing...
					</Text>
				) : undefined}
			</div>
			<div
				style={{
					...t.atoms.border_contrast_medium,
					borderTop: "1px solid black",
					borderTopWidth: 1,
					paddingTop: 24,
					marginTop: 12,
					flexDirection: "row",
					justifyContent: "center",
				}}
			>
				<Button onPress={onEmailSent} label={"Go to next"} size="large" variant="ghost" color="secondary">
					<ButtonText>Already have a code?</ButtonText>
				</Button>
			</div>
		</FormContainer>
	);
};
