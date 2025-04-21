import type { AppBskyLabelerDefs } from "@atproto/api";
import React from "react";

import { Link } from "#/components/Link";
import { DMCA_LINK } from "#/components/ReportDialog/const";
import { type ReportOption, useReportOptions } from "#/lib/moderation/useReportOptions";

import { useBreakpoints, useTheme } from "#/alf";
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
		<div style={{ gap: 16 }}>
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
					justifyContent: "center",
					gap: gtMobile ? 8 : 4,
				}}
			>
				<Text
					style={{
						fontSize: 22,
						letterSpacing: 0,
						fontWeight: "600",
					}}
				>
					{i18n.title}
				</Text>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
				>
					{i18n.description}
				</Text>
			</div>
			<Divider />
			<div style={{ gap: 8 }}>
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
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 16,
							padding: 12,
							paddingLeft: 16,
							borderRadius: 12,
							...t.atoms.bg_contrast_900,
						}}
					>
						<Text
							style={{
								flex: 1,
								...t.atoms.text_inverted,
								fontStyle: "italic",
								lineHeight: 1.3,
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
				width: "100%",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				padding: 12,
				borderRadius: 12,
				...{ paddingRight: 70 },
				...t.atoms.bg_contrast_25,
				...(interacted && t.atoms.bg_contrast_50),
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
						...t.atoms.text_contrast_medium,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						lineHeight: 1.15,
						...{ maxWidth: 400 },
					}}
				>
					{description}
				</Text>
			</div>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: "auto",
					right: 0,
					bottom: 0,
					justifyContent: "center",
					paddingRight: 12,
				}}
			>
				<ChevronRight size="md" fill={t.atoms.text_contrast_low.color} />
			</div>
		</div>
	);
}
