import * as React from "react";

import { Route, Routes, ScrollRestoration } from "react-router-dom";
import { atoms, useTheme } from "./alf";
import { useWebScrollRestoration } from "./lib/hooks/useWebScrollRestoration";
import { bskyTitle } from "./lib/strings/headings";
import { router, routes } from "./routes";
import HashtagScreen from "./screens/Hashtag";
import { MessagesScreen } from "./screens/Messages/ChatList";
import { MessagesConversationScreen } from "./screens/Messages/Conversation";
import { MessagesInboxScreen } from "./screens/Messages/Inbox";
import { MessagesSettingsScreen } from "./screens/Messages/Settings";
import { ModerationScreen } from "./screens/Moderation";
import { Screen as ModerationInteractionSettings } from "./screens/ModerationInteractionSettings";
import { PostLikedByScreen } from "./screens/Post/PostLikedBy";
import { PostQuotesScreen } from "./screens/Post/PostQuotes";
import { PostRepostedByScreen } from "./screens/Post/PostRepostedBy";
import { ProfileKnownFollowersScreen } from "./screens/Profile/KnownFollowers";
import { ProfileFeedScreen } from "./screens/Profile/ProfileFeed";
import { ProfileFollowersScreen } from "./screens/Profile/ProfileFollowers";
import { ProfileFollowsScreen } from "./screens/Profile/ProfileFollows";
import { ProfileLabelerLikedByScreen } from "./screens/Profile/ProfileLabelerLikedBy";
import { ProfileSearchScreen } from "./screens/Profile/ProfileSearch";
import { AboutSettingsScreen } from "./screens/Settings/AboutSettings";
import { AccessibilitySettingsScreen } from "./screens/Settings/AccessibilitySettings";
import { AccountSettingsScreen } from "./screens/Settings/AccountSettings";
import { AppPasswordsScreen } from "./screens/Settings/AppPasswords";
import { AppearanceSettingsScreen } from "./screens/Settings/AppearanceSettings";
import { ContentAndMediaSettingsScreen } from "./screens/Settings/ContentAndMediaSettings";
import { ExternalMediaPreferencesScreen } from "./screens/Settings/ExternalMediaPreferences";
import { FollowingFeedPreferencesScreen } from "./screens/Settings/FollowingFeedPreferences";
import { LanguageSettingsScreen } from "./screens/Settings/LanguageSettings";
import { NotificationSettingsScreen } from "./screens/Settings/NotificationSettings";
import { PrivacyAndSecuritySettingsScreen } from "./screens/Settings/PrivacyAndSecuritySettings";
import { SettingsScreen } from "./screens/Settings/Settings";
import { ThreadPreferencesScreen } from "./screens/Settings/ThreadPreferences";
import { StarterPackScreen, StarterPackScreenShort } from "./screens/StarterPack/StarterPackScreen";
import { Wizard } from "./screens/StarterPack/Wizard";
import TopicScreen from "./screens/Topic";
import { useUnreadNotifications } from "./state/queries/notifications/unread";
import { CommunityGuidelinesScreen } from "./view/screens/CommunityGuidelines";
import { CopyrightPolicyScreen } from "./view/screens/CopyrightPolicy";
import { DebugModScreen } from "./view/screens/DebugMod";
import { FeedsScreen } from "./view/screens/Feeds";
import { HomeScreen } from "./view/screens/Home";
import { ListsScreen } from "./view/screens/Lists";
import { LogScreen } from "./view/screens/Log";
import { ModerationBlockedAccounts } from "./view/screens/ModerationBlockedAccounts";
import { ModerationModlistsScreen } from "./view/screens/ModerationModlists";
import { ModerationMutedAccounts } from "./view/screens/ModerationMutedAccounts";
import { NotFoundScreen } from "./view/screens/NotFound";
import { NotificationsScreen } from "./view/screens/Notifications";
import { PostThreadScreen } from "./view/screens/PostThread";
import { PrivacyPolicyScreen } from "./view/screens/PrivacyPolicy";
import { ProfileScreen } from "./view/screens/Profile";
import { ProfileFeedLikedByScreen } from "./view/screens/ProfileFeedLikedBy";
import { ProfileListScreen } from "./view/screens/ProfileList";
import { SavedFeeds } from "./view/screens/SavedFeeds";
import { SearchScreen } from "./view/screens/Search";
import { Storybook } from "./view/screens/Storybook";
import { SupportScreen } from "./view/screens/Support";
import { TermsOfServiceScreen } from "./view/screens/TermsOfService";
import { BottomBarWeb } from "./view/shell/bottom-bar/BottomBarWeb";
import { DesktopLeftNav } from "./view/shell/desktop/LeftNav";
import { DesktopRightNav } from "./view/shell/desktop/RightNav";
import { isMobileWeb } from "#/platform/detection";
import { useWebMediaQueries } from "./lib/hooks/useWebMediaQueries";
import { PWI_ENABLED } from "./lib/build-flags";
import { Deactivated } from "./screens/Deactivated";
import { Onboarding } from "./screens/Onboarding";
import { SignupQueued } from "./screens/SignupQueued";
import { Takendown } from "./screens/Takendown";
import { useSession } from "./state/session";
import { useOnboardingState } from "./state/shell";
import { useLoggedOutView, useLoggedOutViewControls } from "./state/shell/logged-out";
import { LoggedOut } from "./view/com/auth/LoggedOut";

