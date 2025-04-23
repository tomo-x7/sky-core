import type { AppBskyEmbedImages } from "@atproto/api";
import type React from "react";

import type { RefObject } from "react";
import { useTheme } from "#/alf";
import { MediaInsetBorder } from "#/components/MediaInsetBorder";
import { Text } from "#/components/Typography";
import type { Dimensions } from "#/lib/media/types";
import { useLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";
import { PostEmbedViewContext } from "#/view/com/util/post-embeds/types";

type EventFunction = (index: number) => void;

interface Props {
	images: AppBskyEmbedImages.ViewImage[];
	index: number;
	onPress?: (index: number, containerRefs: RefObject<HTMLDivElement>[], fetchedDims: (Dimensions | null)[]) => void;
	onLongPress?: EventFunction;
	onPressIn?: EventFunction;
	imageStyle?: React.CSSProperties;
	viewContext?: PostEmbedViewContext;
	insetBorderStyle?: React.CSSProperties;
	containerRefs: RefObject<HTMLDivElement>[];
	thumbDimsRef: React.MutableRefObject<(Dimensions | null)[]>;
}

export function GalleryItem({
	images,
	index,
	imageStyle,
	onPress,
	onPressIn,
	onLongPress,
	viewContext,
	insetBorderStyle,
	containerRefs,
	thumbDimsRef,
}: Props) {
	const t = useTheme();
	const largeAltBadge = useLargeAltBadgeEnabled();
	const image = images[index];
	const hasAlt = !!image.alt;
	const hideBadges = viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia;
	return (
		<div style={{ flex: 1 }} ref={containerRefs[index]}>
			<button
				type="button"
				onClick={onPress ? () => onPress(index, containerRefs, thumbDimsRef.current.slice()) : undefined}
				onMouseDown={onPressIn ? () => onPressIn(index) : undefined}
				// onLongPress={onLongPress ? () => onLongPress(index) : undefined}
				style={{
					flex: 1,
					overflow: "hidden",
					...t.atoms.bg_contrast_25,
					...imageStyle,
				}}
			>
				<img
					src={image.thumb}
					style={{
						flex: 1,
						objectPosition: "left 50% top 50%",
						width: "100%",
						height: "100%",
						position: "absolute",
						left: "0px",
						top: "0px",
						objectFit: "cover",
						transitionDuration: "0ms",
						transitionTimingFunction: "linear",
					}}
					onLoad={(e) => {
						thumbDimsRef.current[index] = {
							width: e.currentTarget.width,
							height: e.currentTarget.height,
						};
					}}
				/>
				<MediaInsetBorder style={insetBorderStyle} />
			</button>
			{hasAlt && !hideBadges ? (
				<div
					style={{
						position: "absolute",
						flexDirection: "row",
						alignItems: "center",
						borderRadius: 4,
						...t.atoms.bg_contrast_25,

						...{
							gap: 3,
							padding: 3,
							bottom: 4,
							right: 4,
							opacity: 0.8,
						},

						...(largeAltBadge && { gap: 4, padding: 5 }),
					}}
				>
					<Text
						style={{
							fontWeight: "800",
							...(largeAltBadge ? { fontSize: 12 } : { fontSize: 8 }),
						}}
					>
						ALT
					</Text>
				</div>
			) : null}
		</div>
	);
}
