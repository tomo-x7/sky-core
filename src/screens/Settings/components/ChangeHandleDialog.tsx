import type { ComAtprotoServerDescribeServer } from "@atproto/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

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
	return (
		<Dialog.Outer control={control}>
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
				style={{ ...a.rounded_full }}
			>
				<ButtonText style={{ ...a.text_md }}>Cancel</ButtonText>
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
			contentContainerStyle={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}
		>
			<div
				style={{
					flex: 1,
					paddingTop: 16,
					paddingLeft: 20,
					paddingRight: 20,
				}}
			>
				{serviceInfoError ? (
					<ErrorScreen
						title={"Oops!"}
						message={"There was an issue fetching your service info"}
						details={cleanError(serviceInfoError)}
						onPressTryAgain={refetch}
					/>
				) : serviceInfo ? (
					<div
					// LayoutAnimationConfig
					// skipEntering
					// skipExiting
					>
						{page === "provided-handle" ? (
							<div
								// Animated.View
								key={page}
							>
								<ProvidedHandlePage
									serviceInfo={serviceInfo}
									goToOwnHandle={() => setPage("own-handle")}
								/>
							</div>
						) : (
							<div
								// Animated.View
								key={page}
							>
								<OwnHandlePage goToServiceHandle={() => setPage("provided-handle")} />
							</div>
						)}
					</div>
				) : (
					<div
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							paddingTop: 32,
							paddingBottom: 32,
						}}
					>
						<Loader size="xl" />
					</div>
				)}
			</div>
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
		<div
		// LayoutAnimationConfig
		// skipEntering
		>
			<div
				style={{
					flex: 1,
					gap: 12,
				}}
			>
				{isSuccess && (
					<div
					// Animated.View
					// entering={FadeIn}
					// exiting={FadeOut}
					>
						<SuccessMessage text={"Handle changed!"} />
					</div>
				)}
				{error && (
					<div
					//Animated.View
					// entering={FadeIn}
					// exiting={FadeOut}
					>
						<ChangeHandleError error={error} />
					</div>
				)}
				<div
					// Animated.View
					style={{
						flex: 1,
						gap: 12,
					}}
				>
					<div>
						<TextField.LabelText>New handle</TextField.LabelText>
						<TextField.Root isInvalid={isInvalid}>
							<TextField.Icon icon={AtIcon} />
							<Dialog.Input
								contentEditable={!isPending}
								defaultValue={subdomain}
								onChangeText={(text) => setSubdomain(text)}
								label={"New handle"}
								placeholder={"e.g. alice"}
								autoCapitalize="none"
								autoCorrect={"off"}
							/>
							<TextField.SuffixText style={{ maxWidth: "40%" }}>{host}</TextField.SuffixText>
						</TextField.Root>
					</div>
					<Text>
						<>
							Your full handle will be{" "}
							<Text style={{ ...a.font_bold }}>@{createFullHandle(subdomain, host)}</Text>
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
					<Text style={{ lineHeight: 1.3 }}>
						<>
							If you have your own domain, you can use that as your handle. This lets you self-verify your
							identity.{" "}
							<InlineLinkText
								label={"learn more"}
								to="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial"
								style={{ ...a.font_bold }}
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
				</div>
			</div>
		</div>
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
		<div
			style={{
				flex: 1,
				gap: 16,
			}}
		>
			{isSuccess && (
				<div
				// Animated.View
				// entering={FadeIn}
				// exiting={FadeOut}
				>
					<SuccessMessage text={"Handle changed!"} />
				</div>
			)}
			{error && (
				<div
				// Animated.View
				// entering={FadeIn}
				// exiting={FadeOut}
				>
					<ChangeHandleError error={error} />
				</div>
			)}
			{verifyError && (
				<div
				// Animated.View
				// entering={FadeIn}
				// exiting={FadeOut}
				>
					<Admonition type="error">
						{verifyError instanceof DidMismatchError ? (
							<>Wrong DID returned from server. Received: {verifyError.did}</>
						) : (
							<>Failed to verify handle. Please try again.</>
						)}
					</Admonition>
				</div>
			)}
			<div
				// Animated.View
				style={{
					flex: 1,
					gap: 12,
					overflow: "hidden",
				}}
			>
				<div>
					<TextField.LabelText>Enter the domain you want to use</TextField.LabelText>
					<TextField.Root>
						<TextField.Icon icon={AtIcon} />
						<Dialog.Input
							label={"New handle"}
							placeholder={"e.g. alice.com"}
							contentEditable={!isPending}
							defaultValue={domain}
							onChangeText={(text) => {
								setDomain(text);
								resetVerification();
							}}
							autoCapitalize="none"
							autoCorrect={"off"}
						/>
					</TextField.Root>
				</div>
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
						<div
							style={{
								...t.atoms.bg_contrast_25,
								borderRadius: 8,
								padding: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.border_contrast_low,
							}}
						>
							<Text style={t.atoms.text_contrast_medium}>Host:</Text>
							<div style={{ paddingTop: 4, paddingBottom: 4 }}>
								<CopyButton
									variant="solid"
									color="secondary"
									value="_atproto"
									label={"Copy host"}
									hoverStyle={{ ...a.bg_transparent }}
									hitSlop={HITSLOP_10}
								>
									<Text
										style={{
											fontSize: 16,
											letterSpacing: 0,
											flex: 1,
										}}
									>
										_atproto
									</Text>
									<ButtonIcon icon={CopyIcon} />
								</CopyButton>
							</div>
							<Text
								style={{
									marginTop: 4,
									...t.atoms.text_contrast_medium,
								}}
							>
								Type:
							</Text>
							<div style={{ paddingTop: 4, paddingBottom: 4 }}>
								<Text style={{ ...a.text_md }}>TXT</Text>
							</div>
							<Text
								style={{
									marginTop: 4,
									...t.atoms.text_contrast_medium,
								}}
							>
								Value:
							</Text>
							<div style={{ paddingTop: 4, paddingBottom: 4 }}>
								<CopyButton
									variant="solid"
									color="secondary"
									value={`did=${currentAccount?.did}`}
									label={"Copy TXT record value"}
									hoverStyle={{ ...a.bg_transparent }}
									hitSlop={HITSLOP_10}
								>
									<Text
										style={{
											fontSize: 16,
											letterSpacing: 0,
											flex: 1,
										}}
									>
										did={currentAccount?.did}
									</Text>
									<ButtonIcon icon={CopyIcon} />
								</CopyButton>
							</div>
						</div>
						<Text>This should create a domain record at:</Text>
						<div
							style={{
								...t.atoms.bg_contrast_25,
								borderRadius: 8,
								padding: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.border_contrast_low,
							}}
						>
							<Text style={{ ...a.text_md }}>_atproto.{domain}</Text>
						</div>
					</>
				) : (
					<>
						<Text>Upload a text file to:</Text>
						<div
							style={{
								...t.atoms.bg_contrast_25,
								borderRadius: 8,
								padding: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.border_contrast_low,
							}}
						>
							<Text style={{ ...a.text_md }}>https://{domain}/.well-known/atproto-did</Text>
						</div>
						<Text>That contains the following:</Text>
						<CopyButton
							value={currentAccount?.did ?? ""}
							label={"Copy DID"}
							size="large"
							variant="solid"
							color="secondary"
							style={{
								paddingLeft: 12,
								paddingRight: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.border_contrast_low,
							}}
						>
							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									flex: 1,
								}}
							>
								{currentAccount?.did}
							</Text>
							<ButtonIcon icon={CopyIcon} />
						</CopyButton>
					</>
				)}
			</div>
			{isVerified && (
				<div
				// Animated.View
				// entering={FadeIn}
				// exiting={FadeOut}
				>
					<SuccessMessage text={"Domain verified!"} />
				</div>
			)}
			<div
			// Animated.View
			>
				{currentAccount?.handle?.endsWith(".bsky.social") && (
					<Admonition type="info" style={{ marginBottom: 12 }}>
						<>
							Your current handle{" "}
							<Text style={{ ...a.font_bold }}>{sanitizeHandle(currentAccount?.handle || "", "@")}</Text>{" "}
							will automatically remain reserved for you. You can switch back to it at any time from this
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
					onPress={goToServiceHandle}
					variant="outline"
					color="secondary"
					size="large"
					style={{ marginTop: 8 }}
				>
					<ButtonIcon icon={ArrowLeftIcon} position="left" />
					<ButtonText>Nevermind, create a handle for me</ButtonText>
				</Button>
			</div>
		</div>
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
		<div
			style={{
				flex: 1,
				gap: 12,
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				paddingTop: 4,
				paddingBottom: 4,
				paddingLeft: gtMobile ? 12 : 8,
				paddingRight: gtMobile ? 12 : 8,
				...t.atoms.border_contrast_low,
			}}
		>
			<div
				style={{
					...{ height: 20, width: 20 },
					borderRadius: 999,
					alignItems: "center",
					justifyContent: "center",
					...{ backgroundColor: t.palette.positive_600 },
				}}
			>
				<CheckIcon fill={t.palette.white} size="xs" />
			</div>
			<Text style={{ ...a.text_md }}>{text}</Text>
		</div>
	);
}
