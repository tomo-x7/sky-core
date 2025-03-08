import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { atoms as a } from "#/alf";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import * as Toggle from "#/components/forms/Toggle";
import { Accessibility_Stroke2_Corner2_Rounded as AccessibilityIcon } from "#/components/icons/Accessibility";
import { Haptic_Stroke2_Corner2_Rounded as HapticIcon } from "#/components/icons/Haptic";
import type { CommonNavigatorParams } from "#/lib/routes/types";
import { isNative } from "#/platform/detection";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import {
	useHapticsDisabled,
	useRequireAltTextEnabled,
	useSetHapticsDisabled,
	useSetRequireAltTextEnabled,
} from "#/state/preferences";
import { useLargeAltBadgeEnabled, useSetLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";

type Props = NativeStackScreenProps<CommonNavigatorParams, "AccessibilitySettings">;
export function AccessibilitySettingsScreen({}: Props) {
	const { _ } = useLingui();

	const requireAltTextEnabled = useRequireAltTextEnabled();
	const setRequireAltTextEnabled = useSetRequireAltTextEnabled();
	const hapticsDisabled = useHapticsDisabled();
	const setHapticsDisabled = useSetHapticsDisabled();
	const largeAltBadgeEnabled = useLargeAltBadgeEnabled();
	const setLargeAltBadgeEnabled = useSetLargeAltBadgeEnabled();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>
						<>Accessibility</>
					</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Group contentContainerStyle={[a.gap_sm]}>
						<SettingsList.ItemIcon icon={AccessibilityIcon} />
						<SettingsList.ItemText>
							<>Alt text</>
						</SettingsList.ItemText>
						<Toggle.Item
							name="require_alt_text"
							label={_(msg`Require alt text before posting`)}
							value={requireAltTextEnabled ?? false}
							onChange={(value) => setRequireAltTextEnabled(value)}
							style={[a.w_full]}
						>
							<Toggle.LabelText style={[a.flex_1]}>
								<>Require alt text before posting</>
							</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
						<Toggle.Item
							name="large_alt_badge"
							label={_(msg`Display larger alt text badges`)}
							value={!!largeAltBadgeEnabled}
							onChange={(value) => setLargeAltBadgeEnabled(value)}
							style={[a.w_full]}
						>
							<Toggle.LabelText style={[a.flex_1]}>
								<>Display larger alt text badges</>
							</Toggle.LabelText>
							<Toggle.Platform />
						</Toggle.Item>
					</SettingsList.Group>
					{isNative && (
						<>
							<SettingsList.Divider />
							<SettingsList.Group contentContainerStyle={[a.gap_sm]}>
								<SettingsList.ItemIcon icon={HapticIcon} />
								<SettingsList.ItemText>
									<>Haptics</>
								</SettingsList.ItemText>
								<Toggle.Item
									name="haptics"
									label={_(msg`Disable haptic feedback`)}
									value={hapticsDisabled ?? false}
									onChange={(value) => setHapticsDisabled(value)}
									style={[a.w_full]}
								>
									<Toggle.LabelText style={[a.flex_1]}>
										<>Disable haptic feedback</>
									</Toggle.LabelText>
									<Toggle.Platform />
								</Toggle.Item>
							</SettingsList.Group>
						</>
					)}
					<SettingsList.Item>
						<Admonition type="info" style={[a.flex_1]}>
							<>
								Autoplay options have moved to the{" "}
								<InlineLinkText to="/settings/content-and-media" label={_(msg`Content and media`)}>
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
