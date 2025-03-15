import type { ComAtprotoServerDescribeServer } from "@atproto/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig } from "react-native-reanimated";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Admonition } from "#/components/Admonition";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import * as ToggleButton from "#/components/forms/ToggleButton";
import {
	ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeftIcon,
	ArrowRight_Stroke2_Corner0_Rounded as ArrowRightIcon,
} from "#/components/icons/Arrow";
import { At_Stroke2_Corner0_Rounded as AtIcon } from "#/components/icons/At";
import { CheckThick_Stroke2_Corner0_Rounded as CheckIcon } from "#/components/icons/Check";
import { SquareBehindSquare4_Stroke2_Corner0_Rounded as CopyIcon } from "#/components/icons/SquareBehindSquare4";
import { HITSLOP_10 } from "#/lib/constants";
import { cleanError } from "#/lib/strings/errors";
import { createFullHandle, validateServiceHandle } from "#/lib/strings/handles";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useFetchDid, useUpdateHandleMutation } from "#/state/queries/handle";
import { RQKEY as RQKEY_PROFILE } from "#/state/queries/profile";
import { useServiceQuery } from "#/state/queries/service";
import { useAgent, useSession } from "#/state/session";
import { ErrorScreen } from "#/view/com/util/error/ErrorScreen";
import { CopyButton } from "./CopyButton";

export function ChangeHandleDialog({
	control,
}: {
	control: Dialog.DialogControlProps;
}) {
	const { height } = useWindowDimensions();

	return (
		<Dialog.Outer control={control} nativeOptions={{ minHeight: height }}>
			<ChangeHandleDialogInner />
		</Dialog.Outer>
	);
}

function ChangeHandleDialogInner() {
	const control = Dialog.useDialogContext();
	const agent = useAgent();
	const { data: serviceInfo, error: serviceInfoError, refetch } = useServiceQuery(agent.serviceUrl.toString());

	const [page, setPage] = useState<"provided-handle" | "own-handle">("provided-handle");

	const cancelButton = useCallback(
		() => (
			<Button
				label={"Cancel"}
				onPress={() => control.close()}
				size="small"
				color="primary"
				variant="ghost"
				style={[a.rounded_full]}
			>
				<ButtonText style={[a.text_md]}>Cancel</ButtonText>
			</Button>
		),
		[control],
	);

	return (
		<Dialog.ScrollableInner
			label={"Change Handle"}
			header={
				<Dialog.Header renderLeft={cancelButton}>
					<Dialog.HeaderText>Change Handle</Dialog.HeaderText>
				</Dialog.Header>
			}
			contentContainerStyle={[a.pt_0, a.px_0]}
		>
			<View style={[a.flex_1, a.pt_lg, a.px_xl]}>
				{serviceInfoError ? (
					<ErrorScreen
						title={"Oops!"}
						message={"There was an issue fetching your service info"}
						details={cleanError(serviceInfoError)}
						onPressTryAgain={refetch}
					/>
				) : serviceInfo ? (
					<LayoutAnimationConfig skipEntering skipExiting>
						{page === "provided-handle" ? (
							<Animated.View key={page}>
								<ProvidedHandlePage
									serviceInfo={serviceInfo}
									goToOwnHandle={() => setPage("own-handle")}
								/>
							</Animated.View>
						) : (
							<Animated.View key={page}>
								<OwnHandlePage goToServiceHandle={() => setPage("provided-handle")} />
							</Animated.View>
						)}
					</LayoutAnimationConfig>
				) : (
					<View style={[a.flex_1, a.justify_center, a.align_center, a.py_4xl]}>
						<Loader size="xl" />
					</View>
				)}
			</View>
		</Dialog.ScrollableInner>
	);
}

