import React, { useCallback } from "react";
import type { SectionRef } from "#/screens/Profile/Sections/types";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { PostFeed } from "#/view/com/posts/PostFeed";
import { EmptyState } from "#/view/com/util/EmptyState";
import type { ListRef } from "#/view/com/util/List";

interface ProfilesListProps {
	listUri: string;
	headerHeight: number;
	scrollElRef: ListRef;
}

export const PostsList = React.forwardRef<SectionRef, ProfilesListProps>(function PostsListImpl(
	{ listUri, headerHeight, scrollElRef },
	ref,
) {
	const feed: FeedDescriptor = `list|${listUri}`;

	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
	}, [scrollElRef, headerHeight]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const renderPostsEmpty = useCallback(() => {
		return <EmptyState icon="hashtag" message={"This feed is empty."} />;
	}, []);

	return (
		<div>
			<PostFeed
				feed={feed}
				pollInterval={60e3}
				scrollElRef={scrollElRef}
				renderEmptyState={renderPostsEmpty}
				headerOffset={headerHeight}
			/>
		</div>
	);
});