// const navigationRef = createNavigationContainerRef<AllNavigatorParams>();

function Screen({
	name,
	component,
	getComponent,
	options,
}: {
	name: string;
	component?: React.FC;
	getComponent?: () => React.FC;
	options?: { title?: string; requireAuth?: boolean };
}) {
	const path = router.matchName(name)?.pattern;
	const Com = component ?? getComponent?.() ?? React.Fragment;
	if (options?.title != null) document.title = options.title;
	return <Route path={path} element={<Com />} />;
}
/**
 * The FlatNavigator is used by Web to represent the routes
 * in a single ("flat") stack.
 */
const FlatNavigator = () => {
	const t = useTheme();
	const numUnread = useUnreadNotifications();
	const screenListeners = useWebScrollRestoration();
	const title = (page: string) => bskyTitle(page, numUnread);
	const { hasSession, currentAccount } = useSession();
	const activeRouteRequiresAuth = false; //TODO
	const onboardingState = useOnboardingState();
	const { showLoggedOut } = useLoggedOutView();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const { isMobile, isTabletOrMobile } = useWebMediaQueries();
	if (!hasSession && (!PWI_ENABLED || activeRouteRequiresAuth)) {
		return <LoggedOut />;
	}
	if (hasSession && currentAccount?.signupQueued) {
		return <SignupQueued />;
	}
	if (hasSession && currentAccount?.status === "takendown") {
		return <Takendown />;
	}
	if (showLoggedOut) {
		return <LoggedOut onDismiss={() => setShowLoggedOut(false)} />;
	}
	if (currentAccount?.status === "deactivated") {
		return <Deactivated />;
	}
	if (onboardingState.isActive) {
		return <Onboarding />;
	}
	// const newDescriptors: typeof descriptors = {};
	// for (let key in descriptors) {
	// 	const descriptor = descriptors[key];
	// 	const requireAuth = descriptor.options.requireAuth ?? false;
	// 	newDescriptors[key] = {
	// 		...descriptor,
	// 		render() {
	// 			if (requireAuth && !hasSession) {
	// 				return <View />;
	// 			} else {
	// 				return descriptor.render();
	// 			}
	// 		},
	// 	};
	// }

	// Show the bottom bar if we have a session only on mobile web. If we don't have a session, we want to show it
	// on both tablet and mobile web so that we see the sign up CTA.
	const showBottomBar = hasSession ? isMobile : isTabletOrMobile;
	console.log(showBottomBar ? "showBottomBar" : "hideBottomBar");

	return (
		<>
			{/* <ScrollRestoration
				getKey={(location, matches) => {
					return location.pathname;
				}}
			/> */}
			<main style={atoms.flex_1}>
				<Routes>
					<Route path={routes.Home} Component={HomeScreen} /*options={{ title: title("Home") }}*/ />
					<Route path={routes.Search} Component={SearchScreen} /*options={{ title: title("Search") }}*/ />
					<Route
						path={routes.Notifications}
						Component={NotificationsScreen}
						/*options={{ title: title("Notifications"), requireAuth: true }}*/
					/>
					<Route
						path={routes.Messages}
						Component={MessagesScreen}
						/*options={{ title: title("Messages"), requireAuth: true }}*/
					/>
					<Route path={routes.Start} Component={HomeScreen} /*options={{ title: title("Home") }}*/ />
					<Route
						path={routes.Lists}
						Component={ListsScreen} /*options={{ title: title("Lists"), requireAuth: true }}*/
					/>
					<Route
						path={routes.Moderation}
						Component={ModerationScreen}
						/*options={{ title: title("Moderation"), requireAuth: true }}*/
					/>
					<Route
						path={routes.ModerationModlists}
						Component={ModerationModlistsScreen}
						/*options={{ title: title("Moderation Lists"), requireAuth: true }}*/
					/>
					<Route
						path={routes.ModerationMutedAccounts}
						Component={ModerationMutedAccounts}
						/*options={{ title: title("Muted Accounts"), requireAuth: true }}*/
					/>
					<Route
						path={routes.ModerationBlockedAccounts}
						Component={ModerationBlockedAccounts}
						/*options={{ title: title("Blocked Accounts"), requireAuth: true }}*/
					/>
					<Route
						path={routes.ModerationInteractionSettings}
						Component={ModerationInteractionSettings}
						/*options={{
							title: title("Post Interaction Settings"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.Settings}
						Component={SettingsScreen}
						/*options={{ title: title("Settings"), requireAuth: true }}*/
					/>
					<Route
						path={routes.LanguageSettings}
						Component={LanguageSettingsScreen}
						/*options={{ title: title("Language Settings"), requireAuth: true }}*/
					/>
					<Route path={routes.Profile} Component={ProfileScreen} />
					<Route path={routes.ProfileFollowers} Component={ProfileFollowersScreen} />
					<Route path={routes.ProfileFollows} Component={ProfileFollowsScreen} />
					<Route path={routes.ProfileKnownFollowers} Component={ProfileKnownFollowersScreen} />
					<Route
						path={routes.ProfileList}
						Component={ProfileListScreen}
						/*options={{ title: title("List"), requireAuth: true }}*/
					/>
					<Route path={routes.ProfileSearch} Component={ProfileSearchScreen} />
					<Route path={routes.PostThread} Component={PostThreadScreen} />
					<Route path={routes.PostLikedBy} Component={PostLikedByScreen} />
					<Route path={routes.PostRepostedBy} Component={PostRepostedByScreen} />
					<Route path={routes.PostQuotes} Component={PostQuotesScreen} />
					<Route
						path={routes.ProfileFeed}
						Component={ProfileFeedScreen} /*options={{ title: title("Feed") }}*/
					/>
					<Route
						path={routes.ProfileFeedLikedBy}
						Component={ProfileFeedLikedByScreen}
						/*options={{ title: title("Liked by") }}*/
					/>
					<Route
						path={routes.ProfileLabelerLikedBy}
						Component={ProfileLabelerLikedByScreen}
						/*options={{ title: title("Liked by") }}*/
					/>
					<Route
						path={routes.Debug}
						Component={Storybook}
						/*options={{ title: title("Storybook"), requireAuth: true }}*/
					/>
					<Route
						path={routes.DebugMod}
						Component={DebugModScreen}
						/*options={{ title: title("Moderation states"), requireAuth: true }}*/
					/>
					<Route
						path={routes.Log}
						Component={LogScreen}
						/*options={{ title: title("Log"), requireAuth: true }}*/
					/>
					<Route path={routes.Support} Component={SupportScreen} /*options={{ title: title("Support") }}*/ />
					<Route
						path={routes.PrivacyPolicy}
						Component={PrivacyPolicyScreen}
						/*options={{ title: title("Privacy Policy") }}*/
					/>
					<Route
						path={routes.TermsOfService}
						Component={TermsOfServiceScreen}
						/*options={{ title: title("Terms of Service") }}*/
					/>
					<Route
						path={routes.CommunityGuidelines}
						Component={CommunityGuidelinesScreen}
						/*options={{ title: title("Community Guidelines") }}*/
					/>
					<Route
						path={routes.CopyrightPolicy}
						Component={CopyrightPolicyScreen}
						/*options={{ title: title("Copyright Policy") }}*/
					/>
					<Route
						path={routes.AppPasswords}
						Component={AppPasswordsScreen}
						/*options={{ title: title("App Passwords"), requireAuth: true }}*/
					/>
					<Route
						path={routes.SavedFeeds}
						Component={SavedFeeds}
						/*options={{ title: title("Edit My Feeds"), requireAuth: true }}*/
					/>
					<Route
						path={routes.PreferencesFollowingFeed}
						Component={FollowingFeedPreferencesScreen}
						/*options={{
							title: title("Following Feed Preferences"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.PreferencesThreads}
						Component={ThreadPreferencesScreen}
						/*options={{ title: title("Threads Preferences"), requireAuth: true }}*/
					/>
					<Route
						path={routes.PreferencesExternalEmbeds}
						Component={ExternalMediaPreferencesScreen}
						/*options={{
							title: title("External Media Preferences"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.AccessibilitySettings}
						Component={AccessibilitySettingsScreen}
						/*options={{
							title: title("Accessibility Settings"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.AppearanceSettings}
						Component={AppearanceSettingsScreen}
						/*options={{
							title: title("Appearance"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.AccountSettings}
						Component={AccountSettingsScreen}
						/*options={{
							title: title("Account"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.PrivacyAndSecuritySettings}
						Component={PrivacyAndSecuritySettingsScreen}
						/*options={{
							title: title("Privacy and Security"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.ContentAndMediaSettings}
						Component={ContentAndMediaSettingsScreen}
						/*options={{
							title: title("Content and Media"),
							requireAuth: true,
						}}*/
					/>
					<Route
						path={routes.AboutSettings}
						Component={AboutSettingsScreen}
						/*options={{
							title: title("About"),
							requireAuth: true,
						}}*/
					/>
					<Route path={routes.Hashtag} Component={HashtagScreen} /*options={{ title: title("Hashtag") }}*/ />
					<Route path={routes.Topic} Component={TopicScreen} /*options={{ title: title("Topic") }}*/ />
					<Route
						path={routes.MessagesConversation}
						Component={MessagesConversationScreen}
						/*options={{ title: title("Chat"), requireAuth: true }}*/
					/>
					<Route
						path={routes.MessagesSettings}
						Component={MessagesSettingsScreen}
						/*options={{ title: title("Chat settings"), requireAuth: true }}*/
					/>
					<Route
						path={routes.MessagesInbox}
						Component={MessagesInboxScreen}
						/*options={{ title: title("Chat request inbox"), requireAuth: true }}*/
					/>
					<Route
						path={routes.NotificationSettings}
						Component={NotificationSettingsScreen}
						/*options={{ title: title("Notification settings"), requireAuth: true }}*/
					/>
					<Route path={routes.Feeds} Component={FeedsScreen} /*options={{ title: title("Feeds") }}*/ />
					<Route
						path={routes.StarterPack}
						Component={StarterPackScreen}
						/*options={{ title: title("Starter Pack") }}*/
					/>
					<Route
						path={routes.StarterPackShort}
						Component={StarterPackScreenShort}
						/*options={{ title: title("Starter Pack") }}*/
					/>
					<Route
						path={routes.StarterPackWizard}
						Component={Wizard}
						/*options={{ title: title("Create a starter pack"), requireAuth: true }}*/
					/>
					<Route
						path={routes.StarterPackEdit}
						Component={Wizard}
						/*options={{ title: title("Edit your starter pack"), requireAuth: true }}*/
					/>
					<Route path="*" Component={NotFoundScreen} /*options={{ title: title("Not Found") }}*/ />
				</Routes>
			</main>
			{
				<>
					{showBottomBar ? <BottomBarWeb /> : <DesktopLeftNav />}
					{!isMobile && <DesktopRightNav />}
				</>
			}
		</>
	);
};

