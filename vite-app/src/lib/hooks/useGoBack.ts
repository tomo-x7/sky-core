import { useNavigate } from "react-router-dom";

export function useGoBack(onGoBack?: () => unknown) {
	const navigate = useNavigate();
	return () => {
		onGoBack?.();
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
			// Checking the state for routes ensures that web doesn't encounter errors while going back
			// if (navigation.getState()?.routes) {
			// 	navigation.dispatch(StackActions.push(...router.matchPath("/")));
			// } else {
			navigate("/");
			// navigation.dispatch(StackActions.popToTop());
			// }
		}
	};
}
