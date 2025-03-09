import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { Beaker_Stroke2_Corner2_Rounded as BeakerIcon } from "#/components/icons/Beaker";
import { Bubbles_Stroke2_Corner2_Rounded as BubblesIcon } from "#/components/icons/Bubble";
import { PersonGroup_Stroke2_Corner2_Rounded as PersonGroupIcon } from "#/components/icons/Person";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { usePreferencesQuery, useSetThreadViewPreferencesMutation } from "#/state/queries/preferences";
import * as SettingsList from "./components/SettingsList";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PreferencesThreads">;
export function ThreadPreferencesScreen(props: Props) {
	const t = useTheme();

	const { data: preferences } = usePreferencesQuery();
	const { mutate: setThreadViewPrefs, variables } = useSetThreadViewPreferencesMutation();

	const sortReplies = variables?.sort ?? preferences?.threadViewPrefs?.sort;

	const prioritizeFollowedUsers = Boolean(
		variables?.prioritizeFollowedUsers ?? preferences?.threadViewPrefs?.prioritizeFollowedUsers,
	);
	const treeViewEnabled = Boolean(
		variables?.lab_treeViewEnabled ?? preferences?.threadViewPrefs?.lab_treeViewEnabled,
	);

	return (
		<Layout.Screen testID="threadPreferencesScreen">
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Thread Preferences</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Group>
						<SettingsList.ItemIcon icon={BubblesIcon} />
						<SettingsList.ItemText>Sort replies</SettingsList.ItemText>
						<View style={[a.w_full, a.gap_md]}>
							<Text style={[a.flex_1, t.atoms.text_contrast_medium]}>
								Sort replies to the same post by:
							</Text>
							<Toggle.Group
								label={"Sort replies by"}
								type="radio"
								values={sortReplies ? [sortReplies] : []}
								onChange={(values) => setThreadViewPrefs({ sort: values[0] })}
							>
								<View style={[a.gap_sm, a.flex_1]}>
									<Toggle.Item name="hotness" label={"Hot replies first"}>
										<Toggle.Radio />
										<Toggle.LabelText>Hot replies first</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="oldest" label={"Oldest replies first"}>
										<Toggle.Radio />
										<Toggle.LabelText>Oldest replies first</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="newest" label={"Newest replies first"}>
										<Toggle.Radio />
										<Toggle.LabelText>Newest replies first</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="most-likes" label={"Most-liked replies first"}>
										<Toggle.Radio />
										<Toggle.LabelText>Most-liked first</Toggle.LabelText>
									</Toggle.Item>
									<Toggle.Item name="random" label={`Random (aka "Poster's Roulette")`}>
										<Toggle.Radio />
										<Toggle.LabelText>Random (aka "Poster's Roulette")</Toggle.LabelText>
									</Toggle.Item>
								</View>
							</Toggle.Group>
						</View>
					</SettingsList.Group>
					<SettingsList.Group>
						<SettingsList.ItemIcon icon={PersonGroupIcon} />
						<SettingsList.ItemText>Prioritize your Follows</SettingsList.ItemText>
						<Toggle.Item
							type="checkbox"
							name="prioritize-follows"
							label={"Prioritize your Follows"}
							value={prioritizeFollowedUsers}
							onChange={(value) =>
								setThreadViewPrefs({
									prioritizeFollowedUsers: value,
								})
							}
							style={[a.w_full, a.gap_md]}
						>
							<Toggle.LabelText style={[a.flex_1]}>
								Show replies by people you follow before all other replies
							</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
					</SettingsList.Group>
					<SettingsList.Divider />
					<SettingsList.Group>
						<SettingsList.ItemIcon icon={BeakerIcon} />
						<SettingsList.ItemText>Experimental</SettingsList.ItemText>
						<Toggle.Item
							type="checkbox"
							name="threaded-mode"
							label={"Threaded mode"}
							value={treeViewEnabled}
							onChange={(value) =>
								setThreadViewPrefs({
									lab_treeViewEnabled: value,
								})
							}
							style={[a.w_full, a.gap_md]}
						>
							<Toggle.LabelText style={[a.flex_1]}>Show replies as threaded</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
					</SettingsList.Group>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
