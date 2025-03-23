import { useLocation, } from "react-router-dom";
import { routes } from "#/routes";

export function useNavigationTabState(handle: string) {
	const location = useLocation();
	const isAtHome = location.pathname===(routes.Home);
	const isAtSearch = location.pathname===(routes.Search) != null;
	const isAtNotifications = location.pathname===(routes.Notifications) != null;
	const isAtMyProfile = location.pathname.startsWith(routes.Profile.split(":")[0]) != null && location.pathname.includes(handle);
	const isAtMessages = location.pathname===(routes.Messages) != null;
	return {
		isAtHome,
		isAtSearch,
		isAtNotifications,
		isAtMyProfile,
		isAtMessages,
	};
}
