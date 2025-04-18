import type React from "react";

/**
 * This utility function captures events and stops
 * them from propagating upwards.
 */
export function EventStopper({
	children,
	style,
	onKeyDown = true,
}: React.PropsWithChildren<{
	style?: React.CSSProperties;
	/**
	 * Default `true`. Set to `false` to allow onKeyDown to propagate
	 */
	onKeyDown?: boolean;
}>) {
	const stop = <T extends { stopPropagation: () => void }>(e: T) => {
		e.stopPropagation();
	};
	return (
		<div
			onTouchStart={stop}
			onTouchEnd={stop}
			onMouseDown={stop}
			onClick={stop}
			onKeyDown={onKeyDown ? stop : undefined}
			style={style}
		>
			{children}
		</div>
	);
}
