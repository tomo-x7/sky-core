import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import type { RouteParam } from "#/lib/routes/types";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useProfileQuery } from "#/state/queries/profile";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileFollows as ProfileFollowsComponent } from "#/view/com/profile/ProfileFollows";

export const ProfileFollowsScreen = () => {
	const { name } = useParams<RouteParam<"ProfileFollows">>();
	const setMinimalShellMode = useSetMinimalShellMode();

	const { data: resolvedDid } = useResolveDidQuery(name);
	const { data: profile } = useProfileQuery({
		did: resolvedDid,
	});

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					{profile && (
						<>
							<Layout.Header.TitleText>
								{sanitizeDisplayName(profile.displayName || profile.handle)}
							</Layout.Header.TitleText>
							<Layout.Header.SubtitleText>
								{profile.followsCount ?? 0} {profile.followsCount === 1 ? "following" : "following"}
							</Layout.Header.SubtitleText>
						</>
					)}
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<ProfileFollowsComponent name={name!} />
		</Layout.Screen>
	);
};