function ProvidedHandlePage({
	serviceInfo,
	goToOwnHandle,
}: {
	serviceInfo: ComAtprotoServerDescribeServer.OutputSchema;
	goToOwnHandle: () => void;
}) {
	const [subdomain, setSubdomain] = useState("");
	const agent = useAgent();
	const control = Dialog.useDialogContext();
	const { currentAccount } = useSession();
	const queryClient = useQueryClient();

	const {
		mutate: changeHandle,
		isPending,
		error,
		isSuccess,
	} = useUpdateHandleMutation({
		onSuccess: () => {
			if (currentAccount) {
				queryClient.invalidateQueries({
					queryKey: RQKEY_PROFILE(currentAccount.did),
				});
			}
			agent.resumeSession(agent.session!).then(() => control.close());
		},
	});

	const host = serviceInfo.availableUserDomains[0];

	const validation = useMemo(() => validateServiceHandle(subdomain, host), [subdomain, host]);

	const isInvalid = !validation.handleChars || !validation.hyphenStartOrEnd || !validation.totalLength;

	return (
		<LayoutAnimationConfig skipEntering>
			<View style={[a.flex_1, a.gap_md]}>
				{isSuccess && (
					<Animated.View entering={FadeIn} exiting={FadeOut}>
						<SuccessMessage text={"Handle changed!"} />
					</Animated.View>
				)}
				{error && (
					<Animated.View entering={FadeIn} exiting={FadeOut}>
						<ChangeHandleError error={error} />
					</Animated.View>
				)}
				<Animated.View style={[a.flex_1, a.gap_md]}>
					<View>
						<TextField.LabelText>New handle</TextField.LabelText>
						<TextField.Root isInvalid={isInvalid}>
							<TextField.Icon icon={AtIcon} />
							<Dialog.Input
								editable={!isPending}
								defaultValue={subdomain}
								onChangeText={(text) => setSubdomain(text)}
								label={"New handle"}
								placeholder={"e.g. alice"}
								autoCapitalize="none"
								autoCorrect={false}
							/>
							<TextField.SuffixText label={host} style={[{ maxWidth: "40%" }]}>
								{host}
							</TextField.SuffixText>
						</TextField.Root>
					</View>
					<Text>
						<>
							Your full handle will be{" "}
							<Text style={[a.font_bold]}>@{createFullHandle(subdomain, host)}</Text>
						</>
					</Text>
					<Button
						label={"Save new handle"}
						variant="solid"
						size="large"
						color={validation.overall ? "primary" : "secondary"}
						disabled={!validation.overall}
						onPress={() => {
							if (validation.overall) {
								changeHandle({ handle: createFullHandle(subdomain, host) });
							}
						}}
					>
						{isPending ? <ButtonIcon icon={Loader} /> : <ButtonText>Save</ButtonText>}
					</Button>
					<Text style={[a.leading_snug]}>
						<>
							If you have your own domain, you can use that as your handle. This lets you self-verify your
							identity.{" "}
							<InlineLinkText
								label={"learn more"}
								to="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial"
								style={[a.font_bold]}
								disableMismatchWarning
							>
								Learn more here.
							</InlineLinkText>
						</>
					</Text>
					<Button
						label={"I have my own domain"}
						variant="outline"
						color="primary"
						size="large"
						onPress={goToOwnHandle}
					>
						<ButtonText>I have my own domain</ButtonText>
						<ButtonIcon icon={ArrowRightIcon} position="right" />
					</Button>
				</Animated.View>
			</View>
		</LayoutAnimationConfig>
	);
}

