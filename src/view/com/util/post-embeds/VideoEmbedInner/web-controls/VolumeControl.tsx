import type React from "react";
import { useCallback } from "react";

import { atoms as a } from "#/alf";
import { Mute_Stroke2_Corner0_Rounded as MuteIcon } from "#/components/icons/Mute";
import { SpeakerVolumeFull_Stroke2_Corner0_Rounded as UnmuteIcon } from "#/components/icons/Speaker";
import { isSafari, isTouchDevice } from "#/lib/browser";
import { useVideoVolumeState } from "../../VideoVolumeContext";
import { ControlButton } from "./ControlButton";

export function VolumeControl({
	muted,
	changeMuted,
	hovered,
	onHover,
	onEndHover,
	drawFocus,
}: {
	muted: boolean;
	changeMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
	hovered: boolean;
	onHover: () => void;
	onEndHover: () => void;
	drawFocus: () => void;
}) {
	const [volume, setVolume] = useVideoVolumeState();

	const onVolumeChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			drawFocus();
			const vol = sliderVolumeToVideoVolume(Number(evt.target.value));
			setVolume(vol);
			changeMuted(vol === 0);
		},
		[setVolume, drawFocus, changeMuted],
	);

	const sliderVolume = muted ? 0 : videoVolumeToSliderVolume(volume);

	const isZeroVolume = volume === 0;
	const onPressMute = useCallback(() => {
		drawFocus();
		if (isZeroVolume) {
			setVolume(1);
			changeMuted(false);
		} else {
			changeMuted((prevMuted) => !prevMuted);
		}
	}, [drawFocus, setVolume, isZeroVolume, changeMuted]);

	return (
		<div onPointerEnter={onHover} onPointerLeave={onEndHover} style={{ ...a.relative }}>
			{hovered && !isTouchDevice && (
				<div
					// Animated.View
					// entering={FadeIn.duration(100)}
					// exiting={FadeOut.duration(100)}
					style={{
						position: "absolute",
						width: "100%",
						height: 100,
						bottom: "100%",
					}}
				>
					<div
						style={{
							flex: 1,
							marginBottom: 4,
							paddingLeft: 2,
							paddingRight: 2,
							paddingTop: 4,
							paddingBottom: 4,
							...{ backgroundColor: "rgba(0, 0, 0, 0.6)" },
							borderRadius: 4,
							alignItems: "center",
						}}
					>
						<input
							type="range"
							min={0}
							max={100}
							value={sliderVolume}
							aria-label={"Volume"}
							style={
								// Ridiculous safari hack for old version of safari. Fixed in sonoma beta -h
								isSafari ? { height: 92, minHeight: "100%" } : { height: "100%" }
							}
							onChange={onVolumeChange}
							// @ts-expect-error for old versions of firefox, and then re-using it for targeting the CSS -sfn
							orient="vertical"
						/>
					</div>
				</div>
			)}
			<ControlButton
				active={muted || volume === 0}
				activeLabel={"Unmute"}
				inactiveLabel={"Mute"}
				activeIcon={MuteIcon}
				inactiveIcon={UnmuteIcon}
				onPress={onPressMute}
			/>
		</div>
	);
}

function sliderVolumeToVideoVolume(value: number) {
	return (value / 100) ** 4;
}

function videoVolumeToSliderVolume(value: number) {
	return Math.round(value ** (1 / 4) * 100);
}
