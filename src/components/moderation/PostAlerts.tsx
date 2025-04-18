import type { ModerationCause, ModerationUI } from "@atproto/api";

import * as Pills from "#/components/Pills";
import { getModerationCauseKey, unique } from "#/lib/moderation";

export function PostAlerts({
	modui,
	size = "sm",
	style,
	additionalCauses,
}: {
	modui: ModerationUI;
	size?: Pills.CommonProps["size"];
	includeMute?: boolean;
	style?: React.CSSProperties;
	additionalCauses?: ModerationCause[] | Pills.AppModerationCause[];
}) {
	if (!modui.alert && !modui.inform && !additionalCauses?.length) {
		return null;
	}

	return (
		<Pills.Row
			size={size}
			style={{
				...(size === "sm" && { marginLeft: -3 }),
				...style,
			}}
		>
			{modui.alerts.filter(unique).map((cause) => (
				<Pills.Label key={getModerationCauseKey(cause)} cause={cause} size={size} noBg={size === "sm"} />
			))}
			{modui.informs.filter(unique).map((cause) => (
				<Pills.Label key={getModerationCauseKey(cause)} cause={cause} size={size} noBg={size === "sm"} />
			))}
			{additionalCauses?.map((cause) => (
				<Pills.Label key={getModerationCauseKey(cause)} cause={cause} size={size} noBg={size === "sm"} />
			))}
		</Pills.Row>
	);
}
