import { useCallback, useRef } from "react";
import { Keyboard } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { GifSelectDialog } from "#/components/dialogs/GifSelect";
import { GifSquare_Stroke2_Corner0_Rounded as GifIcon } from "#/components/icons/Gif";
import type { Gif } from "#/state/queries/tenor";

type Props = {
	onClose?: () => void;
	onSelectGif: (gif: Gif) => void;
	disabled?: boolean;
};

export function SelectGifBtn({ onClose, onSelectGif, disabled }: Props) {
	const ref = useRef<{ open: () => void }>(null);
	const t = useTheme();

	const onPressSelectGif = useCallback(async () => {
		logEvent("composer:gif:open", {});
		Keyboard.dismiss();
		ref.current?.open();
	}, []);

	return (
		<>
			<Button
				testID="openGifBtn"
				onPress={onPressSelectGif}
				label={"Select GIF"}
				accessibilityHint={"Opens GIF select dialog"}
				style={a.p_sm}
				variant="ghost"
				shape="round"
				color="primary"
				disabled={disabled}
			>
				<GifIcon size="lg" style={disabled && t.atoms.text_contrast_low} />
			</Button>

			<GifSelectDialog controlRef={ref} onClose={onClose} onSelectGif={onSelectGif} />
		</>
	);
}
