import { type AppBskyActorDefs, moderateProfile } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { Linking } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { atoms as a, tokens, useTheme } from "#/alf";
import { AvatarStackWithFetch } from "#/components/AvatarStack";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { SwitchAccountDialog } from "#/components/dialogs/SwitchAccount";
import { Accessibility_Stroke2_Corner2_Rounded as AccessibilityIcon } from "#/components/icons/Accessibility";
import { BubbleInfo_Stroke2_Corner2_Rounded as BubbleInfoIcon } from "#/components/icons/BubbleInfo";
import { ChevronTop_Stroke2_Corner0_Rounded as ChevronUpIcon } from "#/components/icons/Chevron";
import { CircleQuestion_Stroke2_Corner2_Rounded as CircleQuestionIcon } from "#/components/icons/CircleQuestion";
import { CodeBrackets_Stroke2_Corner2_Rounded as CodeBracketsIcon } from "#/components/icons/CodeBrackets";
import { DotGrid_Stroke2_Corner0_Rounded as DotsHorizontal } from "#/components/icons/DotGrid";
import { Earth_Stroke2_Corner2_Rounded as EarthIcon } from "#/components/icons/Globe";
import { Lock_Stroke2_Corner2_Rounded as LockIcon } from "#/components/icons/Lock";
import { PaintRoller_Stroke2_Corner2_Rounded as PaintRollerIcon } from "#/components/icons/PaintRoller";
import {
	PersonGroup_Stroke2_Corner2_Rounded as PersonGroupIcon,
	Person_Stroke2_Corner2_Rounded as PersonIcon,
	PersonPlus_Stroke2_Corner2_Rounded as PersonPlusIcon,
	PersonX_Stroke2_Corner0_Rounded as PersonXIcon,
} from "#/components/icons/Person";
import { RaisingHand4Finger_Stroke2_Corner2_Rounded as HandIcon } from "#/components/icons/RaisingHand";
import { Window_Stroke2_Corner2_Rounded as WindowIcon } from "#/components/icons/Window";
import { IS_INTERNAL } from "#/lib/app-info";
import { HELP_DESK_URL } from "#/lib/constants";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import type { CommonNavigatorParams, NavigationProp } from "#/lib/routes/types";
import { sanitizeHandle } from "#/lib/strings/handles";
import { ProfileHeaderDisplayName } from "#/screens/Profile/Header/DisplayName";
import { ProfileHeaderHandle } from "#/screens/Profile/Header/Handle";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { clearStorage } from "#/state/persisted";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useDeleteActorDeclaration } from "#/state/queries/messages/actor-declaration";
import { useProfileQuery, useProfilesQuery } from "#/state/queries/profile";
import { type SessionAccount, useSession, useSessionApi } from "#/state/session";
import { useOnboardingDispatch } from "#/state/shell";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";

