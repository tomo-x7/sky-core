import type React from "react";

import { atoms as a, useTheme } from "#/alf";
import { MAX_ALT_TEXT } from "#/lib/constants";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";

export function AltTextCounterWrapper({
	altText,
	children,
}: {
	altText?: string;
	children: React.ReactNode;
}) {
	const t = useTheme();
	return (
		<div style={{ ...a.flex_row }}>
			<CharProgress
				style={{
					...a.flex_col_reverse,
					alignItems: "center",
					marginRight: 4,
					...{ minWidth: 50, gap: 1 },
				}}
				textStyle={{ marginRight: 0, fontSize: 14, letterSpacing: 0, ...t.atoms.text_contrast_medium }}
				size={26}
				count={altText?.length || 0}
				max={MAX_ALT_TEXT}
			/>
			{children}
		</div>
	);
}
