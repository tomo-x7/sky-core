import type { AppBskyFeedDefs, ModerationOpts } from "@atproto/api";
import { useState } from "react";

import { useTheme } from "#/alf";
import { Loader } from "#/components/Loader";
import { ScreenTransition } from "#/components/StarterPack/Wizard/ScreenTransition";
import { WizardFeedCard } from "#/components/StarterPack/Wizard/WizardListCard";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { useThrottledValue } from "#/components/hooks/useThrottledValue";
import { DISCOVER_FEED_URI } from "#/lib/constants";
import { useWizardState } from "#/screens/StarterPack/Wizard/State";
import { useA11y } from "#/state/a11y";
import { useGetPopularFeedsQuery, usePopularFeedsSearch, useSavedFeeds } from "#/state/queries/feed";
import type { ListRenderItemInfo } from "#/temp";
import { List } from "#/view/com/util/List";

function keyExtractor(item: AppBskyFeedDefs.GeneratorView) {
	return item.uri;
}

export function StepFeeds({ moderationOpts }: { moderationOpts: ModerationOpts }) {
	const t = useTheme();
	const [state, dispatch] = useWizardState();
	const [query, setQuery] = useState("");
	const throttledQuery = useThrottledValue(query, 500);
	const { screenReaderEnabled } = useA11y();

	const { data: savedFeedsAndLists, isFetchedAfterMount: isFetchedSavedFeeds } = useSavedFeeds();
	const savedFeeds = savedFeedsAndLists?.feeds
		.filter((f) => f.type === "feed" && f.view.uri !== DISCOVER_FEED_URI)
		.map((f) => f.view) as AppBskyFeedDefs.GeneratorView[];

	const {
		data: popularFeedsPages,
		fetchNextPage,
		isLoading: isLoadingPopularFeeds,
	} = useGetPopularFeedsQuery({
		limit: 30,
	});
	const popularFeeds = popularFeedsPages?.pages.flatMap((p) => p.feeds) ?? [];

	// If we have saved feeds already loaded, display them immediately
	// Then, when popular feeds have loaded we can concat them to the saved feeds
	const suggestedFeeds =
		savedFeeds || isFetchedSavedFeeds
			? popularFeeds
				? savedFeeds.concat(popularFeeds.filter((f) => !savedFeeds.some((sf) => sf.uri === f.uri)))
				: savedFeeds
			: undefined;

	const { data: searchedFeeds, isFetching: isFetchingSearchedFeeds } = usePopularFeedsSearch({
		query: throttledQuery,
	});

	const isLoading = !isFetchedSavedFeeds || isLoadingPopularFeeds || isFetchingSearchedFeeds;

	const renderItem = ({ item }: ListRenderItemInfo<AppBskyFeedDefs.GeneratorView>) => {
		return (
			<WizardFeedCard
				generator={item}
				btnType="checkbox"
				state={state}
				dispatch={dispatch}
				moderationOpts={moderationOpts}
			/>
		);
	};

	return (
		<ScreenTransition style={{ flex: 1 }} direction={state.transitionDirection}>
			<div
				style={{
					borderBottom: "1px solid black",
					...t.atoms.border_contrast_medium,
				}}
			>
				<div
					style={{
						paddingTop: 8,
						paddingBottom: 8,
						paddingLeft: 12,
						paddingRight: 12,
						...{ height: 60 },
					}}
				>
					<SearchInput value={query} onChangeText={(t) => setQuery(t)} onClearText={() => setQuery("")} />
				</div>
			</div>
			<List
				data={query ? searchedFeeds : suggestedFeeds}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				onEndReached={!query && !screenReaderEnabled ? () => fetchNextPage() : undefined}
				onEndReachedThreshold={2}
				keyboardDismissMode="on-drag"
				// renderScrollComponent={(props) => <KeyboardAwareScrollView {...props} />}
				renderScrollComponent={(props: any) => <div {...props} />}
				keyboardShouldPersistTaps="handled"
				disableFullWindowScroll={true}
				sideBorders={false}
				style={{ flex: 1 }}
				ListEmptyComponent={
					<div
						style={{
							flex: 1,
							alignItems: "center",
							marginTop: 16,
							paddingLeft: 16,
							paddingRight: 16,
						}}
					>
						{isLoading ? (
							<Loader size="lg" />
						) : (
							<Text
								style={{
									fontWeight: "600",
									fontSize: 18,
									letterSpacing: 0,
									textAlign: "center",
									marginTop: 16,
									lineHeight: 1.3,
								}}
							>
								No feeds found. Try searching for something else.
							</Text>
						)}
					</div>
				}
			/>
		</ScreenTransition>
	);
}
