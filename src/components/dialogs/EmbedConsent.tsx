import { useCallback } from "react";

import { useBreakpoints, useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { type EmbedPlayerSource, embedPlayerSources, externalEmbedLabels } from "#/lib/strings/embed-player";
import { useSetExternalEmbedPref } from "#/state/preferences";
import { Button, ButtonText } from "../Button";
import { Text } from "../Typography";

export function EmbedConsentDialog({
	control,
	source,
	onAccept,
}: {
	control: Dialog.DialogControlProps;
	source: EmbedPlayerSource;
	onAccept: () => void;
}) {
	const t = useTheme();
	const setExternalEmbedPref = useSetExternalEmbedPref();
	const { gtMobile } = useBreakpoints();

	const onShowAllPress = useCallback(() => {
		for (const key of embedPlayerSources) {
			setExternalEmbedPref(key, "show");
		}
		onAccept();
		control.close();
	}, [control, onAccept, setExternalEmbedPref]);

	const onShowPress = useCallback(() => {
		setExternalEmbedPref(source, "show");
		onAccept();
		control.close();
	}, [control, onAccept, setExternalEmbedPref, source]);

	const onHidePress = useCallback(() => {
		setExternalEmbedPref(source, "hide");
		control.close();
	}, [control, setExternalEmbedPref, source]);

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner
				label="External Media"
				style={gtMobile ? { width: "auto", maxWidth: 400 } : { width: "100%" }}
			>
				<div style={{ gap: 8 }}>
					<Text
						style={{
							fontSize: 22,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						External Media
					</Text>

					<div
						style={{
							marginTop: 8,
							marginBottom: 24,
							gap: 16,
						}}
					>
						<Text>
							This content is hosted by {externalEmbedLabels[source]}. Do you want to enable external
							media?
						</Text>

						<Text style={t.atoms.text_contrast_medium}>
							External media may allow websites to collect information about you and your device. No
							information is sent or requested until you press the "play" button.
						</Text>
					</div>
				</div>
				<div style={{ gap: 12 }}>
					<Button
						style={{ flex: gtMobile ? 1 : undefined }}
						label="Enable external media"
						onPress={onShowAllPress}
						// onAccessibilityEscape={control.close}
						color="primary"
						size="large"
						variant="solid"
					>
						<ButtonText>Enable external media</ButtonText>
					</Button>
					<Button
						style={{ flex: gtMobile ? 1 : undefined }}
						label="Enable this source only"
						onPress={onShowPress}
						// onAccessibilityEscape={control.close}
						color="secondary"
						size="large"
						variant="solid"
					>
						<ButtonText>Enable {externalEmbedLabels[source]} only</ButtonText>
					</Button>
					<Button
						label="No thanks"
						// onAccessibilityEscape={control.close}
						onPress={onHidePress}
						color="secondary"
						size="large"
						variant="ghost"
					>
						<ButtonText>No thanks</ButtonText>
					</Button>
				</div>
				<Dialog.Close />
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}
