import type { AppBskyActorDefs, ModerationDecision } from "@atproto/api";

import { useBreakpoints, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { Shadow } from "#/state/cache/types";

export function ProfileHeaderDisplayName({
	profile,
	moderation,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	moderation: ModerationDecision;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();

	return (
		<div style={{ pointerEvents: "none" }}>
			<Text
				style={{
					...t.atoms.text,
					fontSize: gtMobile ? 32 : 26,
					letterSpacing: 0,
					alignSelf: "flex-start",
					fontWeight: "800",
				}}
			>
				{sanitizeDisplayName(
					profile.displayName || sanitizeHandle(profile.handle),
					moderation.ui("displayName"),
				)}
			</Text>
		</div>
	);
}
