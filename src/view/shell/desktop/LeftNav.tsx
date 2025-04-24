import type { AppBskyActorDefs } from "@atproto/api";
import React, { type JSX } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLayoutBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import type { DialogControlProps } from "#/components/Dialog";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { ArrowBoxLeft_Stroke2_Corner0_Rounded as LeaveIcon } from "#/components/icons/ArrowBoxLeft";
import {
	Bell_Stroke2_Corner0_Rounded as Bell,
	Bell_Filled_Corner0_Rounded as BellFilled,
} from "#/components/icons/Bell";
import {
	BulletList_Stroke2_Corner0_Rounded as List,
	BulletList_Filled_Corner0_Rounded as ListFilled,
} from "#/components/icons/BulletList";
import { DotGrid_Stroke2_Corner0_Rounded as EllipsisIcon } from "#/components/icons/DotGrid";
import { EditBig_Stroke2_Corner0_Rounded as EditBig } from "#/components/icons/EditBig";
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
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import {
	SettingsGear2_Stroke2_Corner0_Rounded as Settings,
	SettingsGear2_Filled_Corner0_Rounded as SettingsFilled,
} from "#/components/icons/SettingsGear2";
import {
	UserCircle_Stroke2_Corner0_Rounded as UserCircle,
	UserCircle_Filled_Corner0_Rounded as UserCircleFilled,
} from "#/components/icons/UserCircle";
import { useAccountSwitcher } from "#/lib/hooks/useAccountSwitcher";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { isInvalidHandle, sanitizeHandle } from "#/lib/strings/handles";
import { getIsReducedMotionEnabled } from "#/platform/reduceMotion";
import { emitSoftReset } from "#/state/events";
import { useFetchHandle } from "#/state/queries/handle";
import { useUnreadMessageCount } from "#/state/queries/messages/list-conversations";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";
import { useProfilesQuery } from "#/state/queries/profile";
import { type SessionAccount, useSession, useSessionApi } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { PressableWithHover } from "#/view/com/util/PressableWithHover";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { NavSignupCard } from "#/view/shell/NavSignupCard";
import { router } from "../../../routes";

const NAV_ICON_WIDTH = 28;

