import React from "react";

import { useLocation, useMatch } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import {
	Bell_Stroke2_Corner0_Rounded as Bell,
	Bell_Filled_Corner0_Rounded as BellFilled,
} from "#/components/icons/Bell";
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
import {
	UserCircle_Stroke2_Corner0_Rounded as UserCircle,
	UserCircle_Filled_Corner0_Rounded as UserCircleFilled,
} from "#/components/icons/UserCircle";
import { useMinimalShellFooterTransform } from "#/lib/hooks/useMinimalShellTransform";
import { makeProfileLink } from "#/lib/routes/links";
import { routes } from "#/routes";
import { useHomeBadge } from "#/state/home-badge";
import { useUnreadMessageCount } from "#/state/queries/messages/list-conversations";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";
import { useSession } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { useCloseAllActiveElements } from "#/state/util";
import { Link } from "#/view/com/util/Link";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";
import { styles } from "./BottomBarStyles";

export function BottomBarWeb() {
	const { hasSession, currentAccount } = useSession();
	const t = useTheme();
	const footerMinimalShellTransform = useMinimalShellFooterTransform();
	const { requestSwitchToAccount } = useLoggedOutViewControls();
	const closeAllActiveElements = useCloseAllActiveElements();
	const iconWidth = 26;

	const unreadMessageCount = useUnreadMessageCount();
	const notificationCountStr = useUnreadNotifications();
	const hasHomeBadge = useHomeBadge();

	const showSignIn = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "none" });
	}, [requestSwitchToAccount, closeAllActiveElements]);

	const showCreateAccount = React.useCallback(() => {
		closeAllActiveElements();
		requestSwitchToAccount({ requestedAccount: "new" });
		// setShowLoggedOut(true)
	}, [requestSwitchToAccount, closeAllActiveElements]);

	return (
		<nav
			// Animated.View
			style={{
				...styles.bottomBar,
				...styles.bottomBarWeb,
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				// ...footerMinimalShellTransform,
			}}
		>
			{hasSession ? (
				<>
					<NavItem routeName="Home" href="/">
						{({ isActive }) => {
							const Icon = isActive ? HomeFilled : Home;
							return (
								<Icon
									aria-hidden={true}
									width={iconWidth + 1}
									style={{
										...styles.ctrlIcon,
										...t.atoms.text,
										...styles.homeIcon,
									}}
								/>
							);
						}}
					</NavItem>
					<NavItem routeName="Search" href="/search">
						{({ isActive }) => {
							const Icon = isActive ? MagnifyingGlassFilled : MagnifyingGlass;
							return (
								<Icon
									aria-hidden={true}
									width={iconWidth + 2}
									style={{
										...styles.ctrlIcon,
										...t.atoms.text,
										...styles.searchIcon,
									}}
								/>
							);
						}}
					</NavItem>

					{hasSession && (
						<>
							<NavItem
								routeName="Messages"
								href="/messages"
								notificationCount={unreadMessageCount.numUnread}
								hasNew={unreadMessageCount.hasNew}
							>
								{({ isActive }) => {
									const Icon = isActive ? MessageFilled : Message;
									return (
										<Icon
											aria-hidden={true}
											width={iconWidth - 1}
											style={{
												...styles.ctrlIcon,
												...t.atoms.text,
												...styles.messagesIcon,
											}}
										/>
									);
								}}
							</NavItem>
							<NavItem
								routeName="Notifications"
								href="/notifications"
								notificationCount={notificationCountStr}
							>
								{({ isActive }) => {
									const Icon = isActive ? BellFilled : Bell;
									return (
										<Icon
											aria-hidden={true}
											width={iconWidth}
											style={{
												...styles.ctrlIcon,
												...t.atoms.text,
												...styles.bellIcon,
											}}
										/>
									);
								}}
							</NavItem>
							<NavItem
								routeName="Profile"
								href={
									currentAccount
										? makeProfileLink({
												did: currentAccount.did,
												handle: currentAccount.handle,
											})
										: "/"
								}
							>
								{({ isActive }) => {
									const Icon = isActive ? UserCircleFilled : UserCircle;
									return (
										<Icon
											aria-hidden={true}
											width={iconWidth}
											style={{
												...styles.ctrlIcon,
												...t.atoms.text,
												...styles.profileIcon,
											}}
										/>
									);
								}}
							</NavItem>
						</>
					)}
				</>
			) : (
				<>
					<div
						style={{
							width: "100%",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingTop: 14,
							paddingBottom: 14,
							paddingLeft: 14,
							paddingRight: 6,
							gap: 8,
						}}
					>
						<div style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
							<Logo width={32} />
							<div style={{ paddingTop: 4 }}>
								<Logotype width={80} fill={t.atoms.text.color} />
							</div>
						</div>

						<div
							style={{
								flexDirection: "row",
								flexWrap: "wrap",
								gap: 8,
							}}
						>
							<Button
								onPress={showCreateAccount}
								label={"Create account"}
								size="small"
								variant="solid"
								color="primary"
							>
								<ButtonText>Create account</ButtonText>
							</Button>
							<Button
								onPress={showSignIn}
								label={"Sign in"}
								size="small"
								variant="solid"
								color="secondary"
							>
								<ButtonText>Sign in</ButtonText>
							</Button>
						</div>
					</div>
				</>
			)}
		</nav>
	);
}

const NavItem: React.FC<{
	children: (props: { isActive: boolean }) => React.ReactNode;
	href: string;
	routeName: string;
	hasNew?: boolean;
	notificationCount?: string;
}> = ({ children, href, routeName, hasNew, notificationCount }) => {
	const { currentAccount } = useSession();
	// TODO!!
	const isMatchHref = useMatch(href) != null;
	const isProfile = useMatch(routes.Profile) != null;
	const location = useLocation();

	// Checks whether we're on someone else's profile
	const isOnDifferentProfile =
		isProfile &&
		routeName === "Profile" &&
		(currentAccount?.handle == null || !location.pathname.includes(currentAccount.handle));

	const isActive = isProfile
		? isMatchHref && currentAccount?.handle != null && location.pathname.includes(currentAccount.handle)
		: isMatchHref;

	return (
		<Link
			href={href}
			style={{
				...styles.ctrl,
				paddingBottom: 16,
			}}
			navigationAction={isOnDifferentProfile ? "push" : "navigate"}
			// aria-role="link"
			// aria-label={routeName}
		>
			{children({ isActive })}
			{notificationCount ? (
				<div
					style={styles.notificationCount}
					aria-label={`${notificationCount ?? 0} unread ${notificationCount === "1" ? "item" : "items"}`}
				>
					<Text style={styles.notificationCountLabel}>{notificationCount}</Text>
				</div>
			) : hasNew ? (
				<div style={styles.hasNewBadge} />
			) : null}
		</Link>
	);
};