function OwnHandlePage({ goToServiceHandle }: { goToServiceHandle: () => void }) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const [dnsPanel, setDNSPanel] = useState(true);
	const [domain, setDomain] = useState("");
	const agent = useAgent();
	const control = Dialog.useDialogContext();
	const fetchDid = useFetchDid();
	const queryClient = useQueryClient();

	const {
		mutate: changeHandle,
		isPending,
		error,
		isSuccess,
	} = useUpdateHandleMutation({
		onSuccess: () => {
			if (currentAccount) {
				queryClient.invalidateQueries({
					queryKey: RQKEY_PROFILE(currentAccount.did),
				});
			}
			agent.resumeSession(agent.session!).then(() => control.close());
		},
	});

	const {
		mutate: verify,
		isPending: isVerifyPending,
		isSuccess: isVerified,
		error: verifyError,
		reset: resetVerification,
	} = useMutation<true, Error | DidMismatchError>({
		mutationKey: ["verify-handle", domain],
		mutationFn: async () => {
			const did = await fetchDid(domain);
			if (did !== currentAccount?.did) {
				throw new DidMismatchError(did);
			}
			return true;
		},
	});

	return (
		<View style={[a.flex_1, a.gap_lg]}>
			{isSuccess && (
				<Animated.View entering={FadeIn} exiting={FadeOut}>
					<SuccessMessage text={"Handle changed!"} />
				</Animated.View>
			)}
			{error && (
				<Animated.View entering={FadeIn} exiting={FadeOut}>
					<ChangeHandleError error={error} />
				</Animated.View>
			)}
			{verifyError && (
				<Animated.View entering={FadeIn} exiting={FadeOut}>
					<Admonition type="error">
						{verifyError instanceof DidMismatchError ? (
							<>Wrong DID returned from server. Received: {verifyError.did}</>
						) : (
							<>Failed to verify handle. Please try again.</>
						)}
					</Admonition>
				</Animated.View>
			)}
			<Animated.View style={[a.flex_1, a.gap_md, a.overflow_hidden]}>
				<View>
					<TextField.LabelText>Enter the domain you want to use</TextField.LabelText>
					<TextField.Root>
						<TextField.Icon icon={AtIcon} />
						<Dialog.Input
							label={"New handle"}
							placeholder={"e.g. alice.com"}
							editable={!isPending}
							defaultValue={domain}
							onChangeText={(text) => {
								setDomain(text);
								resetVerification();
							}}
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</TextField.Root>
				</View>
				<ToggleButton.Group
					label={"Choose domain verification method"}
					values={[dnsPanel ? "dns" : "file"]}
					onChange={(values) => setDNSPanel(values[0] === "dns")}
				>
					<ToggleButton.Button name="dns" label={"DNS Panel"}>
						<ToggleButton.ButtonText>DNS Panel</ToggleButton.ButtonText>
					</ToggleButton.Button>
					<ToggleButton.Button name="file" label={"No DNS Panel"}>
						<ToggleButton.ButtonText>No DNS Panel</ToggleButton.ButtonText>
					</ToggleButton.Button>
				</ToggleButton.Group>
				{dnsPanel ? (
					<>
						<Text>Add the following DNS record to your domain:</Text>
						<View
							style={[
								t.atoms.bg_contrast_25,
								a.rounded_sm,
								a.p_md,
								a.border,
								t.atoms.border_contrast_low,
							]}
						>
							<Text style={[t.atoms.text_contrast_medium]}>Host:</Text>
							<View style={[a.py_xs]}>
								<CopyButton
									variant="solid"
									color="secondary"
									value="_atproto"
									label={"Copy host"}
									hoverStyle={[a.bg_transparent]}
									hitSlop={HITSLOP_10}
								>
									<Text style={[a.text_md, a.flex_1]}>_atproto</Text>
									<ButtonIcon icon={CopyIcon} />
								</CopyButton>
							</View>
							<Text style={[a.mt_xs, t.atoms.text_contrast_medium]}>Type:</Text>
							<View style={[a.py_xs]}>
								<Text style={[a.text_md]}>TXT</Text>
							</View>
							<Text style={[a.mt_xs, t.atoms.text_contrast_medium]}>Value:</Text>
							<View style={[a.py_xs]}>
								<CopyButton
									variant="solid"
									color="secondary"
									value={`did=${currentAccount?.did}`}
									label={"Copy TXT record value"}
									hoverStyle={[a.bg_transparent]}
									hitSlop={HITSLOP_10}
								>
									<Text style={[a.text_md, a.flex_1]}>did={currentAccount?.did}</Text>
									<ButtonIcon icon={CopyIcon} />
								</CopyButton>
							</View>
						</View>
						<Text>This should create a domain record at:</Text>
						<View
							style={[
								t.atoms.bg_contrast_25,
								a.rounded_sm,
								a.p_md,
								a.border,
								t.atoms.border_contrast_low,
							]}
						>
							<Text style={[a.text_md]}>_atproto.{domain}</Text>
						</View>
					</>
				) : (
					<>
						<Text>Upload a text file to:</Text>
						<View
							style={[
								t.atoms.bg_contrast_25,
								a.rounded_sm,
								a.p_md,
								a.border,
								t.atoms.border_contrast_low,
							]}
						>
							<Text style={[a.text_md]}>https://{domain}/.well-known/atproto-did</Text>
						</View>
						<Text>That contains the following:</Text>
						<CopyButton
							value={currentAccount?.did ?? ""}
							label={"Copy DID"}
							size="large"
							variant="solid"
							color="secondary"
							style={[a.px_md, a.border, t.atoms.border_contrast_low]}
						>
							<Text style={[a.text_md, a.flex_1]}>{currentAccount?.did}</Text>
							<ButtonIcon icon={CopyIcon} />
						</CopyButton>
					</>
				)}
			</Animated.View>
			{isVerified && (
				<Animated.View entering={FadeIn} exiting={FadeOut}>
					<SuccessMessage text={"Domain verified!"} />
				</Animated.View>
			)}
			<Animated.View>
				{currentAccount?.handle?.endsWith(".bsky.social") && (
					<Admonition type="info" style={[a.mb_md]}>
						<>
							Your current handle{" "}
							<Text style={[a.font_bold]}>{sanitizeHandle(currentAccount?.handle || "", "@")}</Text> will
							automatically remain reserved for you. You can switch back to it at any time from this
							account.
						</>
					</Admonition>
				)}
				<Button
					label={isVerified ? `Update to ${domain}` : dnsPanel ? "Verify DNS Record" : "Verify Text File"}
					variant="solid"
					size="large"
					color="primary"
					disabled={domain.trim().length === 0}
					onPress={() => {
						if (isVerified) {
							changeHandle({ handle: domain });
						} else {
							verify();
						}
					}}
				>
					{isPending || isVerifyPending ? (
						<ButtonIcon icon={Loader} />
					) : (
						<ButtonText>
							{isVerified ? (
								<>Update to {domain}</>
							) : dnsPanel ? (
								<>Verify DNS Record</>
							) : (
								<>Verify Text File</>
							)}
						</ButtonText>
					)}
				</Button>

				<Button
					label={"Use default provider"}
					accessibilityHint={"Returns to previous page"}
					onPress={goToServiceHandle}
					variant="outline"
					color="secondary"
					size="large"
					style={[a.mt_sm]}
				>
					<ButtonIcon icon={ArrowLeftIcon} position="left" />
					<ButtonText>Nevermind, create a handle for me</ButtonText>
				</Button>
			</Animated.View>
		</View>
	);
}

