import React, { type JSX } from "react";

import { useNavigate } from "react-router-dom";
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
import { sanitizeHandle } from "#/lib/strings/handles";
import { colors } from "#/lib/styles";
import { router, routes } from "#/routes";
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
		<button type="button" onClick={onPressProfile} style={{ gap: 8 }}>
			<UserAvatar
				size={52}
				avatar={profile?.avatar}
				// See https://github.com/bluesky-social/social-app/pull/1801:
				usePlainRNImage={true}
				type={profile?.associated?.labeler ? "labeler" : "user"}
			/>
			<div style={{ gap: 2 }}>
				<Text
					style={{
						fontWeight: "800",
						fontSize: 20,
						letterSpacing: 0,
						marginTop: 2,
						lineHeight: 1.15,
					}}
					numberOfLines={1}
				>
					{profile?.displayName || account.handle}
				</Text>
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.15,
					}}
					numberOfLines={1}
				>
					{sanitizeHandle(account.handle, "@")}
				</Text>
			</div>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					...t.atoms.text_contrast_medium,
				}}
			>
				<>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
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
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						{formatCount(profile?.followsCount ?? 0)}
					</Text>{" "}
					{profile?.followsCount === 1 ? "following" : "following"}
				</>
			</Text>
		</button>
	);
};
DrawerProfileCard = React.memo(DrawerProfileCard);
export { DrawerProfileCard };

let DrawerContent = (props: React.PropsWithoutRef<{}>): React.ReactNode => {
	const t = useTheme();
	const setDrawerOpen = useSetDrawerOpen();
	// @ts-expect-error
	const { isAtHome, isAtSearch, isAtFeeds, isAtNotifications, isAtMyProfile, isAtMessages } = useNavigationTabState();
	const { hasSession, currentAccount } = useSession();
	const navigate = useNavigate();

	// events
	// =

	const onPressTab = React.useCallback(
		(tab: string) => {
			setDrawerOpen(false);
			// hack because we have flat navigator for web and MyProfile does not exist on the web navigator -ansh
			if (tab === "MyProfile") {
				navigate(`/profile/${currentAccount?.handle}`);
			} else {
				const tabPattern = router.matchName(tab)?.pattern;
				navigate(routes[tab as keyof typeof routes] ?? "/");
			}
		},
		[navigate, setDrawerOpen, currentAccount],
	);

	const onPressHome = React.useCallback(() => onPressTab("Home"), [onPressTab]);

	const onPressSearch = React.useCallback(() => onPressTab("Search"), [onPressTab]);

	const onPressMessages = React.useCallback(() => onPressTab("Messages"), [onPressTab]);

	const onPressNotifications = React.useCallback(() => onPressTab("Notifications"), [onPressTab]);

	const onPressProfile = React.useCallback(() => {
		onPressTab("MyProfile");
	}, [onPressTab]);

	const onPressMyFeeds = React.useCallback(() => {
		navigate("/feeds");
		setDrawerOpen(false);
	}, [navigate, setDrawerOpen]);

	const onPressLists = React.useCallback(() => {
		navigate("/lists");
		setDrawerOpen(false);
	}, [navigate, setDrawerOpen]);

	const onPressSettings = React.useCallback(() => {
		navigate("/settings");
		setDrawerOpen(false);
	}, [navigate, setDrawerOpen]);

	const onPressFeedback = React.useCallback(() => {
		window.open(
			FEEDBACK_FORM_URL({
				email: currentAccount?.email,
				handle: currentAccount?.handle,
			}),
		);
		// Linking.openURL(
		// 	FEEDBACK_FORM_URL({
		// 		email: currentAccount?.email,
		// 		handle: currentAccount?.handle,
		// 	}),
		// );
	}, [currentAccount]);

	const onPressHelp = React.useCallback(() => {
		window.open(HELP_DESK_URL);
		// Linking.openURL(HELP_DESK_URL);
	}, []);

	// rendering
	// =

	return (
		<div
			style={{
				flex: 1,
				...a.border_r,
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
			}}
		>
			<div
				// ScrollView
				style={{ flex: 1 }}
				// contentContainerStyle={[
				// 	{
				// 		paddingTop: a.pt_xl.paddingTop,
				// 	},
				// ]}
			>
				<div style={{ ...a.px_xl }}>
					{hasSession && currentAccount ? (
						<DrawerProfileCard account={currentAccount} onPressProfile={onPressProfile} />
					) : (
						<div style={{ ...a.pr_xl }}>
							<NavSignupCard />
						</div>
					)}

					<Divider
						style={{
							marginTop: 20,
							marginBottom: 8,
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

				<div style={{ ...a.px_xl }}>
					<Divider
						style={{
							marginBottom: 20,
							marginTop: 8,
						}}
					/>
					<ExtraLinks />
				</div>
			</div>
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
				flexDirection: "row",
				gap: 8,
				flexWrap: "wrap",
				paddingLeft: 20,
				paddingTop: 12,

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
	onClick: React.MouseEventHandler<HTMLAnchorElement>;
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
		<Button
			onPress={onClick}
			// accessibilityRole="tab"
			label={label}
		>
			{({ hovered, pressed }) => (
				<div
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						gap: 12,
						paddingTop: 12,
						paddingBottom: 12,
						paddingLeft: 20,
						paddingRight: 20,
						...((hovered || pressed) && t.atoms.bg_contrast_25),
					}}
				>
					<div style={{ ...a.relative }}>
						{icon}
						{count ? (
							<div
								style={{
									position: "absolute",
									left: 0,
									bottom: 0,
									alignItems: "flex-end",
									top: -4,
									right: a.gap_sm.gap * -1,
								}}
							>
								<div
									style={{
										borderRadius: 999,
										right: count.length === 1 ? 6 : 0,
										paddingLeft: 4,
										paddingRight: 4,
										paddingTop: 1,
										paddingBottom: 1,
										backgroundColor: t.palette.primary_500,
									}}
								>
									<Text
										style={{
											fontSize: 12,
											letterSpacing: 0,
											lineHeight: 1.15,
											fontWeight: "600",
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
							flex: 1,
							fontSize: 22,
							letterSpacing: 0,
							...(bold && a.font_heavy),
							lineHeight: 1.3,
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
				flexDirection: "column",
				gap: 12,
				flexWrap: "wrap",
			}}
		>
			<InlineLinkText
				style={{ ...a.text_md }}
				label={"Terms of Service"}
				to="https://bsky.social/about/support/tos"
			>
				Terms of Service
			</InlineLinkText>
			<InlineLinkText
				style={{ ...a.text_md }}
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
							style={{ ...a.text_md }}
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
