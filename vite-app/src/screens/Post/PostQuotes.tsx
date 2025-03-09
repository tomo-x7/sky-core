import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { makeRecordUri } from "#/lib/strings/url-helpers";
import { usePostThreadQuery } from "#/state/queries/post-thread";
import { useSetMinimalShellMode } from "#/state/shell";
import { PostQuotes as PostQuotesComponent } from "#/view/com/post-thread/PostQuotes";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PostQuotes">;
export const PostQuotesScreen = ({ route }: Props) => {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { name, rkey } = route.params;
	const uri = makeRecordUri(name, "app.bsky.feed.post", rkey);
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
