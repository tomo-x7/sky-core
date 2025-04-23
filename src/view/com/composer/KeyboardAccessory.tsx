import type React from "react";

import { useTheme } from "#/alf";

export function KeyboardAccessory({ children }: { children: React.ReactNode }) {
	const t = useTheme();

	const style = {
		flexDirection: "row",
		padding: "4px 20px 4px 8px",
		alignItems: "center",
		borderTop: "1px solid",
		...t.atoms.border_contrast_medium,
		...t.atoms.bg,
	} satisfies React.CSSProperties;

	// todo: when iPad support is added, it should also not use the KeyboardStickyView

	return <div style={style}>{children}</div>;
}