function ProfileCard() {
	const { currentAccount, accounts } = useSession();
	const { logoutEveryAccount } = useSessionApi();
	const { isLoading, data } = useProfilesQuery({
		handles: accounts.map((acc) => acc.did),
	});
	const profiles = data?.profiles;
	const signOutPromptControl = Prompt.usePromptControl();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const t = useTheme();

	const size = 48;

	const profile = profiles?.find((p) => p.did === currentAccount!.did);
	const otherAccounts = accounts
		.filter((acc) => acc.did !== currentAccount!.did)
		.map((account) => ({
			account,
			profile: profiles?.find((p) => p.did === account.did),
		}));

	return (
		<div
			style={{
				marginTop: 12,
				marginBottom: 12,
				...(!leftNavMinimal && { width: "100%", alignItems: "center" }),
			}}
		>
			{!isLoading && profile ? (
				<Menu.Root>
					<Menu.Trigger label={"Switch accounts"}>
						{({ props, state, control }) => {
							const active = state.hovered || state.focused || control.isOpen;
							return (
								<Button
									{...props}
									style={{
										width: "100%",
										transitionProperty:
											"color, background-color, border-color, text-decoration-color, fill, stroke",
										transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
										transitionDuration: "100ms",
										...(active ? t.atoms.bg_contrast_25 : { transitionDelay: "50ms" }),
										borderRadius: 999,
										justifyContent: "space-between",
										alignItems: "center",
										flexDirection: "row",
										gap: 6,
										...(!leftNavMinimal && { paddingLeft: 16, paddingRight: 12 }),
									}}
								>
									<div
										style={{
											...(!getIsReducedMotionEnabled() && {
												transitionProperty: "transform",
												transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
												transitionDuration: "250ms",
												...(!active && { transitionDelay: "50ms" }),
											}),
											position: "relative",
											zIndex: 10,
											...(active && {
												scale: !leftNavMinimal ? 2 / 3 : 0.8,
												transform: `translateX(${!leftNavMinimal ? -22 : 0}px)`,
											}),
										}}
									>
										<UserAvatar
											avatar={profile.avatar}
											size={size}
											type={profile?.associated?.labeler ? "labeler" : "user"}
										/>
									</div>
									{!leftNavMinimal && (
										<>
											<div
												style={{
													flex: 1,
													transitionProperty: "opacity",
													transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
													transitionDuration: "100ms",
													...(!active && { transitionDelay: "50ms" }),
													marginLeft: 20 * -1,
													opacity: active ? 1 : 0,
												}}
											>
												<Text
													style={{
														fontWeight: "800",
														fontSize: 14,
														letterSpacing: 0,
														lineHeight: 1.3,
													}}
													numberOfLines={1}
												>
													{sanitizeDisplayName(profile.displayName || profile.handle)}
												</Text>
												<Text
													style={{
														fontSize: 12,
														letterSpacing: 0,
														lineHeight: 1.3,
														...t.atoms.text_contrast_medium,
													}}
													numberOfLines={1}
												>
													{sanitizeHandle(profile.handle, "@")}
												</Text>
											</div>
											<EllipsisIcon
												aria-hidden={true}
												style={{
													...t.atoms.text_contrast_medium,

													transitionProperty: "opacity",
													transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
													transitionDuration: "100ms",
													opacity: active ? 1 : 0,
												}}
												size="sm"
											/>
										</>
									)}
								</Button>
							);
						}}
					</Menu.Trigger>
					<SwitchMenuItems accounts={otherAccounts} signOutPromptControl={signOutPromptControl} />
				</Menu.Root>
			) : (
				<LoadingPlaceholder
					width={size}
					height={size}
					style={{
						...{ borderRadius: size },
						...(!leftNavMinimal && { marginLeft: 16 }),
					}}
				/>
			)}
			<Prompt.Basic
				control={signOutPromptControl}
				title={"Sign out?"}
				description={"You will be signed out of all your accounts."}
				onConfirm={() => logoutEveryAccount()}
				confirmButtonCta={"Sign out"}
				cancelButtonCta={"Cancel"}
				confirmButtonColor="negative"
			/>
		</div>
	);
}

function SwitchMenuItems({
	accounts,
	signOutPromptControl,
}: {
	accounts:
		| {
				account: SessionAccount;
				profile?: AppBskyActorDefs.ProfileViewDetailed;
		  }[]
		| undefined;
	signOutPromptControl: DialogControlProps;
}) {
	const { onPressSwitchAccount, pendingDid } = useAccountSwitcher();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const closeEverything = useCloseAllActiveElements();

	const onAddAnotherAccount = () => {
		setShowLoggedOut(true);
		closeEverything();
	};
	return (
		<Menu.Outer>
			{accounts && accounts.length > 0 && (
				<>
					<Menu.Group>
						<Menu.LabelText>Switch account</Menu.LabelText>
						{accounts.map((other) => (
							<Menu.Item
								disabled={!!pendingDid}
								style={{ minWidth: 150 }}
								key={other.account.did}
								label={`Switch to ${sanitizeHandle(
									other.profile?.handle ?? other.account.handle,
									"@",
								)}`}
								onPress={() => onPressSwitchAccount(other.account)}
							>
								<div style={{ marginLeft: -2 }}>
									<UserAvatar
										avatar={other.profile?.avatar}
										size={20}
										type={other.profile?.associated?.labeler ? "labeler" : "user"}
									/>
								</div>
								<Menu.ItemText>
									{sanitizeHandle(other.profile?.handle ?? other.account.handle, "@")}
								</Menu.ItemText>
							</Menu.Item>
						))}
					</Menu.Group>
					<Menu.Divider />
				</>
			)}
			<Menu.Item label={"Add another account"} onPress={onAddAnotherAccount}>
				<Menu.ItemIcon icon={PlusIcon} />
				<Menu.ItemText>Add another account</Menu.ItemText>
			</Menu.Item>
			<Menu.Item label={"Sign out"} onPress={signOutPromptControl.open}>
				<Menu.ItemIcon icon={LeaveIcon} />
				<Menu.ItemText>Sign out</Menu.ItemText>
			</Menu.Item>
		</Menu.Outer>
	);
}

