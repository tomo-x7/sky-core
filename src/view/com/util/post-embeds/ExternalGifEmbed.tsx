import type { AppBskyEmbedExternal } from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { useDialogControl } from "#/components/Dialog";
import { Fill } from "#/components/Fill";
import { EmbedConsentDialog } from "#/components/dialogs/EmbedConsent";
import { PlayButtonIcon } from "#/components/video/PlayButtonIcon";
import { prefetch } from "#/lib/prefetchImage";
import type { EmbedPlayerParams } from "#/lib/strings/embed-player";
import { useExternalEmbedsPrefs } from "#/state/preferences";

export function ExternalGifEmbed({
	link,
	params,
}: {
	link: AppBskyEmbedExternal.ViewExternal;
	params: EmbedPlayerParams;
}) {
	const t = useTheme();
	const externalEmbedsPrefs = useExternalEmbedsPrefs();
	const consentDialogControl = useDialogControl();

	// Tracking if the placer has been activated
	const [isPlayerActive, setIsPlayerActive] = React.useState(false);
	// Tracking whether the gif has been loaded yet
	const [isPrefetched, setIsPrefetched] = React.useState(false);
	// Tracking whether the image is animating
	const [isAnimating, setIsAnimating] = React.useState(true);

	// Used for controlling animation
	const imageRef = React.useRef<HTMLImageElement>(null);

	const load = React.useCallback(() => {
		setIsPlayerActive(true);
		prefetch(params.playerUri).then(() => {
			// Replace the image once it's fetched
			setIsPrefetched(true);
		});
	}, [params.playerUri]);

	const onPlayPress = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// Don't propagate on web
			event.preventDefault();

			// Show consent if this is the first load
			if (externalEmbedsPrefs?.[params.source] === undefined) {
				consentDialogControl.open();
				return;
			}
			// If the player isn't active, we want to activate it and prefetch the gif
			if (!isPlayerActive) {
				load();
				return;
			}
			// Control animation on native
			setIsAnimating((prev) => !prev);
		},
		[consentDialogControl, externalEmbedsPrefs, isPlayerActive, load, params.source],
	);

	return (
		<>
			<EmbedConsentDialog control={consentDialogControl} source={params.source} onAccept={load} />
			<button
				type="button"
				style={{
					...{ height: 300 },
					width: "100%",
					overflow: "hidden",

					...{
						borderBottomLeftRadius: 0,
						borderBottomRightRadius: 0,
					},
				}}
				onClick={onPlayPress}
			>
				<img
					src={!isPrefetched || !isAnimating ? link.thumb : params.playerUri} // Web uses the thumb to control playback
					style={{ flex: 1, objectFit: "contain" }}
					ref={imageRef}
					// autoplay={isAnimating}
				/>

				{(!isPrefetched || !isAnimating) && (
					<Fill
						style={{
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Fill
							style={{
								...(t.name === "light" ? t.atoms.bg_contrast_975 : t.atoms.bg),

								...{
									opacity: 0.3,
								},
							}}
						/>

						{!isAnimating || !isPlayerActive ? ( // Play button when not animating or not active
							<PlayButtonIcon />
						) : (
							// Activity indicator while gif loads
							<ActivityIndicator size="large" color="white" />
						)}
					</Fill>
				)}
			</button>
		</>
	);
}
