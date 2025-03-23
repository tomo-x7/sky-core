import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import type { RouteParam } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostLikedBy as PostLikedByComponent } from "#/view/com/post-thread/PostLikedBy";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { CenteredView } from "#/view/com/util/Views";

export const ProfileFeedLikedByScreen = () => {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name, rkey } = useParams<RouteParam<"ProfileFeedLikedBy">>();
	const uri = makeRecordUri(name!, "app.bsky.feed.generator", rkey!);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<CenteredView sideBorders={true}>
				<ViewHeader title={"Liked By"} />
				<PostLikedByComponent uri={uri} />
			</CenteredView>
		</Layout.Screen>
	);
};
