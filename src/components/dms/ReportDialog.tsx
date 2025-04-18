import {
	type $Typed,
	type AppBskyActorDefs,
	type ChatBskyConvoDefs,
	type ComAtprotoModerationCreateReport,
	RichText as RichTextAPI,
} from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { memo, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import { SelectReportOptionView } from "#/components/ReportDialog/SelectReportOptionView";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { ChevronLeft_Stroke2_Corner0_Rounded as Chevron } from "#/components/icons/Chevron";
import { PaperPlane_Stroke2_Corner0_Rounded as SendIcon } from "#/components/icons/PaperPlane";
import type { ReportOption } from "#/lib/moderation/useReportOptions";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useLeaveConvo } from "#/state/queries/messages/leave-conversation";
import { useProfileBlockMutationQueue, useProfileQuery } from "#/state/queries/profile";
import { useAgent } from "#/state/session";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import * as Toast from "#/view/com/util/Toast";
import { MessageItemMetadata } from "./MessageItem";

type ReportDialogParams = {
	type: "convoMessage";
	convoId: string;
	message: ChatBskyConvoDefs.MessageView;
};

let ReportDialog = ({
	control,
	params,
	currentScreen,
}: {
	control: Dialog.DialogControlProps;
	params: ReportDialogParams;
	currentScreen: "list" | "conversation";
}): React.ReactNode => {
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner label={"Report this message"}>
				<DialogInner params={params} currentScreen={currentScreen} />
				<Dialog.Close />
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
};
ReportDialog = memo(ReportDialog);
export { ReportDialog };

function DialogInner({
	params,
	currentScreen,
}: {
	params: ReportDialogParams;
	currentScreen: "list" | "conversation";
}) {
	const { data: profile, isError } = useProfileQuery({
		did: params.message.sender.did,
	});
	const [reportOption, setReportOption] = useState<ReportOption | null>(null);
	const [done, setDone] = useState(false);
	const control = Dialog.useDialogContext();

	return done ? (
		profile ? (
			<DoneStep convoId={params.convoId} currentScreen={currentScreen} profile={profile} />
		) : (
			<div
				style={{
					...a.w_full,
					...a.py_5xl,
					...a.align_center,
				}}
			>
				<Loader />
			</div>
		)
	) : reportOption ? (
		<SubmitStep
			params={params}
			reportOption={reportOption}
			goBack={() => setReportOption(null)}
			onComplete={() => {
				if (isError) {
					control.close();
				} else {
					setDone(true);
				}
			}}
		/>
	) : (
		<ReasonStep params={params} setReportOption={setReportOption} />
	);
}

function ReasonStep({
	setReportOption,
}: {
	setReportOption: (reportOption: ReportOption) => void;
	params: ReportDialogParams;
}) {
	const control = Dialog.useDialogContext();

	return (
		<SelectReportOptionView
			labelers={[]}
			goBack={control.close}
			params={{
				type: "convoMessage",
			}}
			onSelectReportOption={setReportOption}
		/>
	);
}

