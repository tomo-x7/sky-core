import type React from "react";

import { atoms as a } from "#/alf";

export function GrowableBanner({
	backButton,
	children,
}: {
	backButton?: React.ReactNode;
	children: React.ReactNode;
}) {
	// plain non-growable mode for Android/Web

	return (
		<div
			style={{
				...a.w_full,
				...a.h_full,
			}}
		>
			{children}
			{backButton}
		</div>
	);
}

// stayed true for at least `delay` ms before returning to false
