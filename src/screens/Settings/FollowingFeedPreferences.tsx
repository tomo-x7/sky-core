import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import * as Toggle from "#/components/forms/Toggle";
import { Beaker_Stroke2_Corner2_Rounded as BeakerIcon } from "#/components/icons/Beaker";
import { Bubbles_Stroke2_Corner2_Rounded as BubblesIcon } from "#/components/icons/Bubble";
import { CloseQuote_Stroke2_Corner1_Rounded as QuoteIcon } from "#/components/icons/Quote";
import { Repost_Stroke2_Corner2_Rounded as RepostIcon } from "#/components/icons/Repost";
import { usePreferencesQuery, useSetFeedViewPreferencesMutation } from "#/state/queries/preferences";
import * as SettingsList from "./components/SettingsList";

export function FollowingFeedPreferencesScreen() {
	const { data: preferences } = usePreferencesQuery();
	const { mutate: setFeedViewPref, variables } = useSetFeedViewPreferencesMutation();

	const showReplies = !(variables?.hideReplies ?? preferences?.feedViewPrefs?.hideReplies);

	const showReposts = !(variables?.hideReposts ?? preferences?.feedViewPrefs?.hideReposts);

	const showQuotePosts = !(variables?.hideQuotePosts ?? preferences?.feedViewPrefs?.hideQuotePosts);

	const mergeFeedEnabled = Boolean(
		variables?.lab_mergeFeedEnabled ?? preferences?.feedViewPrefs?.lab_mergeFeedEnabled,
	);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Following Feed Preferences</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Item>
						<Admonition type="tip" style={{ flex: 1 }}>
							These settings only apply to the Following feed.
						</Admonition>
					</SettingsList.Item>
					<Toggle.Item
						type="checkbox"
						name="show-replies"
						label={"Show replies"}
						value={showReplies}
						onChange={(value) =>
							setFeedViewPref({
								hideReplies: !value,
							})
						}
					>
						<SettingsList.Item>
							<SettingsList.ItemIcon icon={BubblesIcon} />
							<SettingsList.ItemText>Show replies</SettingsList.ItemText>
							<Toggle.Platform />
						</SettingsList.Item>
					</Toggle.Item>
					<Toggle.Item
						type="checkbox"
						name="show-reposts"
						label={"Show reposts"}
						value={showReposts}
						onChange={(value) =>
							setFeedViewPref({
								hideReposts: !value,
							})
						}
					>
						<SettingsList.Item>
							<SettingsList.ItemIcon icon={RepostIcon} />
							<SettingsList.ItemText>Show reposts</SettingsList.ItemText>
							<Toggle.Platform />
						</SettingsList.Item>
					</Toggle.Item>
					<Toggle.Item
						type="checkbox"
						name="show-quotes"
						label={"Show quote posts"}
						value={showQuotePosts}
						onChange={(value) =>
							setFeedViewPref({
								hideQuotePosts: !value,
							})
						}
					>
						<SettingsList.Item>
							<SettingsList.ItemIcon icon={QuoteIcon} />
							<SettingsList.ItemText>Show quote posts</SettingsList.ItemText>
							<Toggle.Platform />
						</SettingsList.Item>
					</Toggle.Item>
					<SettingsList.Divider />
					<SettingsList.Group>
						<SettingsList.ItemIcon icon={BeakerIcon} />
						<SettingsList.ItemText>Experimental</SettingsList.ItemText>
						<Toggle.Item
							type="checkbox"
							name="merge-feed"
							label={"Show samples of your saved feeds in your Following feed"}
							value={mergeFeedEnabled}
							onChange={(value) =>
								setFeedViewPref({
									lab_mergeFeedEnabled: value,
								})
							}
							style={{
								width: "100%",
								gap: 12,
							}}
						>
							<Toggle.LabelText style={{ flex: 1 }}>
								Show samples of your saved feeds in your Following feed
							</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
					</SettingsList.Group>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
