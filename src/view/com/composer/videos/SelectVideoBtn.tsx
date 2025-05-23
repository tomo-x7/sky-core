import { useCallback } from "react";

import { useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { VideoClip_Stroke2_Corner0_Rounded as VideoClipIcon } from "#/components/icons/VideoClip";
import { Keyboard } from "#/lib/Keyboard";
import { SUPPORTED_MIME_TYPES, type SupportedMimeTypes } from "#/lib/constants";
import { BSKY_SERVICE } from "#/lib/constants";
import { useVideoLibraryPermission } from "#/lib/hooks/usePermissions";
import { getHostnameFromUrl } from "#/lib/strings/url-helpers";
import { useSession } from "#/state/session";
import type { ImagePickerAsset } from "#/temp";
import { pickVideo } from "./pickVideo";

const VIDEO_MAX_DURATION = 60 * 1000; // 60s in milliseconds

type Props = {
	onSelectVideo: (video: ImagePickerAsset) => void;
	disabled?: boolean;
	setError: (error: string) => void;
};

export function SelectVideoBtn({ onSelectVideo, disabled, setError }: Props) {
	const t = useTheme();
	const { requestVideoAccessIfNeeded } = useVideoLibraryPermission();
	const control = Prompt.usePromptControl();
	const { currentAccount } = useSession();

	const onPressSelectVideo = useCallback(async () => {
		if (
			currentAccount &&
			!currentAccount.emailConfirmed &&
			getHostnameFromUrl(currentAccount.service) === getHostnameFromUrl(BSKY_SERVICE)
		) {
			Keyboard.dismiss();
			control.open();
		} else {
			const response = await pickVideo();
			if (response.assets && response.assets.length > 0) {
				const asset = response.assets[0];
				try {
					// asset.duration is null for gifs (see the TODO in pickVideo.web.ts)
					if (asset.duration && asset.duration > VIDEO_MAX_DURATION) {
						throw Error("Videos must be less than 60 seconds long");
					}
					// compression step on native converts to mp4, so no need to check there
					if (!SUPPORTED_MIME_TYPES.includes(asset.mimeType as SupportedMimeTypes)) {
						throw Error(`Unsupported video type: ${asset.mimeType}`);
					}

					onSelectVideo(asset);
				} catch (err) {
					if (err instanceof Error) {
						setError(err.message);
					} else {
						setError("An error occurred while selecting the video");
					}
				}
			}
		}
	}, [currentAccount, control, setError, onSelectVideo]);

	return (
		<>
			<Button
				onPress={onPressSelectVideo}
				label={"Select video"}
				style={{ padding: 8 }}
				variant="ghost"
				shape="round"
				color="primary"
				disabled={disabled}
			>
				<VideoClipIcon size="lg" style={disabled ? t.atoms.text_contrast_low : undefined} />
			</Button>
			<VerifyEmailPrompt control={control} />
		</>
	);
}

function VerifyEmailPrompt({ control }: { control: Prompt.PromptControlProps }) {
	const verifyEmailDialogControl = useDialogControl();

	return (
		<>
			<Prompt.Basic
				control={control}
				title={"Verified email required"}
				description={"To upload videos to Bluesky, you must first verify your email."}
				confirmButtonCta={"Verify now"}
				confirmButtonColor="primary"
				onConfirm={() => {
					verifyEmailDialogControl.open();
				}}
			/>
			<VerifyEmailDialog control={verifyEmailDialogControl} />
		</>
	);
}
