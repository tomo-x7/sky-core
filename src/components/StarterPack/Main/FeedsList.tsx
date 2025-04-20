import type { AppBskyFeedDefs } from "@atproto/api";
import type { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import React, { useCallback } from "react";

import { useTheme } from "#/alf";
import * as FeedCard from "#/components/FeedCard";
import { useBottomBarOffset } from "#/lib/hooks/useBottomBarOffset";
import type { SectionRef } from "#/screens/Profile/Sections/types";
import type { ListRenderItemInfo } from "#/temp";
import { List, type ListRef } from "#/view/com/util/List";

function keyExtractor(item: AppBskyFeedDefs.GeneratorView) {
	return item.uri;
}

interface ProfilesListProps {
	feeds: AppBskyFeedDefs.GeneratorView[];
	headerHeight: number;
	scrollElRef: ListRef;
}

export const FeedsList = React.forwardRef<SectionRef, ProfilesListProps>(function FeedsListImpl(
	{ feeds, headerHeight, scrollElRef },
	ref,
) {
	const [initialHeaderHeight] = React.useState(headerHeight);
	const bottomBarOffset = useBottomBarOffset(20);
	const t = useTheme();

	const onScrollToTop = useCallback(() => {
		scrollElRef.current?.scrollToOffset({
			animated: false,
			offset: -headerHeight,
		});
	}, [scrollElRef, headerHeight]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	const renderItem = ({ item, index }: ListRenderItemInfo<GeneratorView>) => {
		return (
			<div
				style={{
					padding: 16,
					borderTop: "1px solid black",
					borderTopWidth: 1,
					...t.atoms.border_contrast_low,
				}}
			>
				<FeedCard.Default view={item} />
			</div>
		);
	};

	return (
		<List
			data={feeds}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			ref={scrollElRef}
			headerOffset={headerHeight}
			ListFooterComponent={<div style={{ height: initialHeaderHeight + bottomBarOffset }} />}
			showsVerticalScrollIndicator={false}
			desktopFixedHeight={true}
		/>
	);
});
