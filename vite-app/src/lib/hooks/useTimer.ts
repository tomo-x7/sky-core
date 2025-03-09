import * as React from "react";

/**
 * Helper hook to run persistent timers on views
 */
export function useTimer(time: number, handler: () => void) {
	const timer = React.useRef<undefined | number>(undefined);

	// function to restart the timer
	const reset = React.useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current);
		}
		timer.current = setTimeout(handler, time);
	}, [time, handler]);

	// function to cancel the timer
	const cancel = React.useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current);
			timer.current = undefined;
		}
	}, []);

	// start the timer immediately
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		reset();
	}, []);

	return [reset, cancel];
}
