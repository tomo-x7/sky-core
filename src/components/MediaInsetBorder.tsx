import type React from "react";

import { type ViewStyleProp, useTheme } from "#/alf";
import { Fill } from "#/components/Fill";

/**
 * Applies and thin border within a bounding box. Used to contrast media from
 * bg of the container.
 */
export function MediaInsetBorder({
	children,
	style,
	opaque,
}: {
	children?: React.ReactNode;
	/**
	 * Used where this border needs to match adjacent borders, such as in
	 * external link previews
	 */
	opaque?: boolean;
} & ViewStyleProp) {
	const t = useTheme();
	const isLight = t.name === "light";
	return (
		<Fill
			style={{
				borderRadius: 12,
				border: "1px solid black",
				borderWidth: 1,
				...(opaque
					? t.atoms.border_contrast_low
					: { ...(isLight ? t.atoms.border_contrast_low : t.atoms.border_contrast_high), opacity: 0.6 }),
				pointerEvents: "none",
				...style,
			}}
		>
			{children}
		</Fill>
	);
}
