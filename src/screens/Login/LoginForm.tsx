import { ComAtprotoServerCreateSession, type ComAtprotoServerDescribeServer } from "@atproto/api";
import React, { useRef, useState } from "react";

import { atoms as a, useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { FormError } from "#/components/forms/FormError";
import { HostingProvider } from "#/components/forms/HostingProvider";
import * as TextField from "#/components/forms/TextField";
import { At_Stroke2_Corner0_Rounded as AtIcon } from "#/components/icons/At";
import { Lock_Stroke2_Corner0_Rounded as Lock } from "#/components/icons/Lock";
import { Ticket_Stroke2_Corner0_Rounded as Ticket } from "#/components/icons/Ticket";
import { Keyboard } from "#/lib/Keyboard";
import { isNetworkError } from "#/lib/strings/errors";
import { cleanError } from "#/lib/strings/errors";
import { createFullHandle } from "#/lib/strings/handles";
import { useSetHasCheckedForStarterPack } from "#/state/preferences/used-starter-packs";
import { useSessionApi } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { FormContainer } from "./FormContainer";

type ServiceDescription = ComAtprotoServerDescribeServer.OutputSchema;

export const LoginForm = ({
	error,
	serviceUrl,
	serviceDescription,
	initialHandle,
	setError,
	setServiceUrl,
	onPressRetryConnect,
	onPressBack,
	onPressForgotPassword,
	onAttemptSuccess,
	onAttemptFailed,
}: {
	error: string;
	serviceUrl: string;
	serviceDescription: ServiceDescription | undefined;
	initialHandle: string;
	setError: (v: string) => void;
	setServiceUrl: (v: string) => void;
	onPressRetryConnect: () => void;
	onPressBack: () => void;
	onPressForgotPassword: () => void;
	onAttemptSuccess: () => void;
	onAttemptFailed: () => void;
}) => {
	const t = useTheme();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isAuthFactorTokenNeeded, setIsAuthFactorTokenNeeded] = useState<boolean>(false);
	const [isAuthFactorTokenValueEmpty, setIsAuthFactorTokenValueEmpty] = useState<boolean>(true);
	const identifierValueRef = useRef<string>(initialHandle || "");
	const passwordValueRef = useRef<string>("");
	const authFactorTokenValueRef = useRef<string>("");
	const passwordRef = useRef<HTMLInputElement>(null);
	const { login } = useSessionApi();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const setHasCheckedForStarterPack = useSetHasCheckedForStarterPack();

	const onPressSelectService = React.useCallback(() => {
		Keyboard.dismiss();
	}, []);

	const onPressNext = async () => {
		if (isProcessing) return;
		Keyboard.dismiss();
		// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setError("");

		const identifier = identifierValueRef.current.toLowerCase().trim();
		const password = passwordValueRef.current;
		const authFactorToken = authFactorTokenValueRef.current;

		if (!identifier) {
			setError("Please enter your username");
			return;
		}

		if (!password) {
			setError("Please enter your password");
			return;
		}

		setIsProcessing(true);

		try {
			// try to guess the handle if the user just gave their own username
			let fullIdent = identifier;
			if (
				!identifier.includes("@") && // not an email
				!identifier.includes(".") && // not a domain
				serviceDescription &&
				serviceDescription.availableUserDomains.length > 0
			) {
				let matched = false;
				for (const domain of serviceDescription.availableUserDomains) {
					if (fullIdent.endsWith(domain)) {
						matched = true;
					}
				}
				if (!matched) {
					fullIdent = createFullHandle(identifier, serviceDescription.availableUserDomains[0]);
				}
			}

			// TODO remove double login
			await login({
				service: serviceUrl,
				identifier: fullIdent,
				password,
				authFactorToken: authFactorToken.trim(),
			});
			onAttemptSuccess();
			setShowLoggedOut(false);
			setHasCheckedForStarterPack(true);
		} catch (e: any) {
			const errMsg = e.toString();
			// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			setIsProcessing(false);
			if (e instanceof ComAtprotoServerCreateSession.AuthFactorTokenRequiredError) {
				setIsAuthFactorTokenNeeded(true);
			} else {
				onAttemptFailed();
				if (errMsg.includes("Token is invalid")) {
					setError("Invalid 2FA confirmation code.");
				} else if (
					errMsg.includes("Authentication Required") ||
					errMsg.includes("Invalid identifier or password")
				) {
					setError("Incorrect username or password");
				} else if (isNetworkError(e)) {
					setError("Unable to contact your service. Please check your Internet connection.");
				} else {
					setError(cleanError(errMsg));
				}
			}
		}
	};

	return (
		<FormContainer titleText={<>Sign in</>}>
			<div>
				<TextField.LabelText>Hosting provider</TextField.LabelText>
				<HostingProvider
					serviceUrl={serviceUrl}
					onSelectServiceUrl={setServiceUrl}
					onOpenDialog={onPressSelectService}
				/>
			</div>
			<div>
				<TextField.LabelText>Account</TextField.LabelText>
				<div style={a.gap_sm}>
					<TextField.Root>
						<TextField.Icon icon={AtIcon} />
						<TextField.Input
							label={"Username or email address"}
							autoCapitalize="none"
							autoFocus
							autoCorrect={"off"}
							autoComplete="username"
							returnKeyType="next"
							// textContentType="username"
							defaultValue={initialHandle || ""}
							onChangeText={(v) => {
								identifierValueRef.current = v;
							}}
							onSubmitEditing={() => {
								passwordRef.current?.focus();
							}}
							blurOnSubmit={false} // prevents flickering due to onSubmitEditing going to next field
							disabled={isProcessing}
						/>
					</TextField.Root>

					<TextField.Root>
						<TextField.Icon icon={Lock} />
						<TextField.Input
							inputRef={passwordRef}
							label={"Password"}
							autoCapitalize="none"
							autoCorrect={"off"}
							autoComplete="password"
							returnKeyType="done"
							enablesReturnKeyAutomatically={true}
							type="password"
							// TODO
							// clearButtonMode="while-editing"
							onChangeText={(v) => {
								passwordValueRef.current = v;
							}}
							onSubmitEditing={onPressNext}
							blurOnSubmit={false} // HACK: https://github.com/facebook/react-native/issues/21911#issuecomment-558343069 Keyboard blur behavior is now handled in onSubmitEditing
							disabled={isProcessing}
						/>
						<Button
							onPress={onPressForgotPassword}
							label={"Forgot password?"}
							variant="solid"
							color="secondary"
							style={{
								...a.rounded_sm,

								...// t.atoms.bg_contrast_100,
								{ marginLeft: "auto", left: 6, padding: 6 },

								...a.z_10,
							}}
						>
							<ButtonText>Forgot?</ButtonText>
						</Button>
					</TextField.Root>
				</div>
			</div>
			{isAuthFactorTokenNeeded && (
				<div>
					<TextField.LabelText>2FA Confirmation</TextField.LabelText>
					<TextField.Root>
						<TextField.Icon icon={Ticket} />
						<TextField.Input
							label={"Confirmation code"}
							autoCapitalize="none"
							autoFocus
							autoCorrect={"off"}
							autoComplete="one-time-code"
							returnKeyType="done"
							blurOnSubmit={false} // prevents flickering due to onSubmitEditing going to next field
							onChangeText={(v) => {
								setIsAuthFactorTokenValueEmpty(v === "");
								authFactorTokenValueRef.current = v;
							}}
							onSubmitEditing={onPressNext}
							disabled={isProcessing}
							style={{
								textTransform: isAuthFactorTokenValueEmpty ? "none" : "uppercase",
							}}
						/>
					</TextField.Root>
					<Text
						style={{
							...a.text_sm,
							...t.atoms.text_contrast_medium,
							...a.mt_sm,
						}}
					>
						Check your email for a sign in code and enter it here.
					</Text>
				</div>
			)}
			<FormError error={error} />
			<div
				style={{
					...a.flex_row,
					...a.align_center,
					...a.pt_md,
				}}
			>
				<Button label={"Back"} variant="solid" color="secondary" size="large" onPress={onPressBack}>
					<ButtonText>Back</ButtonText>
				</Button>
				<div style={a.flex_1} />
				{!serviceDescription && error ? (
					<Button
						label={"Retry"}
						variant="solid"
						color="secondary"
						size="large"
						onPress={onPressRetryConnect}
					>
						<ButtonText>Retry</ButtonText>
					</Button>
				) : !serviceDescription ? (
					<>
						<ActivityIndicator />
						<Text
							style={{
								...t.atoms.text_contrast_high,
								...a.pl_md,
							}}
						>
							Connecting...
						</Text>
					</>
				) : (
					<Button label={"Next"} variant="solid" color="primary" size="large" onPress={onPressNext}>
						<ButtonText>Next</ButtonText>
						{isProcessing && <ButtonIcon icon={Loader} />}
					</Button>
				)}
			</div>
		</FormContainer>
	);
};
