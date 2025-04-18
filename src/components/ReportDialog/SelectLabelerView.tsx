import type { AppBskyLabelerDefs } from "@atproto/api";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, useButtonContext } from "#/components/Button";
import { Divider } from "#/components/Divider";
import * as LabelingServiceCard from "#/components/LabelingServiceCard";
import { Text } from "#/components/Typography";
import { getLabelingServiceTitle } from "#/lib/moderation";
import type { ReportDialogProps } from "./types";

export function SelectLabelerView({
	...props
}: ReportDialogProps & {
	labelers: AppBskyLabelerDefs.LabelerViewDetailed[];
	onSelectLabeler: (v: string) => void;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();

	return (
		<div style={a.gap_lg}>
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
					Select moderator
				</Text>
				<Text
					style={{
						...a.text_md,
						...t.atoms.text_contrast_medium,
					}}
				>
					To whom would you like to send this report?
				</Text>
			</div>
			<Divider />
			<div style={a.gap_sm}>
				{props.labelers.map((labeler) => {
					return (
						<Button
							key={labeler.creator.did}
							label={`Send report to ${labeler.creator.displayName}`}
							onPress={() => props.onSelectLabeler(labeler.creator.did)}
						>
							<LabelerButton labeler={labeler} />
						</Button>
					);
				})}
			</div>
		</div>
	);
}

function LabelerButton({
	labeler,
}: {
	labeler: AppBskyLabelerDefs.LabelerViewDetailed;
}) {
	const t = useTheme();
	const { hovered, pressed } = useButtonContext();
	const interacted = hovered || pressed;

	return (
		<LabelingServiceCard.Outer
			style={{
				...a.p_md,
				...a.rounded_sm,
				...t.atoms.bg_contrast_25,
				...(interacted && t.atoms.bg_contrast_50),
			}}
		>
			<LabelingServiceCard.Avatar avatar={labeler.creator.avatar} />
			<LabelingServiceCard.Content>
				<LabelingServiceCard.Title
					value={getLabelingServiceTitle({
						displayName: labeler.creator.displayName,
						handle: labeler.creator.handle,
					})}
				/>
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						...a.text_sm,
						...a.font_bold,
					}}
				>
					@{labeler.creator.handle}
				</Text>
			</LabelingServiceCard.Content>
		</LabelingServiceCard.Outer>
	);
}
