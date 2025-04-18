import React from "react";

import * as persisted from "#/state/persisted";

type StateContext = boolean;
type SetContext = (v: boolean) => void;

const stateContext = React.createContext<StateContext>(Boolean(persisted.defaults.subtitlesEnabled));
const setContext = React.createContext<SetContext>((_: boolean) => {});

export function Provider({ children }: { children: React.ReactNode }) {
	const [state, setState] = React.useState(Boolean(persisted.get("subtitlesEnabled")));

	const setStateWrapped = React.useCallback((subtitlesEnabled: persisted.Schema["subtitlesEnabled"]) => {
		setState(Boolean(subtitlesEnabled));
		persisted.write("subtitlesEnabled", subtitlesEnabled);
	}, []);

	React.useEffect(() => {
		return persisted.onUpdate("subtitlesEnabled", (nextSubtitlesEnabled) => {
			setState(Boolean(nextSubtitlesEnabled));
		});
	}, []);

	return (
		<stateContext.Provider value={state}>
			<setContext.Provider value={setStateWrapped}>{children}</setContext.Provider>
		</stateContext.Provider>
	);
}

export const useSubtitlesEnabled = () => React.useContext(stateContext);
export const useSetSubtitlesEnabled = () => React.useContext(setContext);