type Props = NativeStackScreenProps<CommonNavigatorParams, "Settings">;
export function SettingsScreen(props: Props) {
	const reducedMotion = useReducedMotion();
	const { logoutEveryAccount } = useSessionApi();
	const { accounts, currentAccount } = useSession();
	const switchAccountControl = useDialogControl();
	const signOutPromptControl = Prompt.usePromptControl();
	const { data: profile } = useProfileQuery({ did: currentAccount?.did });
	const { data: otherProfiles } = useProfilesQuery({
		handles: accounts.filter((acc) => acc.did !== currentAccount?.did).map((acc) => acc.handle),
	});
	const { pendingDid, onPressSwitchAccount } = useAccountSwitcher();
	const [showAccounts, setShowAccounts] = useState(false);
	const [showDevOptions, setShowDevOptions] = useState(false);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Settings</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<View style={[a.px_xl, a.pt_md, a.pb_md, a.w_full, a.gap_2xs, a.align_center, { minHeight: 160 }]}>
						{profile && <ProfilePreview profile={profile} />}
					</View>
					{accounts.length > 1 ? (
						<>
							<SettingsList.PressableItem
								label={"Switch account"}
								accessibilityHint={"Shows other accounts you can switch to"}
								onPress={() => {
									if (!reducedMotion) {
										LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
									}
									setShowAccounts((s) => !s);
								}}
							>
								<SettingsList.ItemIcon icon={PersonGroupIcon} />
								<SettingsList.ItemText>Switch account</SettingsList.ItemText>
								{showAccounts ? (
									<SettingsList.ItemIcon icon={ChevronUpIcon} size="md" />
								) : (
									<AvatarStackWithFetch
										profiles={accounts
											.map((acc) => acc.did)
											.filter((did) => did !== currentAccount?.did)
											.slice(0, 5)}
									/>
								)}
							</SettingsList.PressableItem>
							{showAccounts && (
								<>
									<SettingsList.Divider />
									{accounts
										.filter((acc) => acc.did !== currentAccount?.did)
										.map((account) => (
											<AccountRow
												key={account.did}
												account={account}
												profile={otherProfiles?.profiles?.find((p) => p.did === account.did)}
												pendingDid={pendingDid}
												onPressSwitchAccount={onPressSwitchAccount}
											/>
										))}
									<AddAccountRow />
								</>
							)}
						</>
					) : (
						<AddAccountRow />
					)}
					<SettingsList.Divider />
					<SettingsList.LinkItem to="/settings/account" label={"Account"}>
						<SettingsList.ItemIcon icon={PersonIcon} />
						<SettingsList.ItemText>Account</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/privacy-and-security" label={"Privacy and security"}>
						<SettingsList.ItemIcon icon={LockIcon} />
						<SettingsList.ItemText>Privacy and security</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/moderation" label={"Moderation"}>
						<SettingsList.ItemIcon icon={HandIcon} />
						<SettingsList.ItemText>Moderation</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/content-and-media" label={"Content and media"}>
						<SettingsList.ItemIcon icon={WindowIcon} />
						<SettingsList.ItemText>Content and media</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/appearance" label={"Appearance"}>
						<SettingsList.ItemIcon icon={PaintRollerIcon} />
						<SettingsList.ItemText>Appearance</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/accessibility" label={"Accessibility"}>
						<SettingsList.ItemIcon icon={AccessibilityIcon} />
						<SettingsList.ItemText>Accessibility</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.LinkItem to="/settings/language" label={"Languages"}>
						<SettingsList.ItemIcon icon={EarthIcon} />
						<SettingsList.ItemText>Languages</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.PressableItem
						onPress={() => Linking.openURL(HELP_DESK_URL)}
						label={"Help"}
						accessibilityHint={"Opens helpdesk in browser"}
					>
						<SettingsList.ItemIcon icon={CircleQuestionIcon} />
						<SettingsList.ItemText>Help</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.LinkItem to="/settings/about" label={"About"}>
						<SettingsList.ItemIcon icon={BubbleInfoIcon} />
						<SettingsList.ItemText>About</SettingsList.ItemText>
					</SettingsList.LinkItem>
					<SettingsList.Divider />
					<SettingsList.PressableItem
						destructive
						onPress={() => signOutPromptControl.open()}
						label={"Sign out"}
					>
						<SettingsList.ItemText>Sign out</SettingsList.ItemText>
					</SettingsList.PressableItem>
					{IS_INTERNAL && (
						<>
							<SettingsList.Divider />
							<SettingsList.PressableItem
								onPress={() => {
									if (!reducedMotion) {
										LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
									}
									setShowDevOptions((d) => !d);
								}}
								label={"Developer options"}
							>
								<SettingsList.ItemIcon icon={CodeBracketsIcon} />
								<SettingsList.ItemText>Developer options</SettingsList.ItemText>
							</SettingsList.PressableItem>
							{showDevOptions && <DevOptions />}
						</>
					)}
				</SettingsList.Container>
			</Layout.Content>

			<Prompt.Basic
				control={signOutPromptControl}
				title={"Sign out?"}
				description={"You will be signed out of all your accounts."}
				onConfirm={() => logoutEveryAccount("Settings")}
				confirmButtonCta={"Sign out"}
				cancelButtonCta={"Cancel"}
				confirmButtonColor="negative"
			/>

			<SwitchAccountDialog control={switchAccountControl} />
		</Layout.Screen>
	);
}

