import { View } from "react-native";

import { type ViewStyleProp, atoms as a, flatten, useTheme } from "#/alf";

export function Divider({ style }: ViewStyleProp) {
	const t = useTheme();

	return <div style={{ ...a.w_full, ...a.border_t, ...t.atoms.border_contrast_low, ...style }} />;
}
