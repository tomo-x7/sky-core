import { Outlet, RouterProvider } from "react-router-dom";
import { useWebMediaQueries } from "./lib/hooks/useWebMediaQueries";
import { createRouter } from "./router";
import { Deactivated } from "./screens/Deactivated";
import { Onboarding } from "./screens/Onboarding";
import { SignupQueued } from "./screens/SignupQueued";
import { Takendown } from "./screens/Takendown";
import { useUnreadNotifications } from "./state/queries/notifications/unread";
import { useSession } from "./state/session";
import { useOnboardingState } from "./state/shell";
import { useLoggedOutView, useLoggedOutViewControls } from "./state/shell/logged-out";
import { LoggedOut } from "./view/com/auth/LoggedOut";
import { Shell } from "./view/shell";
import { BottomBarWeb } from "./view/shell/bottom-bar/BottomBarWeb";
import { DesktopLeftNav } from "./view/shell/desktop/LeftNav";
import { DesktopRightNav } from "./view/shell/desktop/RightNav";

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
	const onboardingState = useOnboardingState();
	const { showLoggedOut } = useLoggedOutView();
	const { setShowLoggedOut } = useLoggedOutViewControls();
	const { isMobile, isTabletOrMobile } = useWebMediaQueries();
	// Show the bottom bar if we have a session only on mobile web. If we don't have a session, we want to show it
	// on both tablet and mobile web so that we see the sign up CTA.
	const showBottomBar = hasSession ? isMobile : isTabletOrMobile;
	if (!hasSession) {
		return <LoggedOut />;
	}
	if (currentAccount?.signupQueued) {
		return <SignupQueued />;
	}
	if (currentAccount?.status === "takendown") {
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
