type state = "active" | "inactive";
interface AppState {
	currentState: state;
	addEventListener(type: "change", handler: (state: state) => void): AppStateSubscription;
}
interface AppStateSubscription {
	remove: () => void;
}

export const AppState: AppState = {
	currentState: document.hidden ? "inactive" : "active",
	addEventListener(type, handler) {
		if (type !== "change") throw new Error(`unsupported event type:${type}`);
		const handlerWrapper = () => {
			const state: state = document.hidden ? "inactive" : "active";
			if (state !== AppState.currentState) {
				AppState.currentState = state;
				handler(state);
			}
		};
		document.addEventListener("visibilitychange", handlerWrapper);
		return { remove: () => document.removeEventListener("visibilitychange", handlerWrapper) };
	},
};
