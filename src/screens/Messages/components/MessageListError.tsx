import React from "react";

import { useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { type ConvoItem, ConvoItemError } from "#/state/messages/convo/types";

export function MessageListError({ item }: { item: ConvoItem & { type: "error" } }) {
	const t = useTheme();
	const { description, help, cta } = React.useMemo(() => {
		return {
			[ConvoItemError.FirehoseFailed]: {
				description: "This chat was disconnected",
				help: "Press to attempt reconnection",
				cta: "Reconnect",
			},
			[ConvoItemError.HistoryFailed]: {
				description: "Failed to load past messages",
				help: "Press to retry",
				cta: "Retry",
			},
		}[item.code];
	}, [item.code]);

	return (
		<div
			style={{
				paddingTop: 12,
				paddingBottom: 12,
				width: "100%",
				flexDirection: "row",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					flex: 1,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: 8,
					...{ maxWidth: 400 },
				}}
			>
				<CircleInfo size="sm" fill={t.palette.negative_400} />

				<Text
					style={{
						lineHeight: 1.3,
						...t.atoms.text_contrast_medium,
					}}
				>
					{description} &middot;{" "}
					{item.retry && (
						<InlineLinkText
							to="#"
							label={help}
							onPress={(e) => {
								e.preventDefault();
								item.retry?.();
								return false;
							}}
						>
							{cta}
						</InlineLinkText>
					)}
				</Text>
			</div>
		</div>
	);
}
