import React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Loader } from "#/components/Loader";
import { Modal } from "#/components/Motal";
import { P, Text } from "#/components/Typography";
import { isSignupQueued, useAgent, useSessionApi } from "#/state/session";
import { useOnboardingDispatch } from "#/state/shell";
import { Logo } from "#/view/icons/Logo";

const COL_WIDTH = 400;

export function SignupQueued() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const onboardingDispatch = useOnboardingDispatch();
	const { logoutCurrentAccount } = useSessionApi();
	const agent = useAgent();

	const [isProcessing, setProcessing] = React.useState(false);
	const [estimatedTime, setEstimatedTime] = React.useState<string | undefined>(undefined);
	const [placeInQueue, setPlaceInQueue] = React.useState<number | undefined>(undefined);

	const checkStatus = React.useCallback(async () => {
		setProcessing(true);
		try {
			const res = await agent.com.atproto.temp.checkSignupQueue();
			if (res.data.activated) {
				// ready to go, exchange the access token for a usable one and kick off onboarding
				await agent.sessionManager.refreshSession();
				if (!isSignupQueued(agent.session?.accessJwt)) {
					onboardingDispatch({ type: "start" });
				}
			} else {
				// not ready, update UI
				setEstimatedTime(msToString(res.data.estimatedTimeMs));
				if (typeof res.data.placeInQueue !== "undefined") {
					setPlaceInQueue(Math.max(res.data.placeInQueue, 1));
				}
			}
		} catch (e: any) {
			console.error("Failed to check signup queue", { err: e.toString() });
		} finally {
			setProcessing(false);
		}
	}, [onboardingDispatch, agent]);

	React.useEffect(() => {
		checkStatus();
		const interval = setInterval(checkStatus, 60e3);
		return () => clearInterval(interval);
	}, [checkStatus]);

	const checkBtn = (
		<Button
			variant="solid"
			color="primary"
			size="large"
			label={"Check my status"}
			onPress={checkStatus}
			disabled={isProcessing}
		>
			<ButtonText>Check my status</ButtonText>
			{isProcessing && <ButtonIcon icon={Loader} />}
		</Button>
	);

	const logoutBtn = (
		<Button variant="ghost" size="large" color="primary" label={"Sign out"} onPress={() => logoutCurrentAccount()}>
			<ButtonText>Sign out</ButtonText>
		</Button>
	);

	const webLayout = gtMobile;

	return (
		<Modal visible presentationStyle="formSheet" style={{ minHeight:"100dvh" }}>
			<div
				// ScrollView
				style={{
					flex: 1,
					...t.atoms.bg,
				}}
				// contentContainerStyle={{ borderWidth: 0 }}
				// bounces={false}
			>
				<div
					style={{
						flexDirection: "row",
						justifyContent: "center",
						...(gtMobile ? { paddingTop: 32 } : { paddingTop: 20, paddingLeft: 20, paddingRight: 20 }),
					}}
				>
					<div
						style={{
							flex: 1,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						<div
							style={{
								width: "100%",
								justifyContent: "center",
								alignItems: "center",
								marginTop: 32,
								marginBottom: 32,
							}}
						>
							<Logo width={120} />
						</div>

						<Text
							style={{
								fontSize: 32,
								letterSpacing: 0,
								fontWeight: "800",
								paddingBottom: 8,
							}}
						>
							You're in line
						</Text>
						<P style={t.atoms.text_contrast_medium}>
							There's been a rush of new users to Bluesky! We'll activate your account as soon as we can.
						</P>

						<div
							style={{
								borderRadius: 8,
								paddingLeft: 24,
								paddingRight: 24,
								paddingTop: 32,
								paddingBottom: 32,
								marginTop: 24,
								marginBottom: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.bg_contrast_25,
								...t.atoms.border_contrast_medium,
							}}
						>
							{typeof placeInQueue === "number" && (
								<Text
									style={{
										fontSize: 40,
										letterSpacing: 0,
										textAlign: "center",
										fontWeight: "800",
										marginBottom: 24,
									}}
								>
									{placeInQueue}
								</Text>
							)}
							<P style={{ textAlign: "center" }}>
								{typeof placeInQueue === "number" ? <>left to go.</> : <>You are in line.</>}{" "}
								{estimatedTime ? (
									<>We estimate {estimatedTime} until your account is ready.</>
								) : (
									<>We will let you know when your account is ready.</>
								)}
							</P>
						</div>

						{webLayout && (
							<div
								style={{
									width: "100%",
									flexDirection: "row",
									justifyContent: "space-between",
									paddingTop: 40,
									...{ paddingBottom: 200 },
								}}
							>
								{logoutBtn}
								{checkBtn}
							</div>
						)}
					</div>
				</div>
			</div>
			{!webLayout && (
				<div
					style={{
						alignItems: "center",
						...t.atoms.bg,
						paddingLeft: gtMobile ? 40 : 20,
						paddingRight: gtMobile ? 40 : 20,
						paddingBottom: 40,
					}}
				>
					<div
						style={{
							width: "100%",
							gap: 8,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						{checkBtn}
						{logoutBtn}
					</div>
				</div>
			)}
		</Modal>
	);
}

function msToString(ms: number | undefined): string | undefined {
	if (ms && ms > 0) {
		const estimatedTimeMins = Math.ceil(ms / 60e3);
		if (estimatedTimeMins > 59) {
			const estimatedTimeHrs = Math.round(estimatedTimeMins / 60);
			if (estimatedTimeHrs > 6) {
				// dont even bother
				return undefined;
			}
			// hours
			return `${estimatedTimeHrs} ${estimatedTimeHrs === 1 ? "hour" : "hours"}`;
		}
		// minutes
		return `${estimatedTimeMins} ${estimatedTimeMins === 1 ? "minute" : "minutes"}`;
	}
	return undefined;
}
