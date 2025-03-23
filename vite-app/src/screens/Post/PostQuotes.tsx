import React from "react";

import { useParams } from "react-router-dom";
import * as Layout from "#/components/Layout";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import type { RouteParam } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { usePostThreadQuery } from "#/state/queries/post-thread";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostQuotes as PostQuotesComponent } from "#/view/com/post-thread/PostQuotes";

export const PostQuotesScreen = () => {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name, rkey } = useParams<RouteParam<"PostQuotes">>();
	const uri = makeRecordUri(name!, "app.bsky.feed.post", rkey!);
	const { data: post } = usePostThreadQuery(uri);

	let quoteCount: number | undefined;
	if (post?.thread.type === "post") {
		quoteCount = post.thread.post.quoteCount;
	}

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
					{post && (
						<>
							<Layout.Header.TitleText>Quotes</Layout.Header.TitleText>
							<Layout.Header.SubtitleText>
								{quoteCount ?? 0} {quoteCount === 1 ? "quote" : "quotes"}
							</Layout.Header.SubtitleText>
						</>
					)}
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<PostQuotesComponent uri={uri} />
		</Layout.Screen>
	);
};
