import type React from "react";

import type { ViewStyleProp } from "#/alf";

export function Fill({ children, style }: { children?: React.ReactNode } & ViewStyleProp) {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				...style,
			}}
		>
			{children}
		</div>
	);
}
