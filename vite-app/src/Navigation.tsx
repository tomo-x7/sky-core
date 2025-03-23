import * as React from "react";

import { Route, ScrollRestoration } from "react-router-dom";
import { useTheme } from "./alf";
import { useWebScrollRestoration } from "./lib/hooks/useWebScrollRestoration";
import { bskyTitle } from "./lib/strings/headings";
import { router } from "./routes";
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

	return (
		<div
		// screenListeners={screenListeners}
		// screenOptions={{
		// 	animationDuration: 285,
		// 	gestureEnabled: true,
		// 	fullScreenGestureEnabled: true,
		// 	headerShown: false,
		// 	contentStyle: t.atoms.bg,
		// }}
		>
			<ScrollRestoration
				getKey={(location, matches) => {
					return location.pathname;
				}}
			/>
			<Screen name="Home" getComponent={() => HomeScreen} options={{ title: title("Home") }} />
			<Screen name="Search" getComponent={() => SearchScreen} options={{ title: title("Search") }} />
			<Screen
				name="Notifications"
				getComponent={() => NotificationsScreen}
				options={{ title: title("Notifications"), requireAuth: true }}
			/>
			<Screen
				name="Messages"
				getComponent={() => MessagesScreen}
				options={{ title: title("Messages"), requireAuth: true }}
			/>
			<Screen name="Start" getComponent={() => HomeScreen} options={{ title: title("Home") }} />
			<Screen name="NotFound" getComponent={() => NotFoundScreen} options={{ title: title("Not Found") }} />
			<Screen name="Lists" component={ListsScreen} options={{ title: title("Lists"), requireAuth: true }} />
			<Screen
				name="Moderation"
				getComponent={() => ModerationScreen}
				options={{ title: title("Moderation"), requireAuth: true }}
			/>
			<Screen
				name="ModerationModlists"
				getComponent={() => ModerationModlistsScreen}
				options={{ title: title("Moderation Lists"), requireAuth: true }}
			/>
			<Screen
				name="ModerationMutedAccounts"
				getComponent={() => ModerationMutedAccounts}
				options={{ title: title("Muted Accounts"), requireAuth: true }}
			/>
			<Screen
				name="ModerationBlockedAccounts"
				getComponent={() => ModerationBlockedAccounts}
				options={{ title: title("Blocked Accounts"), requireAuth: true }}
			/>
			<Screen
				name="ModerationInteractionSettings"
				getComponent={() => ModerationInteractionSettings}
				options={{
					title: title("Post Interaction Settings"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="Settings"
				getComponent={() => SettingsScreen}
				options={{ title: title("Settings"), requireAuth: true }}
			/>
			<Screen
				name="LanguageSettings"
				getComponent={() => LanguageSettingsScreen}
				options={{ title: title("Language Settings"), requireAuth: true }}
			/>
			<Screen
				name="Profile"
				getComponent={() => ProfileScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={({ route }) => ({
				// 	title: bskyTitle(`@${route.params.name}`, numUnread),
				// })}
			/>
			<Screen
				name="ProfileFollowers"
				getComponent={() => ProfileFollowersScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("People following @${route.params.name}"),
				// })}
			/>
			<Screen
				name="ProfileFollows"
				getComponent={() => ProfileFollowsScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("People followed by @${route.params.name}"),
				// })}
			/>
			<Screen
				name="ProfileKnownFollowers"
				getComponent={() => ProfileKnownFollowersScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Followers of @${route.params.name} that you know"),
				// })}
			/>
			<Screen
				name="ProfileList"
				getComponent={() => ProfileListScreen}
				options={{ title: title("List"), requireAuth: true }}
			/>
			<Screen
				name="ProfileSearch"
				getComponent={() => ProfileSearchScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Search @${route.params.name}'s posts"),
				// })}
			/>
			<Screen
				name="PostThread"
				getComponent={() => PostThreadScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Post by @${route.params.name}"),
				// })}
			/>
			<Screen
				name="PostLikedBy"
				getComponent={() => PostLikedByScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Post by @${route.params.name}"),
				// })}
			/>
			<Screen
				name="PostRepostedBy"
				getComponent={() => PostRepostedByScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Post by @${route.params.name}"),
				// })}
			/>
			<Screen
				name="PostQuotes"
				getComponent={() => PostQuotesScreen}
				// TODO コンポーネント側でタイトルを設定
				// options={() => ({
				// 	title: title("Post by @${route.params.name}"),
				// })}
			/>
			<Screen name="ProfileFeed" getComponent={() => ProfileFeedScreen} options={{ title: title("Feed") }} />
			<Screen
				name="ProfileFeedLikedBy"
				getComponent={() => ProfileFeedLikedByScreen}
				options={{ title: title("Liked by") }}
			/>
			<Screen
				name="ProfileLabelerLikedBy"
				getComponent={() => ProfileLabelerLikedByScreen}
				options={{ title: title("Liked by") }}
			/>
			<Screen
				name="Debug"
				getComponent={() => Storybook}
				options={{ title: title("Storybook"), requireAuth: true }}
			/>
			<Screen
				name="DebugMod"
				getComponent={() => DebugModScreen}
				options={{ title: title("Moderation states"), requireAuth: true }}
			/>
			<Screen name="Log" getComponent={() => LogScreen} options={{ title: title("Log"), requireAuth: true }} />
			<Screen name="Support" getComponent={() => SupportScreen} options={{ title: title("Support") }} />
			<Screen
				name="PrivacyPolicy"
				getComponent={() => PrivacyPolicyScreen}
				options={{ title: title("Privacy Policy") }}
			/>
			<Screen
				name="TermsOfService"
				getComponent={() => TermsOfServiceScreen}
				options={{ title: title("Terms of Service") }}
			/>
			<Screen
				name="CommunityGuidelines"
				getComponent={() => CommunityGuidelinesScreen}
				options={{ title: title("Community Guidelines") }}
			/>
			<Screen
				name="CopyrightPolicy"
				getComponent={() => CopyrightPolicyScreen}
				options={{ title: title("Copyright Policy") }}
			/>
			<Screen
				name="AppPasswords"
				getComponent={() => AppPasswordsScreen}
				options={{ title: title("App Passwords"), requireAuth: true }}
			/>
			<Screen
				name="SavedFeeds"
				getComponent={() => SavedFeeds}
				options={{ title: title("Edit My Feeds"), requireAuth: true }}
			/>
			<Screen
				name="PreferencesFollowingFeed"
				getComponent={() => FollowingFeedPreferencesScreen}
				options={{
					title: title("Following Feed Preferences"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="PreferencesThreads"
				getComponent={() => ThreadPreferencesScreen}
				options={{ title: title("Threads Preferences"), requireAuth: true }}
			/>
			<Screen
				name="PreferencesExternalEmbeds"
				getComponent={() => ExternalMediaPreferencesScreen}
				options={{
					title: title("External Media Preferences"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="AccessibilitySettings"
				getComponent={() => AccessibilitySettingsScreen}
				options={{
					title: title("Accessibility Settings"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="AppearanceSettings"
				getComponent={() => AppearanceSettingsScreen}
				options={{
					title: title("Appearance"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="AccountSettings"
				getComponent={() => AccountSettingsScreen}
				options={{
					title: title("Account"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="PrivacyAndSecuritySettings"
				getComponent={() => PrivacyAndSecuritySettingsScreen}
				options={{
					title: title("Privacy and Security"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="ContentAndMediaSettings"
				getComponent={() => ContentAndMediaSettingsScreen}
				options={{
					title: title("Content and Media"),
					requireAuth: true,
				}}
			/>
			<Screen
				name="AboutSettings"
				getComponent={() => AboutSettingsScreen}
				options={{
					title: title("About"),
					requireAuth: true,
				}}
			/>
			<Screen name="Hashtag" getComponent={() => HashtagScreen} options={{ title: title("Hashtag") }} />
			<Screen name="Topic" getComponent={() => TopicScreen} options={{ title: title("Topic") }} />
			<Screen
				name="MessagesConversation"
				getComponent={() => MessagesConversationScreen}
				options={{ title: title("Chat"), requireAuth: true }}
			/>
			<Screen
				name="MessagesSettings"
				getComponent={() => MessagesSettingsScreen}
				options={{ title: title("Chat settings"), requireAuth: true }}
			/>
			<Screen
				name="MessagesInbox"
				getComponent={() => MessagesInboxScreen}
				options={{ title: title("Chat request inbox"), requireAuth: true }}
			/>
			<Screen
				name="NotificationSettings"
				getComponent={() => NotificationSettingsScreen}
				options={{ title: title("Notification settings"), requireAuth: true }}
			/>
			<Screen name="Feeds" getComponent={() => FeedsScreen} options={{ title: title("Feeds") }} />
			<Screen
				name="StarterPack"
				getComponent={() => StarterPackScreen}
				options={{ title: title("Starter Pack") }}
			/>
			<Screen
				name="StarterPackShort"
				getComponent={() => StarterPackScreenShort}
				options={{ title: title("Starter Pack") }}
			/>
			<Screen
				name="StarterPackWizard"
				getComponent={() => Wizard}
				options={{ title: title("Create a starter pack"), requireAuth: true }}
			/>
			<Screen
				name="StarterPackEdit"
				getComponent={() => Wizard}
				options={{ title: title("Edit your starter pack"), requireAuth: true }}
			/>
		</div>
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
