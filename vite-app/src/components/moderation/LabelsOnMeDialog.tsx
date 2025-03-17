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

export { useDialogControl as useLabelsOnMeDialogControl } from "#/components/Dialog";

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
							...a.text_2xl,
							...a.font_heavy,
							...a.pb_xs,
							...a.leading_tight,
						}}
					>
						{isAccount ? <>Labels on your account</> : <>Labels on your content</>}
					</Text>
					<Text
						style={{
							...a.text_md,
							...a.leading_snug,
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
							...a.py_lg,
							...a.gap_md,
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
				...a.border,
				...t.atoms.border_contrast_low,
				...a.rounded_sm,
				...a.overflow_hidden,
			}}
		>
			<div
				style={{
					...a.p_md,
					...a.gap_sm,
					...a.flex_row,
				}}
			>
				<div
					style={{
						...a.flex_1,
						...a.gap_xs,
					}}
				>
					<Text
						emoji
						style={{
							...a.font_bold,
							...a.text_md,
						}}
					>
						{strings.name}
					</Text>
					<Text
						emoji
						style={{
							...t.atoms.text_contrast_medium,
							...a.leading_snug,
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
					...a.px_md,
					...a.py_sm,
					...t.atoms.bg_contrast_25,
				}}
			>
				{isSelfLabel ? (
					<Text style={t.atoms.text_contrast_medium}>This label was applied by you.</Text>
				) : (
					<div
						style={{
							...a.flex_row,
							...a.justify_between,
							...a.gap_xl,
							...{ paddingBottom: 1 },
						}}
					>
						<Text
							style={{
								...a.flex_1,
								...a.leading_snug,
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
										...a.leading_snug,
										...a.text_sm,
										...a.italic,
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
						...a.text_2xl,
						...a.font_bold,
						...a.pb_xs,
						...a.leading_tight,
					}}
				>
					<>Appeal "{strings.name}" label</>
				</Text>
				<Text
					style={{
						...a.text_md,
						...a.leading_snug,
					}}
				>
					<>
						This appeal will be sent to{" "}
						<InlineLinkText
							label={sourceName}
							to={makeProfileLink(labeler ? labeler.creator : { did: label.src, handle: "" })}
							onPress={() => void control.close()}
							style={{
								...a.text_md,
								...a.leading_snug,
							}}
						>
							{sourceName}
						</InlineLinkText>
						.
					</>
				</Text>
			</div>
			<div style={a.my_md}>
				<Dialog.Input
					label={"Text input field"}
					placeholder={`Please explain why you think this label was incorrectly applied by ${
						labeler ? sanitizeHandle(labeler.creator.handle, "@") : label.src
					}`}
					value={details}
					onChangeText={setDetails}
					autoFocus={true}
					// @ts-expect-error
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