/**
 * The RoutesContainer should wrap all components which need access
 * to the navigation context.
 */

// const LINKING = {
// 	// TODO figure out what we are going to use
// 	prefixes: ["https://bsky.app"],

// 	getPathFromState(state: State) {
// 		// find the current node in the navigation tree
// 		let node = state.routes[state.index || 0];
// 		while (node.state?.routes && typeof node.state?.index === "number") {
// 			node = node.state?.routes[node.state?.index];
// 		}

// 		// build the path
// 		const route = router.matchName(node.name);
// 		if (typeof route === "undefined") {
// 			return "/"; // default to home
// 		}
// 		return route.build((node.params || {}) as RouteParams);
// 	},

// 	getStateFromPath(path: string) {
// 		const [name, params] = router.matchPath(path);

// 		// Any time we receive a url that starts with `intent/` we want to ignore it here. It will be handled in the
// 		// intent handler hook. We should check for the trailing slash, because if there isn't one then it isn't a valid
// 		// intent
// 		// On web, there is no route state that's created by default, so we should initialize it as the home route. On
// 		// native, since the home tab and the home screen are defined as initial routes, we don't need to return a state
// 		// since it will be created by react-navigation.
// 		if (path.includes("intent/")) {
// 			return buildStateObject("Flat", "Home", params);
// 		}

