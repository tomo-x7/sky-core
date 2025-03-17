import type React from "react";

import { type ViewStyleProp, atoms as a } from "#/alf";

export function Fill({ children, style }: { children?: React.ReactNode } & ViewStyleProp) {
	return (
		<div
			style={{
				...a.absolute,
				...a.inset_0,
				...style,
			}}
		>
			{children}
		</div>
	);
}
