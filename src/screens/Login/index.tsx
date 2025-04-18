import React, { useRef } from "react";

import { atoms as a } from "#/alf";
import { BSKY_SERVICE } from "#/lib/constants";
import { ForgotPasswordForm } from "#/screens/Login/ForgotPasswordForm";
import { LoginForm } from "#/screens/Login/LoginForm";
import { PasswordUpdatedForm } from "#/screens/Login/PasswordUpdatedForm";
import { SetNewPasswordForm } from "#/screens/Login/SetNewPasswordForm";
import { useServiceQuery } from "#/state/queries/service";
import { type SessionAccount, useSession } from "#/state/session";
import { useLoggedOutView } from "#/state/shell/logged-out";
import { LoggedOutLayout } from "#/view/com/util/layouts/LoggedOutLayout";
import { ChooseAccountForm } from "./ChooseAccountForm";
import { ScreenTransition } from "./ScreenTransition";

enum Forms {
	Login = 0,
	ChooseAccount = 1,
	ForgotPassword = 2,
	SetNewPassword = 3,
	PasswordUpdated = 4,
}

export const Login = ({ onPressBack }: { onPressBack: () => void }) => {
	const failedAttemptCountRef = useRef(0);
	const startTimeRef = useRef(Date.now());

	const { accounts } = useSession();
	const { requestedAccountSwitchTo } = useLoggedOutView();
	const requestedAccount = accounts.find((acc) => acc.did === requestedAccountSwitchTo);

	const [error, setError] = React.useState<string>("");
	const [serviceUrl, setServiceUrl] = React.useState<string>(requestedAccount?.service || BSKY_SERVICE);
	const [initialHandle, setInitialHandle] = React.useState<string>(requestedAccount?.handle || "");
	const [currentForm, setCurrentForm] = React.useState<Forms>(
		requestedAccount ? Forms.Login : accounts.length ? Forms.ChooseAccount : Forms.Login,
	);

	const { data: serviceDescription, error: serviceError, refetch: refetchService } = useServiceQuery(serviceUrl);

	const onSelectAccount = (account?: SessionAccount) => {
		if (account?.service) {
			setServiceUrl(account.service);
		}
		setInitialHandle(account?.handle || "");
		setCurrentForm(Forms.Login);
	};

	const gotoForm = (form: Forms) => {
		setError("");
		setCurrentForm(form);
	};

	React.useEffect(() => {
		if (serviceError) {
			setError("Unable to contact your service. Please check your Internet connection.");
		} else {
			setError("");
		}
	}, [serviceError]);

	const onPressForgotPassword = () => setCurrentForm(Forms.ForgotPassword);

	const handlePressBack = () => onPressBack();

	const onAttemptSuccess = () => setCurrentForm(Forms.Login);

	const onAttemptFailed = () => {
		failedAttemptCountRef.current += 1;
	};

	let content = null;
	let title = "";
	let description = "";

	switch (currentForm) {
		case Forms.Login:
			title = "Sign in";
			description = "Enter your username and password";
			content = (
				<LoginForm
					error={error}
					serviceUrl={serviceUrl}
					serviceDescription={serviceDescription}
					initialHandle={initialHandle}
					setError={setError}
					onAttemptFailed={onAttemptFailed}
					onAttemptSuccess={onAttemptSuccess}
					setServiceUrl={setServiceUrl}
					onPressBack={() => (accounts.length ? gotoForm(Forms.ChooseAccount) : handlePressBack())}
					onPressForgotPassword={onPressForgotPassword}
					onPressRetryConnect={refetchService}
				/>
			);
			break;
		case Forms.ChooseAccount:
			title = "Sign in";
			description = "Select from an existing account";
			content = <ChooseAccountForm onSelectAccount={onSelectAccount} onPressBack={handlePressBack} />;
			break;
		case Forms.ForgotPassword:
			title = "Forgot Password";
			description = `Let's get your password reset!`;
			content = (
				<ForgotPasswordForm
					error={error}
					serviceUrl={serviceUrl}
					serviceDescription={serviceDescription}
					setError={setError}
					setServiceUrl={setServiceUrl}
					onPressBack={() => gotoForm(Forms.Login)}
					onEmailSent={() => gotoForm(Forms.SetNewPassword)}
				/>
			);
			break;
		case Forms.SetNewPassword:
			title = "Forgot Password";
			description = `Let's get your password reset!`;
			content = (
				<SetNewPasswordForm
					error={error}
					serviceUrl={serviceUrl}
					setError={setError}
					onPressBack={() => gotoForm(Forms.ForgotPassword)}
					onPasswordSet={() => gotoForm(Forms.PasswordUpdated)}
				/>
			);
			break;
		case Forms.PasswordUpdated:
			title = "Password updated";
			description = "You can now sign in with your new password.";
			content = <PasswordUpdatedForm onPressNext={() => gotoForm(Forms.Login)} />;
			break;
	}

	return (
		<div
			// KeyboardAvoidingView
			// behavior="padding"
			style={a.flex_1}
		>
			<LoggedOutLayout leadin="" title={title} description={description} scrollable>
				<div
				// LayoutAnimationConfig
				// skipEntering
				// skipExiting
				>
					<ScreenTransition key={currentForm}>{content}</ScreenTransition>
				</div>
			</LoggedOutLayout>
		</div>
	);
};
