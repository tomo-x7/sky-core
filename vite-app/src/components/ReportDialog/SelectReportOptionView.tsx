import type { AppBskyLabelerDefs } from "@atproto/api";
import React from "react";

import { Link } from "#/components/Link";
import { DMCA_LINK } from "#/components/ReportDialog/const";
import { type ReportOption, useReportOptions } from "#/lib/moderation/useReportOptions";
export { useDialogControl as useReportDialogControl } from "#/components/Dialog";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText, useButtonContext } from "#/components/Button";
import { Divider } from "#/components/Divider";
import { Text } from "#/components/Typography";
import {
	ChevronLeft_Stroke2_Corner0_Rounded as ChevronLeft,
	ChevronRight_Stroke2_Corner0_Rounded as ChevronRight,
} from "#/components/icons/Chevron";
import { SquareArrowTopRight_Stroke2_Corner0_Rounded as SquareArrowTopRight } from "#/components/icons/SquareArrowTopRight";
import type { ReportDialogProps } from "./types";

export function SelectReportOptionView(props: {
	params: ReportDialogProps["params"];
	labelers: AppBskyLabelerDefs.LabelerViewDetailed[];
	onSelectReportOption: (reportOption: ReportOption) => void;
	goBack: () => void;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const allReportOptions = useReportOptions();
	const reportOptions = allReportOptions[props.params.type];

	const i18n = React.useMemo(() => {
		let title = "Report this content";
		let description = "Why should this content be reviewed?";

		if (props.params.type === "account") {
			title = "Report this user";
			description = "Why should this user be reviewed?";
		} else if (props.params.type === "post") {
			title = "Report this post";
			description = "Why should this post be reviewed?";
		} else if (props.params.type === "list") {
			title = "Report this list";
			description = "Why should this list be reviewed?";
		} else if (props.params.type === "feedgen") {
			title = "Report this feed";
			description = "Why should this feed be reviewed?";
		} else if (props.params.type === "starterpack") {
			title = "Report this starter pack";
			description = "Why should this starter pack be reviewed?";
		} else if (props.params.type === "convoMessage") {
			title = "Report this message";
			description = "Why should this message be reviewed?";
		}

		return {
			title,
			description,
		};
	}, [props.params.type]);

	return (
		<div style={a.gap_lg}>
			{props.labelers?.length > 1 ? (
				<Button
					size="small"
					variant="solid"
					color="secondary"
					shape="round"
					label={"Go back to previous step"}
					onPress={props.goBack}
				>
					<ButtonIcon icon={ChevronLeft} />
				</Button>
			) : null}
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
					{i18n.title}
				</Text>
				<Text
					style={{
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					{i18n.description}
				</Text>
			</div>
			<Divider />
			<div style={a.gap_sm}>
				{reportOptions.map((reportOption) => {
					return (
						<Button
							key={reportOption.reason}
							label={`Create report for ${reportOption.title}`}
							onPress={() => props.onSelectReportOption(reportOption)}
						>
							<ReportOptionButton title={reportOption.title} description={reportOption.description} />
						</Button>
					);
				})}

				{(props.params.type === "post" || props.params.type === "account") && (
					<div
						style={{
							...a.flex_row,
							...a.align_center,
							...a.justify_between,
							...a.gap_lg,
							...a.p_md,
							...a.pl_lg,
							...a.rounded_md,
							...t.atoms.bg_contrast_900,
						}}
					>
						<Text
							style={{
								...a.flex_1,
								...t.atoms.text_inverted,
								...a.italic,
								...a.leading_snug,
							}}
						>
							Need to report a copyright violation?
						</Text>
						<Link
							to={DMCA_LINK}
							label={"View details for reporting a copyright violation"}
							size="small"
							variant="solid"
							color="secondary"
						>
							<ButtonText>View details</ButtonText>
							<ButtonIcon position="right" icon={SquareArrowTopRight} />
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

function ReportOptionButton({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	const t = useTheme();
	const { hovered, pressed } = useButtonContext();
	const interacted = hovered || pressed;

	return (
		<div
			style={{
				...a.w_full,
				...a.flex_row,
				...a.align_center,
				...a.justify_between,
				...a.p_md,
				...a.rounded_md,
				...{ paddingRight: 70 },
				...t.atoms.bg_contrast_25,
				...(interacted && t.atoms.bg_contrast_50),
			}}
		>
			<div
				style={{
					...a.flex_1,
					...a.gap_xs,
				}}
			>
				<Text
					style={{
						...a.text_md,
						...a.font_bold,
						...t.atoms.text_contrast_medium,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						...a.leading_tight,
						...{ maxWidth: 400 },
					}}
				>
					{description}
				</Text>
			</div>
			<div
				style={{
					...a.absolute,
					...a.inset_0,
					...a.justify_center,
					...a.pr_md,
					...{ left: "auto" },
				}}
			>
				<ChevronRight size="md" fill={t.atoms.text_contrast_low.color} />
			</div>
		</div>
	);
}
