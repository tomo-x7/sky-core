import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useProfileQuery } from "#/state/queries/profile";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useSetMinimalShellMode } from "#/state/shell";
import { ProfileFollows as ProfileFollowsComponent } from "#/view/com/profile/ProfileFollows";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ProfileFollows">;
export const ProfileFollowsScreen = ({ route }: Props) => {
	const { name } = route.params;
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
			<ProfileFollowsComponent name={name} />
		</Layout.Screen>
	);
};
