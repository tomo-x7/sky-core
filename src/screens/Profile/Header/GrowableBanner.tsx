import type React from "react";

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
				width: "100%",
				height: "100%",
			}}
		>
			{children}
			{backButton}
		</div>
	);
}

// stayed true for at least `delay` ms before returning to false
