import { useLocation, useMatch } from "react-router-dom";
import { routes } from "#/routes";

export function useNavigationTabState(handle: string) {
	const location = useLocation();
	const isAtHome = useMatch(routes.Home) != null;
	const isAtSearch = useMatch(routes.Search) != null;
	const isAtNotifications = useMatch(routes.Notifications) != null;
	const isAtMyProfile = useMatch(routes.Profile) != null && location.pathname.includes(handle);
	const isAtMessages = useMatch(routes.Messages) != null;
	return {
		isAtHome,
		isAtSearch,
		isAtNotifications,
		isAtMyProfile,
		isAtMessages,
	};
}
