import "./view/icons";

import React, { useState } from "react";
import { beginResolveGeolocation, ensureGeolocationResolved } from "./state/geolocation";
import { init as initPersistedState } from "./state/persisted";
import { Navigator } from "./Navigation";
import { Providers } from "./Providers";

/**
 * Begin geolocation ASAP
 */
beginResolveGeolocation();

export function App() {
	const [isReady, setReady] = useState(false);

	React.useEffect(() => {
		Promise.all([initPersistedState(), ensureGeolocationResolved()]).then(() => setReady(true));
	}, []);

	if (!isReady) {
		return null;
	}

	/*
	 * NOTE: only nothing here can depend on other data or session state, since
	 * that is set up in the InnerApp component above.
	 */
	return (
		<Providers>
			<Navigator />
		</Providers>
	);
}
