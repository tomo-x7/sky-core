import React from "react";

import { useTheme } from "#/alf";
import { Fill } from "#/components/Fill";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { PlayButtonIcon } from "#/components/video/PlayButtonIcon";
import type { EmbedPlayerParams } from "#/lib/strings/embed-player";
import { useAutoplayDisabled } from "#/state/preferences";
import { useLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";
import { GifView, type GifViewHandle, type GifViewStateChangeEvent } from "./GifView";

function PlaybackControls({
	onPress,
	isPlaying,
	isLoaded,
}: {
	onPress: () => void;
	isPlaying: boolean;
	isLoaded: boolean;
}) {
	const t = useTheme();

	return (
		<button
			type="button"
			style={{
				position: "absolute",
				alignItems: "center",
				justifyContent: "center",
				...(!isLoaded && { border: "1px solid black" }),
				...t.atoms.border_contrast_medium,
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: "100%",
				height: "100%",

				...{
					zIndex: 2,
					backgroundColor: !isLoaded ? t.atoms.bg_contrast_25.backgroundColor : undefined,
				},
			}}
			onClick={onPress}
		>
			{!isLoaded ? (
				<div>
					<div
						style={{
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Loader size="xl" />
					</div>
				</div>
			) : !isPlaying ? (
				<PlayButtonIcon />
			) : undefined}
		</button>
	);
}

export function GifEmbed({
	params,
	thumb,
	altText,
	isPreferredAltText,
	hideAlt,
	style = { width: "100%" },
}: {
	params: EmbedPlayerParams;
	thumb: string | undefined;
	altText: string;
	isPreferredAltText: boolean;
	hideAlt?: boolean;
	style?: React.CSSProperties;
}) {
	const t = useTheme();
	const autoplayDisabled = useAutoplayDisabled();

	const playerRef: React.Ref<GifViewHandle> = React.useRef(null);

	const [playerState, setPlayerState] = React.useState<{
		isPlaying: boolean;
		isLoaded: boolean;
	}>({
		isPlaying: !autoplayDisabled,
		isLoaded: false,
	});

	const onPlayerStateChange = React.useCallback((e: GifViewStateChangeEvent) => {
		setPlayerState(e.nativeEvent);
	}, []);

	const onPress = React.useCallback(() => {
		playerRef.current?.toggleAsync();
	}, []);

	return (
		<div
			style={{
				borderRadius: 12,
				overflow: "hidden",
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.border_contrast_low,
				...{ aspectRatio: params.dimensions!.width / params.dimensions!.height },
				...style,
			}}
		>
			<div
				style={{
					position: "absolute",

					.../*
					 * Aspect ratio was being clipped weirdly on web -esb
					 */
					{
						top: -2,
						bottom: -2,
						left: -2,
						right: -2,
					},
				}}
			>
				<PlaybackControls onPress={onPress} isPlaying={playerState.isPlaying} isLoaded={playerState.isLoaded} />
				<GifView
					source={params.playerUri}
					placeholderSource={thumb}
					style={{ flex: 1 }}
					autoplay={!autoplayDisabled}
					onPlayerStateChange={onPlayerStateChange}
					ref={playerRef}
					accessibilityHint={"Animated GIF"}
					accessibilityLabel={altText}
				/>
				{!playerState.isPlaying && (
					<Fill
						style={{
							...(t.name === "light" ? t.atoms.bg_contrast_975 : t.atoms.bg),

							...{
								opacity: 0.3,
							},
						}}
					/>
				)}
				{!hideAlt && isPreferredAltText && <AltText text={altText} />}
			</div>
		</div>
	);
}

function AltText({ text }: { text: string }) {
	const control = Prompt.usePromptControl();
	const largeAltBadge = useLargeAltBadgeEnabled();

	return (
		<>
			<button
				type="button"
				// TODO
				// hitSlop={HITSLOP_20}
				onClick={control.open}
				style={styles.altContainer}
			>
				<Text
					style={{
						...styles.alt,
						...(largeAltBadge && { fontSize: 12 }),
					}}
				>
					ALT
				</Text>
			</button>
			<Prompt.Outer control={control}>
				<Prompt.TitleText>Alt Text</Prompt.TitleText>
				<Prompt.DescriptionText selectable>{text}</Prompt.DescriptionText>
				<Prompt.Actions>
					<Prompt.Action onPress={() => control.close()} cta={"Close"} color="secondary" />
				</Prompt.Actions>
			</Prompt.Outer>
		</>
	);
}

const styles = {
	altContainer: {
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		borderRadius: 6,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 6,
		paddingBottom: 6,
		position: "absolute",
		// Related to margin/gap hack. This keeps the alt label in the same position
		// on all platforms
		right: 8,
		bottom: 8,
		zIndex: 2,
	},
	alt: {
		color: "white",
		fontSize: 10,
		fontWeight: "600",
	},
} satisfies Record<string, React.CSSProperties>;
