import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import { LikedByList } from "#/components/LikedByList";
import type { RouteParam } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";

export function ProfileLabelerLikedByScreen() {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name: handleOrDid } = useParams<RouteParam<"ProfileLabelerLikedBy">>();
	const uri = makeRecordUri(handleOrDid!, "app.bsky.labeler.service", "self");

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<ViewHeader title={"Liked By"} />
			<LikedByList uri={uri} />
		</Layout.Screen>
	);
}
