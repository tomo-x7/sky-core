import { Outlet, Route, RouterProvider, Routes, ScrollRestoration } from "react-router-dom";
import { atoms } from "./alf";
import { PWI_ENABLED } from "./lib/build-flags";
import { useWebMediaQueries } from "./lib/hooks/useWebMediaQueries";
import { routes } from "./routes";
import { Deactivated } from "./screens/Deactivated";
import HashtagScreen from "./screens/Hashtag";
import { MessagesScreen } from "./screens/Messages/ChatList";
import { MessagesConversationScreen } from "./screens/Messages/Conversation";
import { MessagesInboxScreen } from "./screens/Messages/Inbox";
import { MessagesSettingsScreen } from "./screens/Messages/Settings";
import { ModerationScreen } from "./screens/Moderation";
import { Screen as ModerationInteractionSettings } from "./screens/ModerationInteractionSettings";
import { Onboarding } from "./screens/Onboarding";
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
import { SignupQueued } from "./screens/SignupQueued";
import { StarterPackScreen, StarterPackScreenShort } from "./screens/StarterPack/StarterPackScreen";
import { Wizard } from "./screens/StarterPack/Wizard";
import { Takendown } from "./screens/Takendown";
import TopicScreen from "./screens/Topic";
import { useUnreadNotifications } from "./state/queries/notifications/unread";
import { useSession } from "./state/session";
import { useOnboardingState } from "./state/shell";
import { useLoggedOutView, useLoggedOutViewControls } from "./state/shell/logged-out";
import { LoggedOut } from "./view/com/auth/LoggedOut";
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
import { createRouter } from "./router";
import { Shell } from "./view/shell";

export const Navigator = () => {
	const numUnread = useUnreadNotifications();
	return (
		<>
			<RouterProvider router={createRouter(numUnread, Shell)} />
		</>
	);
};

export function OutletWrapper() {
	const numUnread = useUnreadNotifications();
	const { hasSession, currentAccount } = useSession();
	const activeRouteRequiresAuth = false; //TODO
	const onboardingState = useOnboardingState();
	const { showLoggedOut } = useLoggedOutView();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const { isMobile, isTabletOrMobile } = useWebMediaQueries();
	// Show the bottom bar if we have a session only on mobile web. If we don't have a session, we want to show it
	// on both tablet and mobile web so that we see the sign up CTA.
	const showBottomBar = hasSession ? isMobile : isTabletOrMobile;
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
	return (
		<>
			<Outlet />
			{showBottomBar ? <BottomBarWeb /> : <DesktopLeftNav />}
			{!isMobile && <DesktopRightNav />}
		</>
	);
}
