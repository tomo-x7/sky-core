import React from "react";

export function useDelayedLoading(delay: number, initialState = true) {
	const [isLoading, setIsLoading] = React.useState(initialState);

	React.useEffect(() => {
		let timeout: number;
		// on initial load, show a loading spinner for a hot sec to prevent flash
		if (isLoading) timeout = setTimeout(() => setIsLoading(false), delay);

		return () => (timeout ? clearTimeout(timeout) : undefined);
	}, [isLoading, delay]);

	return isLoading;
}
