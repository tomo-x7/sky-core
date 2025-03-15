import { Fragment } from "react";
import { View } from "react-native";

import { atoms as a } from "#/alf";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import * as Toggle from "#/components/forms/Toggle";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { type EmbedPlayerSource, externalEmbedLabels } from "#/lib/strings/embed-player";
import { useExternalEmbedsPrefs, useSetExternalEmbedPref } from "#/state/preferences";
import * as SettingsList from "./components/SettingsList";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PreferencesExternalEmbeds">;
export function ExternalMediaPreferencesScreen(props: Props) {
	return (
		<Layout.Screen testID="externalMediaPreferencesScreen">
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>External Media Preferences</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Item>
						<Admonition type="info" style={[a.flex_1]}>
							External media may allow websites to collect information about you and your device. No
							information is sent or requested until you press the "play" button.
						</Admonition>
					</SettingsList.Item>
					<SettingsList.Group iconInset={false}>
						<SettingsList.ItemText>Enable media players for</SettingsList.ItemText>
						<View style={[a.mt_sm, a.w_full]}>
							{Object.entries(externalEmbedLabels)
								// TODO: Remove special case when we disable the old integration.
								.filter(([key]) => key !== "tenor")
								.map(([key, label]) => (
									<Fragment key={key}>
										<PrefSelector source={key as EmbedPlayerSource} label={label} key={key} />
									</Fragment>
								))}
						</View>
					</SettingsList.Group>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}

function PrefSelector({
	source,
	label,
}: {
	source: EmbedPlayerSource;
	label: string;
}) {
	const setExternalEmbedPref = useSetExternalEmbedPref();
	const sources = useExternalEmbedsPrefs();

	return (
		<Toggle.Item
			name={label}
			label={label}
			type="checkbox"
			value={sources?.[source] === "show"}
			onChange={() => setExternalEmbedPref(source, sources?.[source] === "show" ? "hide" : "show")}
			style={[a.flex_1, a.py_md]}
		>
			<Toggle.Platform />
			<Toggle.LabelText style={[a.text_md]}>{label}</Toggle.LabelText>
		</Toggle.Item>
	);
}
