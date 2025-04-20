import type { AppBskyActorDefs } from "@atproto/api";

import { useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { makeProfileLink } from "#/lib/routes/links";
import type { Shadow } from "#/state/cache/types";
import { formatCount } from "#/view/com/util/numeric/format";

export function ProfileHeaderMetrics({
	profile,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
}) {
	const t = useTheme();
	const following = formatCount(profile.followsCount || 0);
	const followers = formatCount(profile.followersCount || 0);
	const pluralizedFollowers = profile.followersCount === 1 ? "follower" : "followers";
	const pluralizedFollowings = profile.followsCount === 1 ? "following" : "following";

	return (
		<div
			style={{
				flexDirection: "row",
				gap: 8,
				alignItems: "center",
				pointerEvents: "none",
			}}
		>
			<InlineLinkText
				style={{
					flexDirection: "row",
					...t.atoms.text,
					pointerEvents: "auto",
				}}
				to={makeProfileLink(profile, "followers")}
				label={`${followers} ${pluralizedFollowers}`}
			>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 16,
						letterSpacing: 0,
					}}
				>
					{followers}{" "}
				</Text>
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						fontSize: 16,
						letterSpacing: 0,
					}}
				>
					{pluralizedFollowers}
				</Text>
			</InlineLinkText>
			<InlineLinkText
				style={{
					flexDirection: "row",
					...t.atoms.text,
					pointerEvents: "auto",
				}}
				to={makeProfileLink(profile, "follows")}
				label={`${following} following`}
			>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 16,
						letterSpacing: 0,
					}}
				>
					{following}{" "}
				</Text>
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						fontSize: 16,
						letterSpacing: 0,
					}}
				>
					{pluralizedFollowings}
				</Text>
			</InlineLinkText>
			<Text
				style={{
					fontWeight: "600",
					...t.atoms.text,
					fontSize: 16,
					letterSpacing: 0,
					pointerEvents: "auto",
				}}
			>
				{formatCount(profile.postsCount || 0)}{" "}
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						fontWeight: "400",
						fontSize: 16,
						letterSpacing: 0,
					}}
				>
					{profile.postsCount === 1 ? "post" : "posts"}
				</Text>
			</Text>
		</div>
	);
}
