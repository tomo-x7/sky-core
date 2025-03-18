import type { AppBskyActorDefs } from "@atproto/api";

import { atoms as a, flatten, useTheme } from "#/alf";
import { NewskieDialog } from "#/components/NewskieDialog";
import { Text } from "#/components/Typography";
import { isInvalidHandle } from "#/lib/strings/handles";
import type { Shadow } from "#/state/cache/types";

export function ProfileHeaderHandle({
	profile,
	disableTaps,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	disableTaps?: boolean;
}) {
	const t = useTheme();
	const invalidHandle = isInvalidHandle(profile.handle);
	const blockHide = profile.viewer?.blocking || profile.viewer?.blockedBy;
	return (
		<div
			style={{
				...a.flex_row,
				...a.gap_xs,
				...a.align_center,
				maxWidth: "100%",
				pointerEvents: "none",
			}}
		>
			<NewskieDialog profile={profile} disabled={disableTaps} />
			{profile.viewer?.followedBy && !blockHide ? (
				<div
					style={{
						...t.atoms.bg_contrast_25,
						...a.rounded_xs,
						...a.px_sm,
						...a.py_xs,
						pointerEvents: "auto",
					}}
				>
					<Text
						style={{
							...t.atoms.text,
							...a.text_sm,
						}}
					>
						Follows you
					</Text>
				</div>
			) : undefined}
			<Text
				emoji
				numberOfLines={1}
				style={{
					...flatten(
						invalidHandle
							? [
									a.border,
									a.text_xs,
									a.px_sm,
									a.py_xs,
									a.rounded_xs,
									{ borderColor: t.palette.contrast_200 },
								]
							: [a.text_md, a.leading_snug, t.atoms.text_contrast_medium],
					),
					wordBreak: "break-all",
					pointerEvents: "auto",
				}}
			>
				{invalidHandle ? "⚠Invalid Handle" : `@${profile.handle}`}
			</Text>
		</div>
	);
}
