import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import { LikedByList } from "#/components/LikedByList";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";

export function ProfileLabelerLikedByScreen({
	route,
}: NativeStackScreenProps<CommonNavigatorParams, "ProfileLabelerLikedBy">) {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name: handleOrDid } = route.params;
	const uri = makeRecordUri(handleOrDid, "app.bsky.labeler.service", "self");

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
