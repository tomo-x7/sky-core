import { useLingui } from "@lingui/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import * as Layout from "#/components/Layout";
import * as Toggle from "#/components/forms/Toggle";
import { Bubbles_Stroke2_Corner2_Rounded as BubblesIcon } from "#/components/icons/Bubble";
import { Hashtag_Stroke2_Corner0_Rounded as HashtagIcon } from "#/components/icons/Hashtag";
import { Home_Stroke2_Corner2_Rounded as HomeIcon } from "#/components/icons/Home";
import { Macintosh_Stroke2_Corner2_Rounded as MacintoshIcon } from "#/components/icons/Macintosh";
import { Play_Stroke2_Corner2_Rounded as PlayIcon } from "#/components/icons/Play";
import { Trending2_Stroke2_Corner2_Rounded as Graph } from "#/components/icons/Trending2";
import { Window_Stroke2_Corner2_Rounded as WindowIcon } from "#/components/icons/Window";
import type { CommonNavigatorParams } from "#/lib/routes/types";
import { logEvent } from "#/lib/statsig/statsig";
import { isNative } from "#/platform/detection";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useAutoplayDisabled, useSetAutoplayDisabled } from "#/state/preferences";
import { useInAppBrowser, useSetInAppBrowser } from "#/state/preferences/in-app-browser";
import { useTrendingSettings, useTrendingSettingsApi } from "#/state/preferences/trending";
import { useTrendingConfig } from "#/state/trending-config";

type Props = NativeStackScreenProps<CommonNavigatorParams, "ContentAndMediaSettings">;
export function ContentAndMediaSettingsScreen({}: Props) {
	const { _ } = useLingui();
	const autoplayDisabledPref = useAutoplayDisabled();
	const setAutoplayDisabledPref = useSetAutoplayDisabled();
	const inAppBrowserPref = useInAppBrowser();
	const setUseInAppBrowser = useSetInAppBrowser();
	const { enabled: trendingEnabled } = useTrendingConfig();
	const { trendingDisabled, trendingVideoDisabled } = useTrendingSettings();
	const { setTrendingDisabled, setTrendingVideoDisabled } = useTrendingSettingsApi();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Content & Media</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.LinkItem to="/settings/saved-feeds" label={"Manage saved feeds"}>
						<SettingsList.ItemIcon icon={HashtagIcon} />
						<SettingsList.ItemText>Manage saved feeds</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/threads" label={"Thread preferences"}>
						<SettingsList.ItemIcon icon={BubblesIcon} />
						<SettingsList.ItemText>Thread preferences</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/following-feed" label={"Following feed preferences"}>
						<SettingsList.ItemIcon icon={HomeIcon} />
						<SettingsList.ItemText>Following feed preferences</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/external-embeds" label={"External media"}>
						<SettingsList.ItemIcon icon={MacintoshIcon} />
						<SettingsList.ItemText>External media</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.Divider />
					{isNative && (
						<Toggle.Item
							name="use_in_app_browser"
							label={"Use in-app browser to open links"}
							value={inAppBrowserPref ?? false}
							onChange={(value) => setUseInAppBrowser(value)}
						>
							<SettingsList.Item>
								<SettingsList.ItemIcon icon={WindowIcon} />
								<SettingsList.ItemText>Use in-app browser to open links</SettingsList.ItemText>
								<Toggle.Platform />
							</SettingsList.Item>
						</Toggle.Item>
					)}
					<Toggle.Item
						name="disable_autoplay"
						label={"Autoplay videos and GIFs"}
						value={!autoplayDisabledPref}
						onChange={(value) => setAutoplayDisabledPref(!value)}
					>
						<SettingsList.Item>
							<SettingsList.ItemIcon icon={PlayIcon} />
							<SettingsList.ItemText>Autoplay videos and GIFs</SettingsList.ItemText>
							<Toggle.Platform />
						</SettingsList.Item>
					</Toggle.Item>
					{trendingEnabled && (
						<>
							<SettingsList.Divider />
							<Toggle.Item
								name="show_trending_topics"
								label={"Enable trending topics"}
								value={!trendingDisabled}
								onChange={(value) => {
									const hide = Boolean(!value);
									if (hide) {
										logEvent("trendingTopics:hide", { context: "settings" });
									} else {
										logEvent("trendingTopics:show", { context: "settings" });
									}
									setTrendingDisabled(hide);
								}}
							>
								<SettingsList.Item>
									<SettingsList.ItemIcon icon={Graph} />
									<SettingsList.ItemText>Enable trending topics</SettingsList.ItemText>
									<Toggle.Platform />
								</SettingsList.Item>
							</Toggle.Item>
							<Toggle.Item
								name="show_trending_videos"
								label={"Enable trending videos in your Discover feed."}
								value={!trendingVideoDisabled}
								onChange={(value) => {
									const hide = Boolean(!value);
									if (hide) {
										logEvent("trendingVideos:hide", { context: "settings" });
									} else {
										logEvent("trendingVideos:show", { context: "settings" });
									}
									setTrendingVideoDisabled(hide);
								}}
							>
								<SettingsList.Item>
									<SettingsList.ItemIcon icon={Graph} />
									<SettingsList.ItemText>
										Enable trending videos in your Discover feed
									</SettingsList.ItemText>
									<Toggle.Platform />
								</SettingsList.Item>
							</Toggle.Item>
						</>
					)}
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
