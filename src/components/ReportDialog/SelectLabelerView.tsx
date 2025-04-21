import type { AppBskyLabelerDefs } from "@atproto/api";

import { useBreakpoints, useTheme } from "#/alf";
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
		<div style={{ gap: 16 }}>
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
					Select moderator
				</Text>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
				>
					To whom would you like to send this report?
				</Text>
			</div>
			<Divider />
			<div style={{ gap: 8 }}>
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
				padding: 12,
				borderRadius: 8,
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
						fontSize: 14,
						letterSpacing: 0,
						fontWeight: "600",
					}}
				>
					@{labeler.creator.handle}
				</Text>
			</LabelingServiceCard.Content>
		</LabelingServiceCard.Outer>
	);
}