interface NavItemProps {
	count?: string;
	hasNew?: boolean;
	href: string;
	icon: JSX.Element;
	iconFilled: JSX.Element;
	label: string;
}
function NavItem({ count, hasNew, href, icon, iconFilled, label }: NavItemProps) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const [pathName] = React.useMemo(() => router.matchPath(href), [href]);
	// TODO!!
	const isProfile = false; //useMatch(routes.Profile);
	const isMatchHref = false; //useMatch(pathName);
	const location = useLocation();
	const navigate = useNavigate();
	const isCurrent = isProfile
		? isMatchHref && currentAccount?.handle && location.pathname.includes(currentAccount.handle)
		: isMatchHref;
	// const { onPress } = useLinkProps({ to: href });
	const onPressWrapped = React.useCallback(
		(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			if (e.ctrlKey || e.metaKey || e.altKey) {
				return;
			}
			e.preventDefault();
			if (isCurrent) {
				emitSoftReset();
			} else {
				navigate(href);
			}
		},
		[navigate, href, isCurrent],
	);

	return (
		<PressableWithHover
			style={{
				flexDirection: "row",
				alignItems: "center",
				padding: 12,
				borderRadius: 8,
				gap: 8,
				outlineOffset: "-1px",
				transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
				transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
				transitionDuration: "100ms",
			}}
			hoverStyle={t.atoms.bg_contrast_25}
			onPress={onPressWrapped}
			href={href}
			noUnderline
		>
			<div
				style={{
					alignItems: "center",
					justifyContent: "center",
					zIndex: 10,

					...{
						width: 24,
						height: 24,
					},

					...(leftNavMinimal && {
						width: 40,
						height: 40,
					}),
				}}
			>
				{isCurrent ? iconFilled : icon}
				{typeof count === "string" && count ? (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							bottom: 0,

							...// more breathing room
							{ right: -20 },
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								position: "absolute",
								fontSize: 12,
								letterSpacing: 0,
								fontWeight: "600",
								borderRadius: 999,
								textAlign: "center",
								top: "-10%",
								left: count.length === 1 ? 12 : 8,
								backgroundColor: t.palette.primary_500,
								color: t.palette.white,
								lineHeight: "14px",
								padding: "1px 4px",
								minWidth: 16,
								...(leftNavMinimal && {
									top: "10%",
									left: count.length === 1 ? 20 : 16,
								}),
							}}
						>
							{count}
						</Text>
					</div>
				) : hasNew ? (
					<div
						style={{
							position: "absolute",
							borderRadius: 999,

							...{
								backgroundColor: t.palette.primary_500,
								width: 8,
								height: 8,
								right: -2,
								top: -4,
							},

							...(leftNavMinimal && {
								right: 4,
								top: 2,
							}),
						}}
					/>
				) : null}
			</div>
			{!leftNavMinimal && (
				<Text
					style={{
						fontSize: 20,
						letterSpacing: 0,
						fontWeight: isCurrent ? "800" : "400",
					}}
				>
					{label}
				</Text>
			)}
		</PressableWithHover>
	);
}

