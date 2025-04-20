import { type ComAtprotoLabelDefs, ComAtprotoModerationDefs } from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import { useLabelSubject } from "#/lib/moderation";
import { useLabelInfo } from "#/lib/moderation/useLabelInfo";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";
import { Divider } from "../Divider";
import { Loader } from "../Loader";

export interface LabelsOnMeDialogProps {
	control: Dialog.DialogOuterProps["control"];
	labels: ComAtprotoLabelDefs.Label[];
	type: "account" | "content";
}

export function LabelsOnMeDialog(props: LabelsOnMeDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<LabelsOnMeDialogInner {...props} />
		</Dialog.Outer>
	);
}

function LabelsOnMeDialogInner(props: LabelsOnMeDialogProps) {
	const { currentAccount } = useSession();
	const [appealingLabel, setAppealingLabel] = React.useState<ComAtprotoLabelDefs.Label | undefined>(undefined);
	const { labels } = props;
	const isAccount = props.type === "account";
	const containsSelfLabel = React.useMemo(
		() => labels.some((l) => l.src === currentAccount?.did),
		[currentAccount?.did, labels],
	);

	return (
		<Dialog.ScrollableInner
			label={
				isAccount
					? "The following labels were applied to your account."
					: "The following labels were applied to your content."
			}
		>
			{appealingLabel ? (
				<AppealForm
					label={appealingLabel}
					control={props.control}
					onPressBack={() => setAppealingLabel(undefined)}
				/>
			) : (
				<>
					<Text
						style={{
							fontSize: 22,
							letterSpacing: 0,
							fontWeight: "800",
							paddingBottom: 4,
							lineHeight: 1.15,
						}}
					>
						{isAccount ? <>Labels on your account</> : <>Labels on your content</>}
					</Text>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							lineHeight: 1.3,
						}}
					>
						{containsSelfLabel ? (
							<>You may appeal non-self labels if you feel they were placed in error.</>
						) : (
							<>You may appeal these labels if you feel they were placed in error.</>
						)}
					</Text>

					<div
						style={{
							paddingTop: 16,
							paddingBottom: 16,
							gap: 12,
						}}
					>
						{labels.map((label) => (
							<Label
								key={`${label.val}-${label.src}`}
								label={label}
								isSelfLabel={label.src === currentAccount?.did}
								control={props.control}
								onPressAppeal={setAppealingLabel}
							/>
						))}
					</div>
				</>
			)}
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}

