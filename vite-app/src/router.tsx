import { createBrowserRouter, createRoutesFromElements, Routes, Route } from "react-router-dom";
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
import { bskyTitle } from "./lib/strings/headings";

export function createRouter(
	unreadCountLabel: string,
	layoutComponent: React.FC,
) {
	const title = (page: string) => {
		document.title = bskyTitle(page, unreadCountLabel);
		return null;
	};
	return createBrowserRouter(
		createRoutesFromElements(
			<Route path="/" Component={layoutComponent}>
				<Route index Component={HomeScreen} loader={() => title("Home")} />
				<Route path={routes.Search} Component={SearchScreen} loader={() => title("Search")} />
				<Route
					path={routes.Notifications}
					Component={NotificationsScreen}
					loader={() => title("Notifications")}
				/>
				<Route path={routes.Messages} Component={MessagesScreen} loader={() => title("Messages")} />
				<Route path={routes.Start} Component={HomeScreen} loader={() => title("Home")} />
				<Route path={routes.Lists} Component={ListsScreen} loader={() => title("Lists")} />
				<Route path={routes.Moderation} Component={ModerationScreen} loader={() => title("Moderation")} />
				<Route
					path={routes.ModerationModlists}
					Component={ModerationModlistsScreen}
					loader={() => title("Moderation Lists")}
				/>
				<Route
					path={routes.ModerationMutedAccounts}
					Component={ModerationMutedAccounts}
					loader={() => title("Muted Accounts")}
				/>
				<Route
					path={routes.ModerationBlockedAccounts}
					Component={ModerationBlockedAccounts}
					loader={() => title("Blocked Accounts")}
				/>
				<Route
					path={routes.ModerationInteractionSettings}
					Component={ModerationInteractionSettings}
					loader={() => title("Post Interaction Settings")}
				/>
				<Route path={routes.Settings} Component={SettingsScreen} loader={() => title("Settings")} />
				<Route
					path={routes.LanguageSettings}
					Component={LanguageSettingsScreen}
					loader={() => title("Language Settings")}
				/>
				<Route path={routes.Profile} Component={ProfileScreen} />
				<Route path={routes.ProfileFollowers} Component={ProfileFollowersScreen} />
				<Route path={routes.ProfileFollows} Component={ProfileFollowsScreen} />
				<Route path={routes.ProfileKnownFollowers} Component={ProfileKnownFollowersScreen} />
				<Route path={routes.ProfileList} Component={ProfileListScreen} loader={() => title("List")} />
				<Route path={routes.ProfileSearch} Component={ProfileSearchScreen} />
				<Route path={routes.PostThread} Component={PostThreadScreen} />
				<Route path={routes.PostLikedBy} Component={PostLikedByScreen} />
				<Route path={routes.PostRepostedBy} Component={PostRepostedByScreen} />
				<Route path={routes.PostQuotes} Component={PostQuotesScreen} />
				<Route path={routes.ProfileFeed} Component={ProfileFeedScreen} loader={() => title("Feed")} />
				<Route
					path={routes.ProfileFeedLikedBy}
					Component={ProfileFeedLikedByScreen}
					loader={() => title("Liked by")}
				/>
				<Route
					path={routes.ProfileLabelerLikedBy}
					Component={ProfileLabelerLikedByScreen}
					loader={() => title("Liked by")}
				/>
				<Route path={routes.Debug} Component={Storybook} loader={() => title("Storybook")} />
				<Route path={routes.DebugMod} Component={DebugModScreen} loader={() => title("Moderation states")} />
				<Route path={routes.Log} Component={LogScreen} loader={() => title("Log")} />
				<Route path={routes.Support} Component={SupportScreen} loader={() => title("Support")} />
				<Route
					path={routes.PrivacyPolicy}
					Component={PrivacyPolicyScreen}
					loader={() => title("Privacy Policy")}
				/>
				<Route
					path={routes.TermsOfService}
					Component={TermsOfServiceScreen}
					loader={() => title("Terms of Service")}
				/>
				<Route
					path={routes.CommunityGuidelines}
					Component={CommunityGuidelinesScreen}
					loader={() => title("Community Guidelines")}
				/>
				<Route
					path={routes.CopyrightPolicy}
					Component={CopyrightPolicyScreen}
					loader={() => title("Copyright Policy")}
				/>
				<Route
					path={routes.AppPasswords}
					Component={AppPasswordsScreen}
					loader={() => title("App Passwords")}
				/>
				<Route path={routes.SavedFeeds} Component={SavedFeeds} loader={() => title("Edit My Feeds")} />
				<Route
					path={routes.PreferencesFollowingFeed}
					Component={FollowingFeedPreferencesScreen}
					loader={() => title("Following Feed Preferences")}
				/>
				<Route
					path={routes.PreferencesThreads}
					Component={ThreadPreferencesScreen}
					loader={() => title("Threads Preferences")}
				/>
				<Route
					path={routes.PreferencesExternalEmbeds}
					Component={ExternalMediaPreferencesScreen}
					loader={() => title("External Media Preferences")}
				/>
				<Route
					path={routes.AccessibilitySettings}
					Component={AccessibilitySettingsScreen}
					loader={() => title("Accessibility Settings")}
				/>
				<Route
					path={routes.AppearanceSettings}
					Component={AppearanceSettingsScreen}
					loader={() => title("Appearance")}
				/>
				<Route
					path={routes.AccountSettings}
					Component={AccountSettingsScreen}
					loader={() => title("Account")}
				/>
				<Route
					path={routes.PrivacyAndSecuritySettings}
					Component={PrivacyAndSecuritySettingsScreen}
					loader={() => title("Privacy and Security")}
				/>
				<Route
					path={routes.ContentAndMediaSettings}
					Component={ContentAndMediaSettingsScreen}
					loader={() => title("Content and Media")}
				/>
				<Route path={routes.AboutSettings} Component={AboutSettingsScreen} loader={() => title("About")} />
				<Route path={routes.Hashtag} Component={HashtagScreen} loader={() => title("Hashtag")} />
				<Route path={routes.Topic} Component={TopicScreen} loader={() => title("Topic")} />
				<Route
					path={routes.MessagesConversation}
					Component={MessagesConversationScreen}
					loader={() => title("Chat")}
				/>
				<Route
					path={routes.MessagesSettings}
					Component={MessagesSettingsScreen}
					loader={() => title("Chat settings")}
				/>
				<Route
					path={routes.MessagesInbox}
					Component={MessagesInboxScreen}
					loader={() => title("Chat request inbox")}
				/>
				<Route
					path={routes.NotificationSettings}
					Component={NotificationSettingsScreen}
					loader={() => title("Notification settings")}
				/>
				<Route path={routes.Feeds} Component={FeedsScreen} loader={() => title("Feeds")} />
				<Route path={routes.StarterPack} Component={StarterPackScreen} loader={() => title("Starter Pack")} />
				<Route
					path={routes.StarterPackShort}
					Component={StarterPackScreenShort}
					loader={() => title("Starter Pack")}
				/>
				<Route
					path={routes.StarterPackWizard}
					Component={Wizard}
					loader={() => title("Create a starter pack")}
				/>
				<Route
					path={routes.StarterPackEdit}
					Component={Wizard}
					loader={() => title("Edit your starter pack")}
				/>
				<Route path="*" Component={NotFoundScreen} loader={() => title("Not Found")} />
			</Route>,
		),
	);
}
