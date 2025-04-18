import { moderateProfile } from "@atproto/api";

import { atoms as a, useTheme } from "#/alf";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useProfilesQuery } from "#/state/queries/profile";
import type * as bsky from "#/types/bsky";
import { UserAvatar } from "#/view/com/util/UserAvatar";

export function AvatarStack({
	profiles,
	size = 26,
	numPending,
	backgroundColor,
}: {
	profiles: bsky.profile.AnyProfileView[];
	size?: number;
	numPending?: number;
	backgroundColor?: string;
}) {
	const halfSize = size / 2;
	const t = useTheme();
	const moderationOpts = useModerationOpts();

	const isPending = (numPending && profiles.length === 0) || !moderationOpts;

	const items = isPending
		? Array.from({ length: numPending ?? profiles.length }).map((_, i) => ({
				key: i,
				profile: null,
				moderation: null,
			}))
		: profiles.map((item) => ({
				key: item.did,
				profile: item,
				moderation: moderateProfile(item, moderationOpts),
			}));

	return (
		<div style={{ ...a.flex_row, ...a.align_center, ...a.relative, width: size + (items.length - 1) * halfSize }}>
			{items.map((item, i) => (
				<div
					key={item.key}
					style={{
						...t.atoms.bg_contrast_25,
						...a.relative,

						width: size,
						height: size,
						left: i * -halfSize,
						borderWidth: 1,
						borderColor: backgroundColor ?? t.atoms.bg.backgroundColor,
						borderRadius: 999,
						zIndex: 3 - i,
					}}
				>
					{item.profile && (
						<UserAvatar
							size={size - 2}
							avatar={item.profile.avatar}
							type={item.profile.associated?.labeler ? "labeler" : "user"}
							moderation={item.moderation.ui("avatar")}
						/>
					)}
				</div>
			))}
		</div>
	);
}

export function AvatarStackWithFetch({
	profiles,
	size,
	backgroundColor,
}: {
	profiles: string[];
	size?: number;
	backgroundColor?: string;
}) {
	const { data, error } = useProfilesQuery({ handles: profiles });

	if (error) {
		if (error.name !== "AbortError") {
			console.error("Error fetching profiles for AvatarStack", {
				safeMessage: error,
			});
		}
		return null;
	}

	return (
		<AvatarStack
			numPending={profiles.length}
			profiles={data?.profiles || []}
			size={size}
			backgroundColor={backgroundColor}
		/>
	);
}
