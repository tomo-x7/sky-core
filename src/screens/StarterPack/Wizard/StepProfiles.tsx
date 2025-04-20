import type { AppBskyActorDefs, ModerationOpts } from "@atproto/api";
import { useState } from "react";

import { useTheme } from "#/alf";
import { Loader } from "#/components/Loader";
import { ScreenTransition } from "#/components/StarterPack/Wizard/ScreenTransition";
import { WizardProfileCard } from "#/components/StarterPack/Wizard/WizardListCard";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { useWizardState } from "#/screens/StarterPack/Wizard/State";
import { useA11y } from "#/state/a11y";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import { useActorSearchPaginated } from "#/state/queries/actor-search";
import type { ListRenderItemInfo } from "#/temp";
import type * as bsky from "#/types/bsky";
import { List } from "#/view/com/util/List";

function keyExtractor(item: AppBskyActorDefs.ProfileViewBasic) {
	return item?.did ?? "";
}

export function StepProfiles({
	moderationOpts,
}: {
	moderationOpts: ModerationOpts;
}) {
	const t = useTheme();
	const [state, dispatch] = useWizardState();
	const [query, setQuery] = useState("");
	const { screenReaderEnabled } = useA11y();

	const {
		data: topPages,
		fetchNextPage,
		isLoading: isLoadingTopPages,
	} = useActorSearchPaginated({
		query: encodeURIComponent("*"),
	});
	const topFollowers = topPages?.pages.flatMap((p) => p.actors).filter((p) => !p.associated?.labeler);

	const { data: resultsUnfiltered, isFetching: isFetchingResults } = useActorAutocompleteQuery(query, true, 12);
	const results = resultsUnfiltered?.filter((p) => !p.associated?.labeler);

	const isLoading = isLoadingTopPages || isFetchingResults;

	const renderItem = ({ item }: ListRenderItemInfo<bsky.profile.AnyProfileView>) => {
		return (
			<WizardProfileCard
				profile={item}
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
					<SearchInput value={query} onChangeText={setQuery} onClearText={() => setQuery("")} />
				</div>
			</div>
			<List
				data={query ? results : topFollowers}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				// renderScrollComponent={(props) => <KeyboardAwareScrollView {...props} />}
				renderScrollComponent={(props: any) => <div {...props} />}
				keyboardShouldPersistTaps="handled"
				disableFullWindowScroll={true}
				sideBorders={false}
				style={{ flex: 1 }}
				onEndReached={!query && !screenReaderEnabled ? () => fetchNextPage() : undefined}
				onEndReachedThreshold={0.25}
				keyboardDismissMode="on-drag"
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
								Nobody was found. Try searching for someone else.
							</Text>
						)}
					</div>
				}
			/>
		</ScreenTransition>
	);
}
