import type { AppBskyActorDefs } from "@atproto/api";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
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
		<View style={[a.flex_row, a.gap_sm, a.align_center]} pointerEvents="box-none">
			<InlineLinkText
				testID="profileHeaderFollowersButton"
				style={[a.flex_row, t.atoms.text]}
				to={makeProfileLink(profile, "followers")}
				label={`${followers} ${pluralizedFollowers}`}
			>
				<Text style={[a.font_bold, a.text_md]}>{followers} </Text>
				<Text style={[t.atoms.text_contrast_medium, a.text_md]}>{pluralizedFollowers}</Text>
			</InlineLinkText>
			<InlineLinkText
				testID="profileHeaderFollowsButton"
				style={[a.flex_row, t.atoms.text]}
				to={makeProfileLink(profile, "follows")}
				label={`${following} following`}
			>
				<Text style={[a.font_bold, a.text_md]}>{following} </Text>
				<Text style={[t.atoms.text_contrast_medium, a.text_md]}>{pluralizedFollowings}</Text>
			</InlineLinkText>
			<Text style={[a.font_bold, t.atoms.text, a.text_md]}>
				{formatCount(profile.postsCount || 0)}{" "}
				<Text style={[t.atoms.text_contrast_medium, a.font_normal, a.text_md]}>
					{profile.postsCount === 1 ? "post" : "posts"}
				</Text>
			</Text>
		</View>
	);
}
