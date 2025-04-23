import { type ComAtprotoAdminDefs, ComAtprotoModerationDefs } from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import Graphemer from "graphemer";
import { useMemo, useState } from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { InlineLinkText } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Modal } from "#/components/Motal";
import { P, Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { MAX_REPORT_REASON_GRAPHEME_LENGTH } from "#/lib/constants";
import { useEnableKeyboardController } from "#/lib/hooks/useEnableKeyboardController";
import { cleanError } from "#/lib/strings/errors";
import { useAgent, useSession, useSessionApi } from "#/state/session";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import { Logo } from "#/view/icons/Logo";

const COL_WIDTH = 400;

export function Takendown() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { currentAccount } = useSession();
	const { logoutCurrentAccount } = useSessionApi();
	const agent = useAgent();
	const [isAppealling, setIsAppealling] = useState(false);
	const [reason, setReason] = useState("");
	const graphemer = useMemo(() => new Graphemer(), []);

	const reasonGraphemeLength = useMemo(() => {
		return graphemer.countGraphemes(reason);
	}, [graphemer, reason]);

	const {
		mutate: submitAppeal,
		isPending,
		isSuccess,
		error,
	} = useMutation({
		mutationFn: async (appealText: string) => {
			if (!currentAccount) throw new Error("No session");
			await agent.com.atproto.moderation.createReport({
				reasonType: ComAtprotoModerationDefs.REASONAPPEAL,
				subject: {
					$type: "com.atproto.admin.defs#repoRef",
					did: currentAccount.did,
				} satisfies ComAtprotoAdminDefs.RepoRef,
				reason: appealText,
			});
		},
		onSuccess: () => setReason(""),
	});

	const primaryBtn =
		isAppealling && !isSuccess ? (
			<Button
				variant="solid"
				color="primary"
				size="large"
				label={"Submit appeal"}
				onPress={() => submitAppeal(reason)}
				disabled={isPending || reasonGraphemeLength > MAX_REPORT_REASON_GRAPHEME_LENGTH}
			>
				<ButtonText>Submit Appeal</ButtonText>
				{isPending && <ButtonIcon icon={Loader} />}
			</Button>
		) : (
			<Button
				variant="solid"
				size="large"
				color="secondary_inverted"
				label={"Sign out"}
				onPress={() => logoutCurrentAccount()}
			>
				<ButtonText>Sign Out</ButtonText>
			</Button>
		);

	const secondaryBtn = isAppealling ? (
		!isSuccess && (
			<Button
				variant="ghost"
				size="large"
				color="secondary"
				label={"Cancel"}
				onPress={() => setIsAppealling(false)}
			>
				<ButtonText>Cancel</ButtonText>
			</Button>
		)
	) : (
		<Button
			variant="ghost"
			size="large"
			color="secondary"
			label={"Appeal suspension"}
			onPress={() => setIsAppealling(true)}
		>
			<ButtonText>Appeal Suspension</ButtonText>
		</Button>
	);

	const webLayout = gtMobile;

	useEnableKeyboardController(true);

	return (
		<Modal visible presentationStyle="formSheet" style={{ minHeight:"100dvh" }}>
			<div
				// KeyboardAwareScrollView
				style={{
					flex: 1,
					...t.atoms.bg,
				}}
				// centerContent
			>
				<div
					style={{
						flexDirection: "row",
						justifyContent: "center",
						paddingTop: 32,
						...(gtMobile && { paddingLeft: 20, paddingRight: 20 }),
					}}
				>
					<div
						style={{
							flex: 1,
							...{ maxWidth: COL_WIDTH, minHeight: COL_WIDTH },
						}}
					>
						<div style={{ paddingBottom: 20 }}>
							<Logo width={64} />
						</div>

						<Text
							style={{
								fontSize: 32,
								letterSpacing: 0,
								fontWeight: "800",
								paddingBottom: 12,
							}}
						>
							{isAppealling ? <>Appeal suspension</> : <>Your account has been suspended</>}
						</Text>

						{isAppealling ? (
							<div
								style={{
									position: "relative",
									width: "100%",
									marginTop: 20,
								}}
							>
								{isSuccess ? (
									<P
										style={{
											...t.atoms.text_contrast_medium,
											textAlign: "center",
										}}
									>
										Your appeal has been submitted. If your appeal succeeds, you will receive an
										email.
									</P>
								) : (
									<>
										<TextField.LabelText>Reason for appeal</TextField.LabelText>
										<TextField.Root
											isInvalid={
												reasonGraphemeLength > MAX_REPORT_REASON_GRAPHEME_LENGTH || !!error
											}
										>
											<TextField.Input
												label={"Reason for appeal"}
												defaultValue={reason}
												onChangeText={setReason}
												placeholder={"Why are you appealing?"}
												multiline
												numberOfLines={5}
												autoFocus
												style={{ paddingBottom: 40, minHeight: 150 }}
												maxLength={MAX_REPORT_REASON_GRAPHEME_LENGTH * 10}
											/>
										</TextField.Root>
										<div
											style={{
												position: "absolute",
												flexDirection: "row",
												alignItems: "center",
												paddingRight: 12,
												paddingBottom: 8,

												...{
													bottom: 0,
													right: 0,
												},
											}}
										>
											<CharProgress
												count={reasonGraphemeLength}
												max={MAX_REPORT_REASON_GRAPHEME_LENGTH}
											/>
										</div>
									</>
								)}
								{error && (
									<Text
										style={{
											fontSize: 16,
											letterSpacing: 0,
											lineHeight: 1.5,
											...{ color: t.palette.negative_500 },
											marginTop: 16,
										}}
									>
										{cleanError(error)}
									</Text>
								)}
							</div>
						) : (
							<P style={t.atoms.text_contrast_medium}>
								<>
									Your account was found to be in violation of the{" "}
									<InlineLinkText
										label={"Bluesky Social Terms of Service"}
										to="https://bsky.social/about/support/tos"
										style={{
											fontSize: 16,
											letterSpacing: 0,
											lineHeight: 1.5,
										}}
										overridePresentation
									>
										Bluesky Social Terms of Service
									</InlineLinkText>
									. You have been sent an email outlining the specific violation and suspension
									period, if applicable. You can appeal this decision if you believe it was made in
									error.
								</>
							</P>
						)}

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
								{secondaryBtn}
								{primaryBtn}
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
						paddingBottom: 40,
						paddingLeft: gtMobile ? 40 : 20,
						paddingRight: gtMobile ? 40 : 20,
					}}
				>
					<div
						style={{
							width: "100%",
							gap: 8,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						{primaryBtn}
						{secondaryBtn}
					</div>
				</div>
			)}
		</Modal>
	);
}