function SubmitStep({
	params,
	reportOption,
	goBack,
	onComplete,
}: {
	params: ReportDialogParams;
	reportOption: ReportOption;
	goBack: () => void;
	onComplete: () => void;
}) {
	const { gtMobile } = useBreakpoints();
	const t = useTheme();
	const [details, setDetails] = useState("");
	const agent = useAgent();

	const {
		mutate: submit,
		error,
		isPending: submitting,
	} = useMutation({
		mutationFn: async () => {
			if (params.type === "convoMessage") {
				const { convoId, message } = params;
				const subject: $Typed<ChatBskyConvoDefs.MessageRef> = {
					$type: "chat.bsky.convo.defs#messageRef",
					messageId: message.id,
					convoId,
					did: message.sender.did,
				};

				const report = {
					reasonType: reportOption.reason,
					subject,
					reason: details,
				} satisfies ComAtprotoModerationCreateReport.InputSchema;

				await agent.createModerationReport(report);
			}
		},
		onSuccess: onComplete,
	});

	const copy = useMemo(() => {
		return {
			convoMessage: {
				title: "Report this message",
			},
		}[params.type];
	}, [params]);

	return (
		<div style={a.gap_lg}>
			<Button
				size="small"
				variant="solid"
				color="secondary"
				shape="round"
				label="Go back to previous step"
				onPress={goBack}
			>
				<ButtonIcon icon={Chevron} />
			</Button>
			<div
				style={{
					...a.justify_center,
					...(gtMobile ? a.gap_sm : a.gap_xs),
				}}
			>
				<Text
					style={{
						...a.text_2xl,
						...a.font_bold,
					}}
				>
					{copy.title}
				</Text>
				<Text
					style={{
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					Your report will be sent to the Bluesky Moderation Service
				</Text>
			</div>
			{params.type === "convoMessage" && <PreviewMessage message={params.message} />}
			<Text
				style={{
					...a.text_md,
					...t.atoms.text_contrast_medium,
				}}
			>
				<Text
					style={{
						...a.font_bold,
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					Reason:
				</Text>{" "}
				<Text
					style={{
						...a.font_bold,
						...a.text_md,
					}}
				>
					{reportOption.title}
				</Text>
			</Text>
			<Divider />
			<div style={a.gap_md}>
				<Text style={t.atoms.text_contrast_medium}>Optionally provide additional information below:</Text>

				<div
					style={{
						...a.relative,
						...a.w_full,
					}}
				>
					<Dialog.Input
						multiline
						defaultValue={details}
						onChangeText={setDetails}
						label="Text field"
						style={{ paddingRight: 60 }}
						numberOfLines={5}
					/>
					<div
						style={{
							...a.absolute,
							...a.flex_row,
							...a.align_center,
							...a.pr_md,
							...a.pb_sm,

							...{
								bottom: 0,
								right: 0,
							},
						}}
					>
						<CharProgress count={details?.length || 0} />
					</div>
				</div>
			</div>
			<div
				style={{
					...a.flex_row,
					...a.align_center,
					...a.justify_end,
					...a.gap_lg,
				}}
			>
				{error && (
					<Text
						style={{
							...a.flex_1,
							...a.italic,
							...a.leading_snug,
							...t.atoms.text_contrast_medium,
						}}
					>
						There was an issue sending your report. Please check your internet connection.
					</Text>
				)}

				<Button size="large" variant="solid" color="negative" label="Send report" onPress={() => submit()}>
					<ButtonText>Send report</ButtonText>
					<ButtonIcon icon={submitting ? Loader : SendIcon} />
				</Button>
			</div>
		</div>
	);
}

function DoneStep({
	convoId,
	currentScreen,
	profile,
}: {
	convoId: string;
	currentScreen: "list" | "conversation";
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const control = Dialog.useDialogContext();
	const { gtMobile } = useBreakpoints();
	const t = useTheme();
	const [actions, setActions] = useState<string[]>(["block", "leave"]);
	const shadow = useProfileShadow(profile);
	const [queueBlock] = useProfileBlockMutationQueue(shadow);
	const navigate = useNavigate();

	const { mutate: leaveConvo } = useLeaveConvo(convoId, {
		onMutate: () => {
			if (currentScreen === "conversation") {
				// navigation.dispatch(StackActions.replace("Messages", {}));
				navigate("/messages");
			}
		},
		onError: () => {
			Toast.show("Could not leave chat", "xmark");
		},
	});

	let btnText = "Done";
	let toastMsg: string | undefined;
	if (actions.includes("leave") && actions.includes("block")) {
		btnText = "Block and Delete";
		toastMsg = "Conversation deleted";
	} else if (actions.includes("leave")) {
		btnText = "Delete Conversation";
		toastMsg = "Conversation deleted";
	} else if (actions.includes("block")) {
		btnText = "Block User";
		toastMsg = "User blocked";
	}

	const onPressPrimaryAction = () => {
		control.close(() => {
			if (actions.includes("block")) {
				queueBlock();
			}
			if (actions.includes("leave")) {
				leaveConvo();
			}
			if (toastMsg) {
				Toast.show(toastMsg, "check");
			}
		});
	};

	return (
		<div style={a.gap_2xl}>
			<div
				style={{
					...a.justify_center,
					...(gtMobile ? a.gap_sm : a.gap_xs),
				}}
			>
				<Text
					style={{
						...a.text_2xl,
						...a.font_bold,
					}}
				>
					Report submitted
				</Text>
				<Text
					style={{
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					Our moderation team has received your report.
				</Text>
			</div>
			<Toggle.Group label={"Block and/or delete this conversation"} values={actions} onChange={setActions}>
				<div style={a.gap_md}>
					<Toggle.Item name="block" label={"Block user"}>
						<Toggle.Checkbox />
						<Toggle.LabelText style={a.text_md}>Block user</Toggle.LabelText>
					</Toggle.Item>
					<Toggle.Item name="leave" label={"Delete conversation"}>
						<Toggle.Checkbox />
						<Toggle.LabelText style={a.text_md}>Delete conversation</Toggle.LabelText>
					</Toggle.Item>
				</div>
			</Toggle.Group>
			<div
				style={{
					...a.gap_md,
					...a.flex_row_reverse,
				}}
			>
				<Button
					label={btnText}
					onPress={onPressPrimaryAction}
					size="large"
					variant="solid"
					color={actions.length > 0 ? "negative" : "primary"}
				>
					<ButtonText>{btnText}</ButtonText>
				</Button>
				<Button label={"Close"} onPress={() => control.close()} size="large" variant="solid" color="secondary">
					<ButtonText>Close</ButtonText>
				</Button>
			</div>
		</div>
	);
}

function PreviewMessage({ message }: { message: ChatBskyConvoDefs.MessageView }) {
	const t = useTheme();
	const rt = useMemo(() => {
		return new RichTextAPI({ text: message.text, facets: message.facets });
	}, [message.text, message.facets]);

	return (
		<div style={a.align_start}>
			<div
				style={{
					...a.py_sm,
					...a.my_2xs,
					...a.rounded_md,

					...{
						paddingLeft: 14,
						paddingRight: 14,
						backgroundColor: t.palette.contrast_50,
						borderRadius: 17,
					},

					...{ borderBottomLeftRadius: 2 },
				}}
			>
				<RichText
					value={rt}
					style={{
						...a.text_md,
						...a.leading_snug,
					}}
					interactiveStyle={a.underline}
					enableTags
				/>
			</div>
			<MessageItemMetadata
				item={{
					type: "message",
					message,
					key: "",
					nextMessage: null,
					prevMessage: null,
				}}
				style={{
					...a.text_left,
					...a.mb_0,
				}}
			/>
		</div>
	);
}
