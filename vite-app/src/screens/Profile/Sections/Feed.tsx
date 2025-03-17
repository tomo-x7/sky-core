import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { findNodeHandle } from "react-native";
import { Text } from "#/components/Typography";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import { usePalette } from "#/lib/hooks/usePalette";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { RQKEY as FEED_RQKEY } from "#/state/queries/post-feed";
import { truncateAndInvalidate } from "#/state/queries/util";
import { PostFeed } from "#/view/com/posts/PostFeed";
import { EmptyState } from "#/view/com/util/EmptyState";
import type { ListRef } from "#/view/com/util/List";
import { LoadLatestBtn } from "#/view/com/util/load-latest/LoadLatestBtn";
import type { SectionRef } from "./types";

interface FeedSectionProps {
	feed: FeedDescriptor;
	headerHeight: number;
	isFocused: boolean;
	scrollElRef: ListRef;
	ignoreFilterFor?: string;
	setScrollViewTag: (tag: number | null) => void;
}
export const ProfileFeedSection = React.forwardRef<SectionRef, FeedSectionProps>(function FeedSectionImpl(
	{ feed, headerHeight, isFocused, scrollElRef, ignoreFilterFor, setScrollViewTag },
	ref,
) {
	const queryClient = useQueryClient();
	const [hasNew, setHasNew] = React.useState(false);
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const shouldUseAdjustedNumToRender = feed.endsWith("posts_and_author_threads");
	const isVideoFeed = false;
	const adjustedInitialNumToRender = useInitialNumToRender({
		screenHeightOffset: headerHeight,
	});

	const onScrollToTop = React.useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
		truncateAndInvalidate(queryClient, FEED_RQKEY(feed));
		setHasNew(false);
	}, [scrollElRef, headerHeight, queryClient, feed]);
	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const renderPostsEmpty = React.useCallback(() => {
		return <EmptyState icon="growth" message={"No posts yet."} />;
	}, []);

	React.useEffect(() => {
		if (isFocused && scrollElRef.current) {
			const nativeTag = findNodeHandle(scrollElRef.current);
			setScrollViewTag(nativeTag);
		}
	}, [isFocused, scrollElRef, setScrollViewTag]);

	return (
		<div>
			<PostFeed
				enabled={isFocused}
				feed={feed}
				scrollElRef={scrollElRef}
				onHasNew={setHasNew}
				onScrolledDownChange={setIsScrolledDown}
				renderEmptyState={renderPostsEmpty}
				headerOffset={headerHeight}
				renderEndOfFeed={isVideoFeed ? undefined : ProfileEndOfFeed}
				ignoreFilterFor={ignoreFilterFor}
				initialNumToRender={shouldUseAdjustedNumToRender ? adjustedInitialNumToRender : undefined}
				isVideoFeed={isVideoFeed}
			/>
			{(isScrolledDown || hasNew) && (
				<LoadLatestBtn onPress={onScrollToTop} label={"Load new posts"} showIndicator={hasNew} />
			)}
		</div>
	);
});

function ProfileEndOfFeed() {
	const pal = usePalette("default");

	return (
		<div
			style={{
				...pal.border,
				...{ paddingTop: 32, paddingBottom: 32, borderTopWidth: 1 },
			}}
		>
			<Text
				style={{
					...pal.textLight,
					...pal.border,
					...{ textAlign: "center" },
				}}
			>
				End of feed
			</Text>
		</div>
	);
}
