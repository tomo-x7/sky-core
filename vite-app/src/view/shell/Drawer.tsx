import { useNavigation } from "@react-navigation/native";
import React, { type JSX } from "react";
import { Linking, ScrollView, TouchableOpacity } from "react-native";

import { atoms as a, tokens, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Divider } from "#/components/Divider";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import {
	Bell_Stroke2_Corner0_Rounded as Bell,
	Bell_Filled_Corner0_Rounded as BellFilled,
} from "#/components/icons/Bell";
import { BulletList_Stroke2_Corner0_Rounded as List } from "#/components/icons/BulletList";
import {
	Hashtag_Stroke2_Corner0_Rounded as Hashtag,
	Hashtag_Filled_Corner0_Rounded as HashtagFilled,
} from "#/components/icons/Hashtag";
import {
	HomeOpen_Stoke2_Corner0_Rounded as Home,
	HomeOpen_Filled_Corner0_Rounded as HomeFilled,
} from "#/components/icons/HomeOpen";
import { MagnifyingGlass_Filled_Stroke2_Corner0_Rounded as MagnifyingGlassFilled } from "#/components/icons/MagnifyingGlass";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as MagnifyingGlass } from "#/components/icons/MagnifyingGlass2";
import {
	Message_Stroke2_Corner0_Rounded as Message,
	Message_Stroke2_Corner0_Rounded_Filled as MessageFilled,
} from "#/components/icons/Message";
import { SettingsGear2_Stroke2_Corner0_Rounded as Settings } from "#/components/icons/SettingsGear2";
import {
	UserCircle_Stroke2_Corner0_Rounded as UserCircle,
	UserCircle_Filled_Corner0_Rounded as UserCircleFilled,
} from "#/components/icons/UserCircle";
import { FEEDBACK_FORM_URL, HELP_DESK_URL } from "#/lib/constants";
import { useNavigationTabState } from "#/lib/hooks/useNavigationTabState";
import type { NavigationProp } from "#/lib/routes/types";
import { sanitizeHandle } from "#/lib/strings/handles";
import { colors } from "#/lib/styles";
import { useKawaiiMode } from "#/state/preferences/kawaii";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";
import { useProfileQuery } from "#/state/queries/profile";
import { type SessionAccount, useSession } from "#/state/session";
import { useSetDrawerOpen } from "#/state/shell";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { formatCount } from "#/view/com/util/numeric/format";
import { NavSignupCard } from "#/view/shell/NavSignupCard";

const iconWidth = 26;

let DrawerProfileCard = ({
	account,
	onPressProfile,
}: {
	account: SessionAccount;
	onPressProfile: () => void;
}): React.ReactNode => {
	const t = useTheme();
	const { data: profile } = useProfileQuery({ did: account.did });

	return (
		<TouchableOpacity
			accessibilityLabel={"Profile"}
			accessibilityHint={"Navigates to your profile"}
			onPress={onPressProfile}
			style={a.gap_sm}
		>
			<UserAvatar
				size={52}
				avatar={profile?.avatar}
				// See https://github.com/bluesky-social/social-app/pull/1801:
				usePlainRNImage={true}
				type={profile?.associated?.labeler ? "labeler" : "user"}
			/>
			<div style={a.gap_2xs}>
				<Text
					emoji
					style={{
						...a.font_heavy,
						...a.text_xl,
						...a.mt_2xs,
						...a.leading_tight,
					}}
					numberOfLines={1}
				>
					{profile?.displayName || account.handle}
				</Text>
				<Text
					emoji
					style={{
						...t.atoms.text_contrast_medium,
						...a.text_md,
						...a.leading_tight,
					}}
					numberOfLines={1}
				>
					{sanitizeHandle(account.handle, "@")}
				</Text>
			</div>
			<Text
				style={{
					...a.text_md,
					...t.atoms.text_contrast_medium,
				}}
			>
				<>
					<Text
						style={{
							...a.text_md,
							...a.font_bold,
						}}
					>
						{formatCount(profile?.followersCount ?? 0)}
					</Text>{" "}
					{profile?.followersCount === 1 ? "follower" : "followers"}
				</>{" "}
				&middot;{" "}
				<>
					<Text
						style={{
							...a.text_md,
							...a.font_bold,
						}}
					>
						{formatCount(profile?.followsCount ?? 0)}
					</Text>{" "}
					{profile?.followsCount === 1 ? "following" : "following"}
				</>
			</Text>
		</TouchableOpacity>
	);
};
DrawerProfileCard = React.memo(DrawerProfileCard);
export { DrawerProfileCard };

