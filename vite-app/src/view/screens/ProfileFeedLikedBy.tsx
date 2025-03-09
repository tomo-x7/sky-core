import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostLikedBy as PostLikedByComponent } from "#/view/com/post-thread/PostLikedBy";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { CenteredView } from "#/view/com/util/Views";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ProfileFeedLikedBy">;
export const ProfileFeedLikedByScreen = ({ route }: Props) => {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name, rkey } = route.params;
	const uri = makeRecordUri(name, "app.bsky.feed.generator", rkey);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen testID="postLikedByScreen">
			<CenteredView sideBorders={true}>
				<ViewHeader title={"Liked By"} />
				<PostLikedByComponent uri={uri} />
			</CenteredView>
		</Layout.Screen>
	);
};
