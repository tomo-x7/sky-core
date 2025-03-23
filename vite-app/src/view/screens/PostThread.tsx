import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import type { RouteParam } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostThread as PostThreadComponent } from "#/view/com/post-thread/PostThread";

export function PostThreadScreen() {
	const setMinimalShellMode = useSetMinimalShellMode();

	const { name, rkey } = useParams<RouteParam<"PostThread">>();
	const uri = makeRecordUri(name!, "app.bsky.feed.post", rkey!);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<PostThreadComponent uri={uri} />
		</Layout.Screen>
	);
}