// 		const res = buildStateObject("Flat", name, params);
// 		return res;
// 	},
// };

// function RoutesContainer({ children }: React.PropsWithChildren) {
// 	const theme = useColorSchemeStyle(DefaultTheme, DarkTheme);
// 	const { currentAccount } = useSession();
// 	const { openModal } = useModalControls();

// 	function onReady() {
// 		if (currentAccount && shouldRequestEmailConfirmation(currentAccount)) {
// 			openModal({ name: "verify-email", showReminder: true });
// 			snoozeEmailConfirmationPrompt();
// 		}
// 	}

// 	return (
// 		<NavigationContainer
// 			ref={navigationRef}
// 			linking={LINKING}
// 			theme={theme}
// 			onReady={() => {
// 				onReady();
// 			}}
// 		>
// 			{children}
// 		</NavigationContainer>
// 	);
// }

/**
 * These helpers can be used from outside of the RoutesContainer
 * (eg in the state models).
 */
/**@deprecated */
// function navigate<K extends keyof AllNavigatorParams>(name: K, params?: AllNavigatorParams[K]) {
// 	if (navigationRef.isReady()) {
// 		return Promise.race([
// 			new Promise<void>((resolve) => {
// 				const handler = () => {
// 					resolve();
// 					navigationRef.removeListener("state", handler);
// 				};
// 				navigationRef.addListener("state", handler);

// 				// @ts-expect-error I dont know what would make typescript happy but I have a life -prf
// 				navigationRef.navigate(name, params);
// 			}),
// 			timeout(1e3),
// 		]);
// 	}
// 	return Promise.resolve();
// }

// function resetToTab(tabName: "HomeTab" | "SearchTab" | "NotificationsTab") {
// 	if (navigationRef.isReady()) {
// 		navigate(tabName);
// 		if (navigationRef.canGoBack()) {
// 			navigationRef.dispatch(StackActions.popToTop()); //we need to check .canGoBack() before calling it
// 		}
// 	}
// }

export { FlatNavigator };
