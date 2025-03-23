import * as Layout from "#/components/Layout";
import { CodeLines_Stroke2_Corner2_Rounded as CodeLinesIcon } from "#/components/icons/CodeLines";
import { Globe_Stroke2_Corner0_Rounded as GlobeIcon } from "#/components/icons/Globe";
import { Newspaper_Stroke2_Corner2_Rounded as NewspaperIcon } from "#/components/icons/Newspaper";
import { Wrench_Stroke2_Corner2_Rounded as WrenchIcon } from "#/components/icons/Wrench";
import { appVersion, bundleInfo } from "#/lib/app-info";
import { STATUS_PAGE_URL } from "#/lib/constants";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useDevModeEnabled } from "#/state/preferences/dev-mode";

export function AboutSettingsScreen() {
	const [devModeEnabled, setDevModeEnabled] = useDevModeEnabled();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>About</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.LinkItem to="https://bsky.social/about/support/tos" label={"Terms of Service"}>
						<SettingsList.ItemIcon icon={NewspaperIcon} />
						<SettingsList.ItemText>Terms of Service</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem
						to="https://bsky.social/about/support/privacy-policy"
						label={"Privacy Policy"}
					>
						<SettingsList.ItemIcon icon={NewspaperIcon} />
						<SettingsList.ItemText>Privacy Policy</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to={STATUS_PAGE_URL} label={"Status Page"}>
						<SettingsList.ItemIcon icon={GlobeIcon} />
						<SettingsList.ItemText>Status Page</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.Divider />
					<SettingsList.LinkItem to="/sys/log" label={"System log"}>
						<SettingsList.ItemIcon icon={CodeLinesIcon} />
						<SettingsList.ItemText>System log</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.PressableItem
						label={`Version ${appVersion}`}
						// onLongPress={() => {
						// 	const newDevModeEnabled = !devModeEnabled;
						// 	setDevModeEnabled(newDevModeEnabled);
						// 	Toast.show(newDevModeEnabled ? "Developer mode enabled" : "Developer mode disabled");
						// }}
						// onPress={() => {
						// 	new Clipboard().writeText(
						// 		`Build version: ${appVersion}; Bundle info: ${bundleInfo}; Bundle date: ${BUNDLE_DATE}; Platform: ${Platform.OS}; Platform version: ${Platform.Version};`,
						// 	);
						// 	Toast.show("Copied build version to clipboard");
						// }}
					>
						<SettingsList.ItemIcon icon={WrenchIcon} />
						<SettingsList.ItemText>
							<>Version {appVersion}</>
						</SettingsList.ItemText>
						<SettingsList.BadgeText>{bundleInfo}</SettingsList.BadgeText>
					</SettingsList.PressableItem>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