let DrawerContent = (props: React.PropsWithoutRef<{}>): React.ReactNode => {
	const t = useTheme();
	const setDrawerOpen = useSetDrawerOpen();
	const navigation = useNavigation<NavigationProp>();
	const { isAtHome, isAtSearch, isAtFeeds, isAtNotifications, isAtMyProfile, isAtMessages } = useNavigationTabState();
	const { hasSession, currentAccount } = useSession();

	// events
	// =

	const onPressTab = React.useCallback(
		(tab: string) => {
			const state = navigation.getState();
			setDrawerOpen(false);
			// hack because we have flat navigator for web and MyProfile does not exist on the web navigator -ansh
			if (tab === "MyProfile") {
				navigation.navigate("Profile", { name: currentAccount!.handle });
			} else {
				// @ts-expect-error must be Home, Search, Notifications, or MyProfile
				navigation.navigate(tab);
			}
		},
		[navigation, setDrawerOpen, currentAccount],
	);

	const onPressHome = React.useCallback(() => onPressTab("Home"), [onPressTab]);

	const onPressSearch = React.useCallback(() => onPressTab("Search"), [onPressTab]);

	const onPressMessages = React.useCallback(() => onPressTab("Messages"), [onPressTab]);

	const onPressNotifications = React.useCallback(() => onPressTab("Notifications"), [onPressTab]);

	const onPressProfile = React.useCallback(() => {
		onPressTab("MyProfile");
	}, [onPressTab]);

	const onPressMyFeeds = React.useCallback(() => {
		navigation.navigate("Feeds");
		setDrawerOpen(false);
	}, [navigation, setDrawerOpen]);

	const onPressLists = React.useCallback(() => {
		navigation.navigate("Lists");
		setDrawerOpen(false);
	}, [navigation, setDrawerOpen]);

	const onPressSettings = React.useCallback(() => {
		navigation.navigate("Settings");
		setDrawerOpen(false);
	}, [navigation, setDrawerOpen]);

	const onPressFeedback = React.useCallback(() => {
		Linking.openURL(
			FEEDBACK_FORM_URL({
				email: currentAccount?.email,
				handle: currentAccount?.handle,
			}),
		);
	}, [currentAccount]);

	const onPressHelp = React.useCallback(() => {
		Linking.openURL(HELP_DESK_URL);
	}, []);

	// rendering
	// =

	return (
		<div
			style={{
				...a.flex_1,
				...a.border_r,
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
			}}
		>
			<ScrollView
				style={a.flex_1}
				contentContainerStyle={[
					{
						paddingTop: a.pt_xl.paddingTop,
					},
				]}
			>
				<div style={a.px_xl}>
					{hasSession && currentAccount ? (
						<DrawerProfileCard account={currentAccount} onPressProfile={onPressProfile} />
					) : (
						<div style={a.pr_xl}>
							<NavSignupCard />
						</div>
					)}

					<Divider
						style={{
							...a.mt_xl,
							...a.mb_sm,
						}}
					/>
				</div>

				{hasSession ? (
					<>
						<SearchMenuItem isActive={isAtSearch} onPress={onPressSearch} />
						<HomeMenuItem isActive={isAtHome} onPress={onPressHome} />
						<ChatMenuItem isActive={isAtMessages} onPress={onPressMessages} />
						<NotificationsMenuItem isActive={isAtNotifications} onPress={onPressNotifications} />
						<FeedsMenuItem isActive={isAtFeeds} onPress={onPressMyFeeds} />
						<ListsMenuItem onPress={onPressLists} />
						<ProfileMenuItem isActive={isAtMyProfile} onPress={onPressProfile} />
						<SettingsMenuItem onPress={onPressSettings} />
					</>
				) : (
					<>
						<HomeMenuItem isActive={isAtHome} onPress={onPressHome} />
						<FeedsMenuItem isActive={isAtFeeds} onPress={onPressMyFeeds} />
						<SearchMenuItem isActive={isAtSearch} onPress={onPressSearch} />
					</>
				)}

				<div style={a.px_xl}>
					<Divider
						style={{
							...a.mb_xl,
							...a.mt_sm,
						}}
					/>
					<ExtraLinks />
				</div>
			</ScrollView>
			<DrawerFooter onPressFeedback={onPressFeedback} onPressHelp={onPressHelp} />
		</div>
	);
};
DrawerContent = React.memo(DrawerContent);
export { DrawerContent };