function ComposeBtn() {
	const { currentAccount } = useSession();
	const { openComposer } = useComposerControls();
	const { leftNavMinimal } = useLayoutBreakpoints();
	const [isFetchingHandle, setIsFetchingHandle] = React.useState(false);
	const fetchHandle = useFetchHandle();

	const getProfileHandle = async () => {
		const currentLocation = useLocation();
		const currentParams = useParams();

		if (currentLocation.pathname.startsWith("/profile")) {
			let handle: string | undefined = currentParams.name;

			if (handle?.startsWith("did:")) {
				try {
					setIsFetchingHandle(true);
					handle = await fetchHandle(handle);
				} catch (e) {
					handle = undefined;
				} finally {
					setIsFetchingHandle(false);
				}
			}

			if (!handle || handle === currentAccount?.handle || isInvalidHandle(handle)) return undefined;

			return handle;
		}

		return undefined;
	};

	const onPressCompose = async () => openComposer({ mention: await getProfileHandle() });

	if (leftNavMinimal) {
		return null;
	}

	return (
		<div
			style={{
				flexDirection: "row",
				paddingLeft: 12,
				paddingTop: 20,
			}}
		>
			<Button
				disabled={isFetchingHandle}
				label={"Compose new post"}
				onPress={onPressCompose}
				size="large"
				variant="solid"
				color="primary"
				style={{ borderRadius: 999 }}
			>
				<ButtonIcon icon={EditBig} position="left" />
				<ButtonText>New Post</ButtonText>
			</Button>
		</div>
	);
}

function ChatNavItem() {
	const pal = usePalette("default");
	const numUnreadMessages = useUnreadMessageCount();

	return (
		<NavItem
			href="/messages"
			count={numUnreadMessages.numUnread}
			hasNew={numUnreadMessages.hasNew}
			icon={<Message style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
			iconFilled={<MessageFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
			label={"Chat"}
		/>
	);
}

export function DesktopLeftNav() {
	const { hasSession, currentAccount } = useSession();
	const pal = usePalette("default");
	const { isDesktop } = useWebMediaQueries();
	const { leftNavMinimal, centerColumnOffset } = useLayoutBreakpoints();
	const numUnreadNotifications = useUnreadNotifications();

	if (!hasSession && !isDesktop) {
		return null;
	}

	return (
		<nav
			style={{
				paddingLeft: 20,
				paddingRight: 20,
				...styles.leftNav,
				...(leftNavMinimal && styles.leftNavMinimal),
				transform: `translateX(${centerColumnOffset ? -450 : -300}px) translateX(-100%) translateX(calc(-1 * var(--removed-body-scroll-bar-size, 0px) / 2))`,
			}}
		>
			{hasSession ? (
				<ProfileCard />
			) : isDesktop ? (
				<div style={{ paddingTop: 20 }}>
					<NavSignupCard />
				</div>
			) : null}
			{hasSession && (
				<>
					<NavItem
						href="/"
						icon={<Home aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<HomeFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Home"}
					/>
					<NavItem
						href="/search"
						icon={<MagnifyingGlass style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={
							<MagnifyingGlassFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />
						}
						label={"Search"}
					/>
					<NavItem
						href="/notifications"
						count={numUnreadNotifications}
						icon={<Bell aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<BellFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Notifications"}
					/>
					<ChatNavItem />
					<NavItem
						href="/feeds"
						icon={<Hashtag style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={<HashtagFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						label={"Feeds"}
					/>
					<NavItem
						href="/lists"
						icon={<List style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						iconFilled={<ListFilled style={pal.text} aria-hidden={true} width={NAV_ICON_WIDTH} />}
						label={"Lists"}
					/>
					<NavItem
						href={currentAccount ? makeProfileLink(currentAccount) : "/"}
						icon={<UserCircle aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<UserCircleFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Profile"}
					/>
					<NavItem
						href="/settings"
						icon={<Settings aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						iconFilled={<SettingsFilled aria-hidden={true} width={NAV_ICON_WIDTH} style={pal.text} />}
						label={"Settings"}
					/>

					<ComposeBtn />
				</>
			)}
		</nav>
	);
}

const styles = {
	leftNav: {
		position: "fixed",
		top: 0,
		paddingTop: 10,
		paddingBottom: 10,
		left: "50%",
		width: 240,
		maxHeight: "100dvh",
		overflowY: "auto",
	},
	leftNavMinimal: {
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
		height: "100%",
		width: 86,
		alignItems: "center",
		overflowX: "hidden",
	},
	backBtn: {
		position: "absolute",
		top: 12,
		right: 12,
		width: 30,
		height: 30,
	},
} satisfies Record<string, React.CSSProperties>;
