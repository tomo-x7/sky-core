import type { Action, State } from "./reducer";

type Reducer = (state: State, action: Action) => State;

export function wrapSessionReducerForLogging(reducer: Reducer): Reducer {
	return function loggingWrapper(prevState: State, action: Action): State {
		const nextState = reducer(prevState, action);
		console.debug("sessionDebugLog", { type: "reducer:call", prevState, action, nextState });
		return nextState;
	};
}