let DrawerFooter = ({
	onPressFeedback,
	onPressHelp,
}: {
	onPressFeedback: () => void;
	onPressHelp: () => void;
}): React.ReactNode => {
	return (
		<div
			style={{
				...a.flex_row,
				...a.gap_sm,
				...a.flex_wrap,
				...a.pl_xl,
				...a.pt_md,

				...{
					paddingBottom: tokens.space.xl,
				},
			}}
		>
			<Button label={"Send feedback"} size="small" variant="solid" color="secondary" onPress={onPressFeedback}>
				<ButtonIcon icon={Message} position="left" />
				<ButtonText>Feedback</ButtonText>
			</Button>
			<Button
				label={"Get help"}
				size="small"
				variant="outline"
				color="secondary"
				onPress={onPressHelp}
				style={{
					backgroundColor: "transparent",
				}}
			>
				<ButtonText>Help</ButtonText>
			</Button>
		</div>
	);
};
DrawerFooter = React.memo(DrawerFooter);

interface MenuItemProps {
	icon: JSX.Element;
	label: string;
	count?: string;
	bold?: boolean;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

let SearchMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	return (
		<MenuItem
			icon={
				isActive ? (
					<MagnifyingGlassFilled style={t.atoms.text} width={iconWidth} />
				) : (
					<MagnifyingGlass style={t.atoms.text} width={iconWidth} />
				)
			}
			label={"Search"}
			bold={isActive}
			onClick={onPress}
		/>
	);
};
SearchMenuItem = React.memo(SearchMenuItem);

let HomeMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	return (
		<MenuItem
			icon={
				isActive ? (
					<HomeFilled style={t.atoms.text} width={iconWidth} />
				) : (
					<Home style={t.atoms.text} width={iconWidth} />
				)
			}
			label={"Home"}
			bold={isActive}
			onClick={onPress}
		/>
	);
};
HomeMenuItem = React.memo(HomeMenuItem);

let ChatMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	return (
		<MenuItem
			icon={
				isActive ? (
					<MessageFilled style={t.atoms.text} width={iconWidth} />
				) : (
					<Message style={t.atoms.text} width={iconWidth} />
				)
			}
			label={"Chat"}
			bold={isActive}
			onClick={onPress}
		/>
	);
};
ChatMenuItem = React.memo(ChatMenuItem);

let NotificationsMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	const numUnreadNotifications = useUnreadNotifications();
	return (
		<MenuItem
			icon={
				isActive ? (
					<BellFilled style={t.atoms.text} width={iconWidth} />
				) : (
					<Bell style={t.atoms.text} width={iconWidth} />
				)
			}
			label={"Notifications"}
			count={numUnreadNotifications}
			bold={isActive}
			onClick={onPress}
		/>
	);
};
NotificationsMenuItem = React.memo(NotificationsMenuItem);

let FeedsMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	return (
		<MenuItem
			icon={
				isActive ? (
					<HashtagFilled width={iconWidth} style={t.atoms.text} />
				) : (
					<Hashtag width={iconWidth} style={t.atoms.text} />
				)
			}
			label={"Feeds"}
			bold={isActive}
			onClick={onPress}
		/>
	);
};
FeedsMenuItem = React.memo(FeedsMenuItem);

let ListsMenuItem = ({ onPress }: { onPress: () => void }): React.ReactNode => {
	const t = useTheme();

	return <MenuItem icon={<List style={t.atoms.text} width={iconWidth} />} label={"Lists"} onClick={onPress} />;
};
ListsMenuItem = React.memo(ListsMenuItem);

let ProfileMenuItem = ({
	isActive,
	onPress,
}: {
	isActive: boolean;
	onPress: () => void;
}): React.ReactNode => {
	const t = useTheme();
	return (
		<MenuItem
			icon={
				isActive ? (
					<UserCircleFilled style={t.atoms.text} width={iconWidth} />
				) : (
					<UserCircle style={t.atoms.text} width={iconWidth} />
				)
			}
			label={"Profile"}
			onClick={onPress}
		/>
	);
};
ProfileMenuItem = React.memo(ProfileMenuItem);

let SettingsMenuItem = ({ onPress }: { onPress: () => void }): React.ReactNode => {
	const t = useTheme();
	return <MenuItem icon={<Settings style={t.atoms.text} width={iconWidth} />} label={"Settings"} onClick={onPress} />;
};
SettingsMenuItem = React.memo(SettingsMenuItem);

function MenuItem({ icon, label, count, bold, onClick }: MenuItemProps) {
	const t = useTheme();
	return (
		<Button onPress={onClick ?? undefined} accessibilityRole="tab" label={label}>
			{({ hovered, pressed }) => (
				<div
					style={{
						...a.flex_1,
						...a.flex_row,
						...a.align_center,
						...a.gap_md,
						...a.py_md,
						...a.px_xl,
						...((hovered || pressed) && t.atoms.bg_contrast_25),
					}}
				>
					<div style={a.relative}>
						{icon}
						{count ? (
							<div
								style={{
									...a.absolute,
									...a.inset_0,
									...a.align_end,
									...{ top: -4, right: a.gap_sm.gap * -1 },
								}}
							>
								<div
									style={{
										...a.rounded_full,

										...{
											right: count.length === 1 ? 6 : 0,
											paddingHorizontal: 4,
											paddingVertical: 1,
											backgroundColor: t.palette.primary_500,
										},
									}}
								>
									<Text
										style={{
											...a.text_xs,
											...a.leading_tight,
											...a.font_bold,
											fontVariant: "tabular-nums",
											color: colors.white,
										}}
										numberOfLines={1}
									>
										{count}
									</Text>
								</div>
							</div>
						) : undefined}
					</div>
					<Text
						style={{
							...a.flex_1,
							...a.text_2xl,
							...(bold && a.font_heavy),
							...a.leading_snug,
						}}
						numberOfLines={1}
					>
						{label}
					</Text>
				</div>
			)}
		</Button>
	);
}

function ExtraLinks() {
	const t = useTheme();
	const kawaii = useKawaiiMode();

	return (
		<div
			style={{
				...a.flex_col,
				...a.gap_md,
				...a.flex_wrap,
			}}
		>
			<InlineLinkText style={a.text_md} label={"Terms of Service"} to="https://bsky.social/about/support/tos">
				Terms of Service
			</InlineLinkText>
			<InlineLinkText
				style={a.text_md}
				to="https://bsky.social/about/support/privacy-policy"
				label={"Privacy Policy"}
			>
				Privacy Policy
			</InlineLinkText>
			{kawaii && (
				<Text style={t.atoms.text_contrast_medium}>
					<>
						Logo by{" "}
						<InlineLinkText
							style={a.text_md}
							to="/profile/sawaratsuki.bsky.social"
							label="@sawaratsuki.bsky.social"
						>
							@sawaratsuki.bsky.social
						</InlineLinkText>
					</>
				</Text>
			)}
		</div>
	);
}