function ProfilePreview({
	profile,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const shadow = useProfileShadow(profile);
	const moderationOpts = useModerationOpts();

	if (!moderationOpts) return null;

	const moderation = moderateProfile(profile, moderationOpts);

	return (
		<>
			<UserAvatar
				size={80}
				avatar={shadow.avatar}
				moderation={moderation.ui("avatar")}
				type={shadow.associated?.labeler ? "labeler" : "user"}
			/>
			<ProfileHeaderDisplayName profile={shadow} moderation={moderation} />
			<ProfileHeaderHandle profile={shadow} />
		</>
	);
}

function DevOptions() {
	const onboardingDispatch = useOnboardingDispatch();
	const navigation = useNavigation<NavigationProp>();
	const { mutate: deleteChatDeclarationRecord } = useDeleteActorDeclaration();

	const resetOnboarding = async () => {
		navigation.navigate("Home");
		onboardingDispatch({ type: "start" });
		Toast.show("Onboarding reset");
	};

	const clearAllStorage = async () => {
		await clearStorage();
		Toast.show("Storage cleared, you need to restart the app now.");
	};

	return (
		<>
			<SettingsList.PressableItem onPress={() => navigation.navigate("Log")} label={"Open system log"}>
				<SettingsList.ItemText>System log</SettingsList.ItemText>
			</SettingsList.PressableItem>
			<SettingsList.PressableItem onPress={() => navigation.navigate("Debug")} label={"Open storybook page"}>
				<SettingsList.ItemText>Storybook</SettingsList.ItemText>
			</SettingsList.PressableItem>
			<SettingsList.PressableItem
				onPress={() => navigation.navigate("DebugMod")}
				label={"Open moderation debug page"}
			>
				<SettingsList.ItemText>Debug Moderation</SettingsList.ItemText>
			</SettingsList.PressableItem>
			<SettingsList.PressableItem onPress={() => deleteChatDeclarationRecord()} label={"Open storybook page"}>
				<SettingsList.ItemText>Delete chat declaration record</SettingsList.ItemText>
			</SettingsList.PressableItem>
			<SettingsList.PressableItem onPress={() => resetOnboarding()} label={"Reset onboarding state"}>
				<SettingsList.ItemText>Reset onboarding state</SettingsList.ItemText>
			</SettingsList.PressableItem>
			<SettingsList.PressableItem onPress={() => clearAllStorage()} label={"Clear all storage data"}>
				<SettingsList.ItemText>Clear all storage data (restart after this)</SettingsList.ItemText>
			</SettingsList.PressableItem>
		</>
	);
}

function AddAccountRow() {
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const closeEverything = useCloseAllActiveElements();

	const onAddAnotherAccount = () => {
		setShowLoggedOut(true);
		closeEverything();
	};

	return (
		<SettingsList.PressableItem onPress={onAddAnotherAccount} label={"Add another account"}>
			<SettingsList.ItemIcon icon={PersonPlusIcon} />
			<SettingsList.ItemText>Add another account</SettingsList.ItemText>
		</SettingsList.PressableItem>
	);
}

function AccountRow({
	profile,
	account,
	pendingDid,
	onPressSwitchAccount,
}: {
	profile?: AppBskyActorDefs.ProfileViewDetailed;
	account: SessionAccount;
	pendingDid: string | null;
	onPressSwitchAccount: (account: SessionAccount, logContext: "Settings") => void;
}) {
	const t = useTheme();

	const moderationOpts = useModerationOpts();
	const removePromptControl = Prompt.usePromptControl();
	const { removeAccount } = useSessionApi();

	const onSwitchAccount = () => {
		if (pendingDid) return;
		onPressSwitchAccount(account, "Settings");
	};

	return (
		<View style={[a.relative]}>
			<SettingsList.PressableItem onPress={onSwitchAccount} label={"Switch account"}>
				{moderationOpts && profile ? (
					<UserAvatar
						size={28}
						avatar={profile.avatar}
						moderation={moderateProfile(profile, moderationOpts).ui("avatar")}
						type={profile.associated?.labeler ? "labeler" : "user"}
					/>
				) : (
					<View style={[{ width: 28 }]} />
				)}
				<SettingsList.ItemText>{sanitizeHandle(account.handle, "@")}</SettingsList.ItemText>
				{pendingDid === account.did && <SettingsList.ItemIcon icon={Loader} />}
			</SettingsList.PressableItem>
			{!pendingDid && (
				<Menu.Root>
					<Menu.Trigger label={"Account options"}>
						{({ props, state }) => (
							<Pressable
								{...props}
								style={[
									a.absolute,
									{ top: 10, right: tokens.space.lg },
									a.p_xs,
									a.rounded_full,
									(state.hovered || state.pressed) && t.atoms.bg_contrast_25,
								]}
							>
								<DotsHorizontal size="md" style={t.atoms.text} />
							</Pressable>
						)}
					</Menu.Trigger>
					<Menu.Outer showCancel>
						<Menu.Item label={"Remove account"} onPress={() => removePromptControl.open()}>
							<Menu.ItemText>Remove account</Menu.ItemText>
							<Menu.ItemIcon icon={PersonXIcon} />
						</Menu.Item>
					</Menu.Outer>
				</Menu.Root>
			)}

			<Prompt.Basic
				control={removePromptControl}
				title={"Remove from quick access?"}
				description={`This will remove @${account.handle} from the quick access list.`}
				onConfirm={() => {
					removeAccount(account);
					Toast.show("Account removed from quick access");
				}}
				confirmButtonCta={"Remove"}
				confirmButtonColor="negative"
			/>
		</View>
	);
}
