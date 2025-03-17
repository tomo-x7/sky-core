import type { AppBskyEmbedImages } from "@atproto/api";
import React from "react";

import { atoms as a, useBreakpoints } from "#/alf";
import { type HandleRef, useHandleRef } from "#/lib/hooks/useHandleRef";
import { PostEmbedViewContext } from "#/view/com/util/post-embeds/types";
import type { Dimensions } from "../../lightbox/ImageViewing/@types";
import { GalleryItem } from "./Gallery";

interface ImageLayoutGridProps {
	images: AppBskyEmbedImages.ViewImage[];
	onPress?: (index: number, containerRefs: HandleRef[], fetchedDims: (Dimensions | null)[]) => void;
	onLongPress?: (index: number) => void;
	onPressIn?: (index: number) => void;
	style?: React.CSSProperties;
	viewContext?: PostEmbedViewContext;
}

export function ImageLayoutGrid({ style, ...props }: ImageLayoutGridProps) {
	const { gtMobile } = useBreakpoints();
	const gap =
		props.viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia
			? gtMobile
				? a.gap_xs
				: a.gap_2xs
			: a.gap_xs;

	return (
		<div style={style}>
			<div
				style={{
					...gap,
					...a.rounded_md,
					...a.overflow_hidden,
				}}
			>
				<ImageLayoutGridInner {...props} gap={gap} />
			</div>
		</div>
	);
}

interface ImageLayoutGridInnerProps {
	images: AppBskyEmbedImages.ViewImage[];
	onPress?: (index: number, containerRefs: HandleRef[], fetchedDims: (Dimensions | null)[]) => void;
	onLongPress?: (index: number) => void;
	onPressIn?: (index: number) => void;
	viewContext?: PostEmbedViewContext;
	gap: { gap: number };
}

function ImageLayoutGridInner(props: ImageLayoutGridInnerProps) {
	const gap = props.gap;
	const count = props.images.length;

	const containerRef1 = useHandleRef();
	const containerRef2 = useHandleRef();
	const containerRef3 = useHandleRef();
	const containerRef4 = useHandleRef();
	const thumbDimsRef = React.useRef<(Dimensions | null)[]>([]);

	switch (count) {
		case 2: {
			const containerRefs = [containerRef1, containerRef2];
			return (
				<div
					style={{
						...a.flex_1,
						...a.flex_row,
						...gap,
					}}
				>
					<div
						style={{
							...a.flex_1,
							...{ aspectRatio: 1 },
						}}
					>
						<GalleryItem
							{...props}
							index={0}
							insetBorderStyle={noCorners(["topRight", "bottomRight"])}
							containerRefs={containerRefs}
							thumbDimsRef={thumbDimsRef}
						/>
					</div>
					<div
						style={{
							...a.flex_1,
							...{ aspectRatio: 1 },
						}}
					>
						<GalleryItem
							{...props}
							index={1}
							insetBorderStyle={noCorners(["topLeft", "bottomLeft"])}
							containerRefs={containerRefs}
							thumbDimsRef={thumbDimsRef}
						/>
					</div>
				</div>
			);
		}

		case 3: {
			const containerRefs = [containerRef1, containerRef2, containerRef3];
			return (
				<div
					style={{
						...a.flex_1,
						...a.flex_row,
						...gap,
					}}
				>
					<div
						style={{
							...a.flex_1,
							...{ aspectRatio: 1 },
						}}
					>
						<GalleryItem
							{...props}
							index={0}
							insetBorderStyle={noCorners(["topRight", "bottomRight"])}
							containerRefs={containerRefs}
							thumbDimsRef={thumbDimsRef}
						/>
					</div>
					<div
						style={{
							...a.flex_1,
							...{ aspectRatio: 1 },
							...gap,
						}}
					>
						<div style={a.flex_1}>
							<GalleryItem
								{...props}
								index={1}
								insetBorderStyle={noCorners(["topLeft", "bottomLeft", "bottomRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
						<div style={a.flex_1}>
							<GalleryItem
								{...props}
								index={2}
								insetBorderStyle={noCorners(["topLeft", "bottomLeft", "topRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
					</div>
				</div>
			);
		}

		case 4: {
			const containerRefs = [containerRef1, containerRef2, containerRef3, containerRef4];
			return (
				<>
					<div
						style={{
							...a.flex_row,
							...gap,
						}}
					>
						<div
							style={{
								...a.flex_1,
								...{ aspectRatio: 1.5 },
							}}
						>
							<GalleryItem
								{...props}
								index={0}
								insetBorderStyle={noCorners(["bottomLeft", "topRight", "bottomRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
						<div
							style={{
								...a.flex_1,
								...{ aspectRatio: 1.5 },
							}}
						>
							<GalleryItem
								{...props}
								index={1}
								insetBorderStyle={noCorners(["topLeft", "bottomLeft", "bottomRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
					</div>
					<div
						style={{
							...a.flex_row,
							...gap,
						}}
					>
						<div
							style={{
								...a.flex_1,
								...{ aspectRatio: 1.5 },
							}}
						>
							<GalleryItem
								{...props}
								index={2}
								insetBorderStyle={noCorners(["topLeft", "topRight", "bottomRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
						<div
							style={{
								...a.flex_1,
								...{ aspectRatio: 1.5 },
							}}
						>
							<GalleryItem
								{...props}
								index={3}
								insetBorderStyle={noCorners(["topLeft", "bottomLeft", "topRight"])}
								containerRefs={containerRefs}
								thumbDimsRef={thumbDimsRef}
							/>
						</div>
					</div>
				</>
			);
		}

		default:
			return null;
	}
}

function noCorners(corners: ("topLeft" | "topRight" | "bottomLeft" | "bottomRight")[]) {
	const styles: React.CSSProperties = {};
	if (corners.includes("topLeft")) {
		styles.borderTopLeftRadius = 0;
	}
	if (corners.includes("topRight")) {
		styles.borderTopRightRadius = 0;
	}
	if (corners.includes("bottomLeft")) {
		styles.borderBottomLeftRadius = 0;
	}
	if (corners.includes("bottomRight")) {
		styles.borderBottomRightRadius = 0;
	}
	return styles;
}
