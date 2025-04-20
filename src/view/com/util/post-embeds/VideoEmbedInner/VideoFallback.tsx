import type React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text as TypoText } from "#/components/Typography";

export function Container({ children }: { children: React.ReactNode }) {
	const t = useTheme();
	return (
		<div
			style={{
				flex: 1,
				...t.atoms.bg_contrast_25,
				justifyContent: "center",
				alignItems: "center",
				paddingLeft: 16,
				paddingRight: 16,
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.border_contrast_low,
				borderRadius: 8,
				gap: 16,
			}}
		>
			{children}
		</div>
	);
}

export function Text({ children }: { children: React.ReactNode }) {
	const t = useTheme();
	return (
		<TypoText
			style={{
				textAlign: "center",
				...t.atoms.text_contrast_high,
				fontSize: 16,
				letterSpacing: 0,
				lineHeight: 1.3,
				...{ maxWidth: 300 },
			}}
		>
			{children}
		</TypoText>
	);
}

export function RetryButton({ onPress }: { onPress: () => void }) {
	return (
		<Button onPress={onPress} size="small" color="secondary_inverted" variant="solid" label={"Retry"}>
			<ButtonText>Retry</ButtonText>
		</Button>
	);
}
