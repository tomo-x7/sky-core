import { useEffect, useState } from "react";
import { AppState } from "#/state/appstate";

export function useAppState() {
	const [state, setState] = useState(AppState.currentState);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (nextAppState) => {
			setState(nextAppState);
		});
		return () => sub.remove();
	}, []);

	return state;
}