function Label({
	label,
	isSelfLabel,
	control,
	onPressAppeal,
}: {
	label: ComAtprotoLabelDefs.Label;
	isSelfLabel: boolean;
	control: Dialog.DialogOuterProps["control"];
	onPressAppeal: (label: ComAtprotoLabelDefs.Label) => void;
}) {
	const t = useTheme();
	const { labeler, strings } = useLabelInfo(label);
	const sourceName = labeler ? sanitizeHandle(labeler.creator.handle, "@") : label.src;
	const timeDiff = useGetTimeAgo({ future: true });
	return (
		<div
			style={{
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.border_contrast_low,
				borderRadius: 8,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					padding: 12,
					gap: 8,
					flexDirection: "row",
				}}
			>
				<div
					style={{
						flex: 1,
						gap: 4,
					}}
				>
					<Text
						style={{
							fontWeight: "600",
							fontSize: 16,
							letterSpacing: 0,
						}}
					>
						{strings.name}
					</Text>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							lineHeight: 1.3,
						}}
					>
						{strings.description}
					</Text>
				</div>
				{!isSelfLabel && (
					<div>
						<Button
							variant="solid"
							color="secondary"
							size="small"
							label={"Appeal"}
							onPress={() => onPressAppeal(label)}
						>
							<ButtonText>Appeal</ButtonText>
						</Button>
					</div>
				)}
			</div>
			<Divider />
			<div
				style={{
					paddingLeft: 12,
					paddingRight: 12,
					paddingTop: 8,
					paddingBottom: 8,
					...t.atoms.bg_contrast_25,
				}}
			>
				{isSelfLabel ? (
					<Text style={t.atoms.text_contrast_medium}>This label was applied by you.</Text>
				) : (
					<div
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							gap: 20,
							...{ paddingBottom: 1 },
						}}
					>
						<Text
							style={{
								flex: 1,
								lineHeight: 1.3,
								...t.atoms.text_contrast_medium,
							}}
							numberOfLines={1}
						>
							<>
								Source:{" "}
								<InlineLinkText
									label={sourceName}
									to={makeProfileLink(labeler ? labeler.creator : { did: label.src, handle: "" })}
									onPress={() => void control.close()}
								>
									{sourceName}
								</InlineLinkText>
							</>
						</Text>
						{label.exp && (
							<div>
								<Text
									style={{
										lineHeight: 1.3,
										fontSize: 14,
										letterSpacing: 0,
										fontStyle: "italic",
										...t.atoms.text_contrast_medium,
									}}
								>
									<>Expires in {timeDiff(Date.now(), label.exp)}</>
								</Text>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function AppealForm({
	label,
	control,
	onPressBack,
}: {
	label: ComAtprotoLabelDefs.Label;
	control: Dialog.DialogOuterProps["control"];
	onPressBack: () => void;
}) {
	const { labeler, strings } = useLabelInfo(label);
	const { gtMobile } = useBreakpoints();
	const [details, setDetails] = React.useState("");
	const { subject } = useLabelSubject({ label });
	const isAccountReport = "did" in subject;
	const agent = useAgent();
	const sourceName = labeler ? sanitizeHandle(labeler.creator.handle, "@") : label.src;

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const $type = !isAccountReport ? "com.atproto.repo.strongRef" : "com.atproto.admin.defs#repoRef";
			await agent.createModerationReport(
				{
					reasonType: ComAtprotoModerationDefs.REASONAPPEAL,
					subject: {
						$type,
						...subject,
					},
					reason: details,
				},
				{
					encoding: "application/json",
					headers: {
						"atproto-proxy": `${label.src}#atproto_labeler`,
					},
				},
			);
		},
		onError: (err) => {
			console.error("Failed to submit label appeal", { message: err });
			Toast.show("Failed to submit appeal, please try again.", "xmark");
		},
		onSuccess: () => {
			control.close();
			Toast.show("Appeal submitted");
		},
	});

	const onSubmit = React.useCallback(() => mutate(), [mutate]);

	return (
		<>
			<div>
				<Text
					style={{
						fontSize: 22,
						letterSpacing: 0,
						fontWeight: "600",
						paddingBottom: 4,
						lineHeight: 1.15,
					}}
				>
					<>Appeal "{strings.name}" label</>
				</Text>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.3,
					}}
				>
					<>
						This appeal will be sent to{" "}
						<InlineLinkText
							label={sourceName}
							to={makeProfileLink(labeler ? labeler.creator : { did: label.src, handle: "" })}
							onPress={() => void control.close()}
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							{sourceName}
						</InlineLinkText>
						.
					</>
				</Text>
			</div>
			<div style={{ ...a.my_md }}>
				<Dialog.Input
					label={"Text input field"}
					placeholder={`Please explain why you think this label was incorrectly applied by ${
						labeler ? sanitizeHandle(labeler.creator.handle, "@") : label.src
					}`}
					value={details}
					onChangeText={setDetails}
					autoFocus={true}
					numberOfLines={3}
					multiline
					maxLength={300}
				/>
			</div>
			<div
				style={flatten(
					gtMobile ? [a.flex_row, a.justify_between] : [{ flexDirection: "column-reverse" }, a.gap_sm],
				)}
			>
				<Button variant="solid" color="secondary" size="large" onPress={onPressBack} label={"Back"}>
					<ButtonText>{"Back"}</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="large" onPress={onSubmit} label={"Submit"}>
					<ButtonText>{"Submit"}</ButtonText>
					{isPending && <ButtonIcon icon={Loader} />}
				</Button>
			</div>
		</>
	);
}
