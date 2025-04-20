import { PlayButtonIcon } from "#/components/video/PlayButtonIcon";
import type { CompressedVideo } from "#/lib/media/video/types";
import { clamp } from "#/lib/numbers";
import { useAutoplayDisabled } from "#/state/preferences";
import type { ImagePickerAsset } from "#/temp";
import { ExternalEmbedRemoveBtn } from "#/view/com/composer/ExternalEmbedRemoveBtn";
import * as Toast from "#/view/com/util/Toast";

export function VideoPreview({
	asset,
	video,

	clear,
}: {
	asset: ImagePickerAsset;
	video: CompressedVideo;

	clear: () => void;
}) {
	// TODO: figure out how to pause a GIF for reduced motion
	// it's not possible using an img tag -sfn
	const autoplayDisabled = useAutoplayDisabled();

	let aspectRatio = asset.width / asset.height;

	if (Number.isNaN(aspectRatio)) {
		aspectRatio = 16 / 9;
	}

	aspectRatio = clamp(aspectRatio, 1 / 1, 3 / 1);

	return (
		<div
			style={{
				width: "100%",
				borderRadius: 8,
				...{ aspectRatio },
				overflow: "hidden",
				...{ backgroundColor: "black" },
				position: "relative",
			}}
		>
			<ExternalEmbedRemoveBtn onRemove={clear} />
			{video.mimeType === "image/gif" ? (
				<img src={video.uri} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="GIF" />
			) : (
				<>
					<video
						src={video.uri}
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
						autoPlay={!autoplayDisabled}
						loop
						muted
						playsInline
						onError={(err) => {
							console.error("Error loading video", err);
							Toast.show("Could not process your video", "xmark");
							clear();
						}}
					/>
					{autoplayDisabled && (
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<PlayButtonIcon />
						</div>
					)}
				</>
			)}
		</div>
	);
}
