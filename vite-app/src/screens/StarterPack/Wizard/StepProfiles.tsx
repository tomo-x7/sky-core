import type { AppBskyActorDefs, ModerationOpts } from "@atproto/api";
import { useState } from "react";
import type { ListRenderItemInfo } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { atoms as a, useTheme } from "#/alf";
import { Loader } from "#/components/Loader";
import { ScreenTransition } from "#/components/StarterPack/Wizard/ScreenTransition";
import { WizardProfileCard } from "#/components/StarterPack/Wizard/WizardListCard";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { useWizardState } from "#/screens/StarterPack/Wizard/State";
import { useA11y } from "#/state/a11y";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import { useActorSearchPaginated } from "#/state/queries/actor-search";
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
		<ScreenTransition style={a.flex_1} direction={state.transitionDirection}>
			<div
				style={{
					...a.border_b,
					...t.atoms.border_contrast_medium,
				}}
			>
				<div
					style={{
						...a.py_sm,
						...a.px_md,
						...{ height: 60 },
					}}
				>
					<SearchInput value={query} onChangeText={setQuery} onClearText={() => setQuery("")} />
				</div>
			</div>
			<List
				// @ts-expect-error
				data={query ? results : topFollowers}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				renderScrollComponent={(props) => <KeyboardAwareScrollView {...props} />}
				keyboardShouldPersistTaps="handled"
				disableFullWindowScroll={true}
				sideBorders={false}
				style={a.flex_1}
				onEndReached={!query && !screenReaderEnabled ? () => fetchNextPage() : undefined}
				onEndReachedThreshold={0.25}
				keyboardDismissMode="on-drag"
				ListEmptyComponent={
					<div
						style={{
							...a.flex_1,
							...a.align_center,
							...a.mt_lg,
							...a.px_lg,
						}}
					>
						{isLoading ? (
							<Loader size="lg" />
						) : (
							<Text
								style={{
									...a.font_bold,
									...a.text_lg,
									...a.text_center,
									...a.mt_lg,
									...a.leading_snug,
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