class DidMismatchError extends Error {
	did: string;
	constructor(did: string) {
		super("DID mismatch");
		this.name = "DidMismatchError";
		this.did = did;
	}
}

function ChangeHandleError({ error }: { error: unknown }) {
	let message = "Failed to change handle. Please try again.";

	if (error instanceof Error) {
		if (error.message.startsWith("Handle already taken")) {
			message = "Handle already taken. Please try a different one.";
		} else if (error.message === "Reserved handle") {
			message = "This handle is reserved. Please try a different one.";
		} else if (error.message === "Handle too long") {
			message = "Handle too long. Please try a shorter one.";
		} else if (error.message === "Input/handle must be a valid handle") {
			message = "Invalid handle. Please try a different one.";
		} else if (error.message === "Rate Limit Exceeded") {
			message = `Rate limit exceeded – you've tried to change your handle too many times in a short period. Please wait a minute before trying again.`;
		}
	}

	return <Admonition type="error">{message}</Admonition>;
}

function SuccessMessage({ text }: { text: string }) {
	const { gtMobile } = useBreakpoints();
	const t = useTheme();
	return (
		<View
			style={[
				a.flex_1,
				a.gap_md,
				a.flex_row,
				a.justify_center,
				a.align_center,
				gtMobile ? a.px_md : a.px_sm,
				a.py_xs,
				t.atoms.border_contrast_low,
			]}
		>
			<View
				style={[
					{ height: 20, width: 20 },
					a.rounded_full,
					a.align_center,
					a.justify_center,
					{ backgroundColor: t.palette.positive_600 },
				]}
			>
				<CheckIcon fill={t.palette.white} size="xs" />
			</View>
			<Text style={[a.text_md]}>{text}</Text>
		</View>
	);
}
