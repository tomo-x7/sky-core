import { atoms as a } from "#/alf";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import * as Toggle from "#/components/forms/Toggle";
import { Accessibility_Stroke2_Corner2_Rounded as AccessibilityIcon } from "#/components/icons/Accessibility";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useRequireAltTextEnabled, useSetRequireAltTextEnabled } from "#/state/preferences";
import { useLargeAltBadgeEnabled, useSetLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";

export function AccessibilitySettingsScreen() {
	const requireAltTextEnabled = useRequireAltTextEnabled();
	const setRequireAltTextEnabled = useSetRequireAltTextEnabled();
	const largeAltBadgeEnabled = useLargeAltBadgeEnabled();
	const setLargeAltBadgeEnabled = useSetLargeAltBadgeEnabled();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Accessibility</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Group contentContainerstyle={{ gap:8 }}>
						<SettingsList.ItemIcon icon={AccessibilityIcon} />
						<SettingsList.ItemText>Alt text</SettingsList.ItemText>
						<Toggle.Item
							name="require_alt_text"
							label={"Require alt text before posting"}
							value={requireAltTextEnabled ?? false}
							onChange={(value) => setRequireAltTextEnabled(value)}
							style={{ ...a.w_full }}
						>
							<Toggle.LabelText style={{ flex: 1 }}>Require alt text before posting</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
						<Toggle.Item
							name="large_alt_badge"
							label={"Display larger alt text badges"}
							value={!!largeAltBadgeEnabled}
							onChange={(value) => setLargeAltBadgeEnabled(value)}
							style={{ ...a.w_full }}
						>
							<Toggle.LabelText style={{ flex: 1 }}>Display larger alt text badges</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
					</SettingsList.Group>
					<SettingsList.Item>
						<Admonition type="info" style={{ flex: 1 }}>
							<>
								Autoplay options have moved to the{" "}
								<InlineLinkText to="/settings/content-and-media" label={"Content and media"}>
									Content and Media settings
								</InlineLinkText>
								.
							</>
						</Admonition>
					</SettingsList.Item>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
