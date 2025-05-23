import { useTheme } from "#/alf";
import * as Admonition from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import { EyeSlash_Stroke2_Corner0_Rounded as EyeSlashIcon } from "#/components/icons/EyeSlash";
import { Key_Stroke2_Corner2_Rounded as KeyIcon } from "#/components/icons/Key";
import { Verified_Stroke2_Corner2_Rounded as VerifiedIcon } from "#/components/icons/Verified";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useAppPasswordsQuery } from "#/state/queries/app-passwords";
import { useSession } from "#/state/session";
import { Email2FAToggle } from "./components/Email2FAToggle";
import { PwiOptOut } from "./components/PwiOptOut";

export function PrivacyAndSecuritySettingsScreen() {
	const t = useTheme();
	const { data: appPasswords } = useAppPasswordsQuery();
	const { currentAccount } = useSession();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Privacy and Security</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Item>
						<SettingsList.ItemIcon
							icon={VerifiedIcon}
							color={currentAccount?.emailAuthFactor ? t.palette.primary_500 : undefined}
						/>
						<SettingsList.ItemText>
							{currentAccount?.emailAuthFactor ? (
								<>Email 2FA enabled</>
							) : (
								<>Two-factor authentication (2FA)</>
							)}
						</SettingsList.ItemText>
						<Email2FAToggle />
					</SettingsList.Item>
					<SettingsList.LinkItem to="/settings/app-passwords" label={"App passwords"}>
						<SettingsList.ItemIcon icon={KeyIcon} />
						<SettingsList.ItemText>App passwords</SettingsList.ItemText>
						{appPasswords && appPasswords.length > 0 && (
							<SettingsList.BadgeText>{appPasswords.length}</SettingsList.BadgeText>
						)}
					</SettingsList.LinkItem>
					<SettingsList.Divider />
					<SettingsList.Group>
						<SettingsList.ItemIcon icon={EyeSlashIcon} />
						<SettingsList.ItemText>Logged-out visibility</SettingsList.ItemText>
						<PwiOptOut />
					</SettingsList.Group>
					<SettingsList.Item>
						<Admonition.Outer type="tip" style={{ flex: 1 }}>
							<Admonition.Row>
								<Admonition.Icon />
								<div
									style={{
										flex: 1,
										gap: 8,
									}}
								>
									<Admonition.Text>
										Note: Bluesky is an open and public network. This setting only limits the
										visibility of your content on the Bluesky app and website, and other apps may
										not respect this setting. Your content may still be shown to logged-out users by
										other apps and websites.
									</Admonition.Text>
									<Admonition.Text>
										<InlineLinkText
											label={"Learn more about what is public on Bluesky."}
											to="https://blueskyweb.zendesk.com/hc/en-us/articles/15835264007693-Data-Privacy"
										>
											Learn more about what is public on Bluesky.
										</InlineLinkText>
									</Admonition.Text>
								</div>
							</Admonition.Row>
						</Admonition.Outer>
					</SettingsList.Item>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
