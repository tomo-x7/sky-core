import type React from "react";

import { atoms as a, flatten, useTheme } from "#/alf";

export function KeyboardAccessory({ children }: { children: React.ReactNode }) {
	const t = useTheme();

	const style = flatten([
		a.flex_row,
		a.py_xs,
		a.pl_sm,
		a.pr_xl,
		a.align_center,
		a.border_t,
		t.atoms.border_contrast_medium,
		t.atoms.bg,
	]);

	// todo: when iPad support is added, it should also not use the KeyboardStickyView

	return <div style={style}>{children}</div>;
}
