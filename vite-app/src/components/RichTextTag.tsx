import React from "react";

import { useNavigate } from "react-router-dom";
import { InlineLinkText, createStaticClickIfUnmodified } from "#/components/Link";
import { Loader } from "#/components/Loader";
import * as Menu from "#/components/Menu";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as Search } from "#/components/icons/MagnifyingGlass2";
import { Mute_Stroke2_Corner0_Rounded as Mute } from "#/components/icons/Mute";
import { Person_Stroke2_Corner0_Rounded as Person } from "#/components/icons/Person";
import { isInvalidHandle } from "#/lib/strings/handles";
import {
	usePreferencesQuery,
	useRemoveMutedWordsMutation,
	useUpsertMutedWordsMutation,
} from "#/state/queries/preferences";

export function RichTextTag({
	tag,
	display,
	authorHandle,
	textStyle,
}: {
	tag: string;
	display: string;
	authorHandle?: string;
	textStyle: React.CSSProperties;
}) {
	const { isLoading: isPreferencesLoading, data: preferences } = usePreferencesQuery();
	const {
		mutateAsync: upsertMutedWord,
		variables: optimisticUpsert,
		reset: resetUpsert,
	} = useUpsertMutedWordsMutation();
	const {
		mutateAsync: removeMutedWords,
		variables: optimisticRemove,
		reset: resetRemove,
	} = useRemoveMutedWordsMutation();
	const label = `Hashtag ${tag}`;
	const hint = `Click to open tag menu for ${tag}`;
	const navigate = useNavigate();

	const isMuted = Boolean(
		(preferences?.moderationPrefs.mutedWords?.find((m) => m.value === tag && m.targets.includes("tag")) ??
			optimisticUpsert?.find((m) => m.value === tag && m.targets.includes("tag"))) &&
			!optimisticRemove?.find((m) => m?.value === tag),
	);

	/*
	 * Mute word records that exactly match the tag in question.
	 */
	const removeableMuteWords = React.useMemo(() => {
		return (
			preferences?.moderationPrefs.mutedWords?.filter((word) => {
				return word.value === tag;
			}) || []
		);
	}, [tag, preferences?.moderationPrefs?.mutedWords]);

	return (
		<Menu.Root>
			<Menu.Trigger label={label} hint={hint}>
				{({ props: menuProps }) => (
					<InlineLinkText
						to={`/hashtag/${encodeURIComponent(tag)}`}
						// to={{
						// 	screen: "Hashtag",
						// 	params: { tag: encodeURIComponent(tag) },
						// }}
						{...menuProps}
						onPress={(e) => {
							return createStaticClickIfUnmodified(() => {
								menuProps.onPress();
							}).onPress(e);
						}}
						// onLongPress={createStaticClick(menuProps.onPress).onPress}
						label={label}
						style={textStyle}
					>
						{<span ref={menuProps.ref}>{display}</span>}
					</InlineLinkText>
				)}
			</Menu.Trigger>
			<Menu.Outer>
				<Menu.Group>
					<Menu.Item
						label={`See ${tag} posts`}
						onPress={() => {
							navigate(`/hashtag/${encodeURIComponent(tag)}`);
						}}
					>
						<Menu.ItemText>
							<>See #{tag} posts</>
						</Menu.ItemText>
						<Menu.ItemIcon icon={Search} />
					</Menu.Item>
					{authorHandle && !isInvalidHandle(authorHandle) && (
						<Menu.Item
							label={`See ${tag} posts by user`}
							onPress={() => {
								navigate(
									`/hashtag/${encodeURIComponent(tag)}?author=${encodeURIComponent(authorHandle)}`,
								);
							}}
						>
							<Menu.ItemText>
								<>See #{tag} posts by user</>
							</Menu.ItemText>
							<Menu.ItemIcon icon={Person} />
						</Menu.Item>
					)}
				</Menu.Group>
				<Menu.Divider />
				<Menu.Item
					label={isMuted ? `Unmute ${tag}` : `Mute ${tag}`}
					onPress={() => {
						if (isMuted) {
							resetUpsert();
							removeMutedWords(removeableMuteWords);
						} else {
							resetRemove();
							upsertMutedWord([{ value: tag, targets: ["tag"], actorTarget: "all" }]);
						}
					}}
				>
					<Menu.ItemText>{isMuted ? `Unmute ${tag}` : `Mute ${tag}`}</Menu.ItemText>
					<Menu.ItemIcon icon={isPreferencesLoading ? Loader : Mute} />
				</Menu.Item>
			</Menu.Outer>
		</Menu.Root>
	);
}
