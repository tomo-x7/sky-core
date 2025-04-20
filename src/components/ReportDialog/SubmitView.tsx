import type { AppBskyLabelerDefs } from "@atproto/api";
import React from "react";

import { flatten, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { ChevronLeft_Stroke2_Corner0_Rounded as ChevronLeft } from "#/components/icons/Chevron";
import { PaperPlane_Stroke2_Corner0_Rounded as SendIcon } from "#/components/icons/PaperPlane";
import { getLabelingServiceTitle } from "#/lib/moderation";
import type { ReportOption } from "#/lib/moderation/useReportOptions";
import { useAgent } from "#/state/session";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import * as Toast from "#/view/com/util/Toast";
import type { ReportDialogProps } from "./types";

export function SubmitView({
	params,
	labelers,
	selectedLabeler,
	selectedReportOption,
	goBack,
	onSubmitComplete,
}: ReportDialogProps & {
	labelers: AppBskyLabelerDefs.LabelerViewDetailed[];
	selectedLabeler: string;
	selectedReportOption: ReportOption;
	goBack: () => void;
	onSubmitComplete: () => void;
}) {
	const t = useTheme();
	const agent = useAgent();
	const [details, setDetails] = React.useState<string>("");
	const [submitting, setSubmitting] = React.useState<boolean>(false);
	const [selectedServices, setSelectedServices] = React.useState<string[]>([selectedLabeler]);
	const [error, setError] = React.useState("");

	const submit = React.useCallback(async () => {
		setSubmitting(true);
		setError("");

		const $type = params.type === "account" ? "com.atproto.admin.defs#repoRef" : "com.atproto.repo.strongRef";
		const report = {
			reasonType: selectedReportOption.reason,
			subject: {
				$type,
				...params,
			},
			reason: details,
		};
		const results = await Promise.all(
			selectedServices.map((did) => {
				return agent
					.createModerationReport(report, {
						encoding: "application/json",
						headers: {
							"atproto-proxy": `${did}#atproto_labeler`,
						},
					})
					.then(
						(_) => true,
						(_) => false,
					);
			}),
		);

		setSubmitting(false);

		if (results.includes(true)) {
			Toast.show("Thank you. Your report has been sent.");
			onSubmitComplete();
		} else {
			setError("There was an issue sending your report. Please check your internet connection.");
		}
	}, [params, details, selectedReportOption, selectedServices, onSubmitComplete, agent]);

	return (
		<div style={{ gap: 24 }}>
			<Button
				size="small"
				variant="solid"
				color="secondary"
				shape="round"
				label={"Go back to previous step"}
				onPress={goBack}
			>
				<ButtonIcon icon={ChevronLeft} />
			</Button>
			<div
				style={{
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 16,
					padding: 12,
					borderRadius: 12,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_low,
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
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						{selectedReportOption.title}
					</Text>
					<Text
						style={{
							lineHeight: 1.15,
							...{ maxWidth: 400 },
						}}
					>
						{selectedReportOption.description}
					</Text>
				</div>

				<Check
					size="md"
					style={{
						paddingRight: 8,
						...t.atoms.text_contrast_low,
					}}
				/>
			</div>
			<div style={{ gap: 12 }}>
				<Text style={t.atoms.text_contrast_medium}>Select the moderation service(s) to report to</Text>

				<Toggle.Group label="Select mod services" values={selectedServices} onChange={setSelectedServices}>
					<div
						style={{
							flexDirection: "row",
							gap: 12,
							flexWrap: "wrap",
						}}
					>
						{labelers.map((labeler) => {
							const title = getLabelingServiceTitle({
								displayName: labeler.creator.displayName,
								handle: labeler.creator.handle,
							});
							return (
								<Toggle.Item key={labeler.creator.did} name={labeler.creator.did} label={title}>
									<LabelerToggle title={title} />
								</Toggle.Item>
							);
						})}
					</div>
				</Toggle.Group>
			</div>
			<div style={{ gap: 12 }}>
				<Text style={t.atoms.text_contrast_medium}>Optionally provide additional information below:</Text>

				<div
					style={{
						position: "relative",
						width: "100%",
					}}
				>
					<Dialog.Input
						multiline
						value={details}
						onChangeText={setDetails}
						label="Text field"
						style={{ paddingRight: 60 }}
						numberOfLines={6}
					/>

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
						<CharProgress count={details?.length || 0} />
					</div>
				</div>
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "flex-end",
					gap: 16,
				}}
			>
				{!selectedServices.length ||
					(error && (
						<Text
							style={{
								flex: 1,
								fontStyle: "italic",
								lineHeight: 1.3,
								...t.atoms.text_contrast_medium,
							}}
						>
							{error ? error : <>You must select at least one labeler for a report</>}
						</Text>
					))}

				<Button
					size="large"
					variant="solid"
					color="negative"
					label={"Send report"}
					onPress={submit}
					disabled={!selectedServices.length}
				>
					<ButtonText>Send report</ButtonText>
					<ButtonIcon icon={submitting ? Loader : SendIcon} />
				</Button>
			</div>
		</div>
	);
}

function LabelerToggle({ title }: { title: string }) {
	const t = useTheme();
	const ctx = Toggle.useItemContext();

	return (
		<div
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 12,
				padding: 12,
				paddingRight: 16,
				borderRadius: 8,
				overflow: "hidden",
				...t.atoms.bg_contrast_25,
				...flatten(ctx.selected ? [t.atoms.bg_contrast_50] : []),
			}}
		>
			<Toggle.Checkbox />
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 16,
					zIndex: 10,
				}}
			>
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						...(ctx.selected && t.atoms.text),
					}}
				>
					{title}
				</Text>
			</div>
		</div>
	);
}
