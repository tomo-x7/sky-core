import type { AppBskyEmbedImages } from "@atproto/api";
import React, { type RefObject, useRef } from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { MediaInsetBorder } from "#/components/MediaInsetBorder";
import { Text } from "#/components/Typography";
import { ArrowsDiagonalOut_Stroke2_Corner0_Rounded as Fullscreen } from "#/components/icons/ArrowsDiagonal";
import type { Dimensions } from "#/lib/media/types";
import { useLargeAltBadgeEnabled } from "#/state/preferences/large-alt-badge";

export function ConstrainedImage({
	aspectRatio,
	fullBleed,
	children,
}: {
	aspectRatio: number;
	fullBleed?: boolean;
	children: React.ReactNode;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	/**
	 * Computed as a % value to apply as `paddingTop`, this basically controls
	 * the height of the image.
	 */
	const outerAspectRatio = React.useMemo(() => {
		const ratio = !gtMobile
			? Math.min(1 / aspectRatio, 16 / 9) // 9:16 bounding box
			: Math.min(1 / aspectRatio, 1); // 1:1 bounding box
		return `${ratio * 100}%`;
	}, [aspectRatio, gtMobile]);

	return (
		<div style={{ width:"100%" }}>
			<div
				style={{
					overflow: "hidden",
					...{ paddingTop: outerAspectRatio },
				}}
			>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						flexDirection: "row",
					}}
				>
					<div
						style={{
							height: "100%",
							borderRadius: 12,
							overflow: "hidden",
							...t.atoms.bg_contrast_25,
							...(fullBleed ? a.w_full : { aspectRatio }),
						}}
					>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}

export function AutoSizedImage({
	image,
	crop = "constrained",
	hideBadge,
	onPress,
	onLongPress,
	onPressIn,
}: {
	image: AppBskyEmbedImages.ViewImage;
	crop?: "none" | "square" | "constrained";
	hideBadge?: boolean;
	onPress?: (containerRef: RefObject<HTMLElement>, fetchedDims: Dimensions | null) => void;
	onLongPress?: () => void;
	onPressIn?: () => void;
}) {
	const t = useTheme();
	const largeAlt = useLargeAltBadgeEnabled();
	const containerRef = useRef<HTMLDivElement>(null);
	const fetchedDimsRef = useRef<{ width: number; height: number } | null>(null);

	let aspectRatio: number | undefined;
	const dims = image.aspectRatio;
	if (dims) {
		aspectRatio = dims.width / dims.height;
		if (Number.isNaN(aspectRatio)) {
			aspectRatio = undefined;
		}
	}

	let constrained: number | undefined;
	let max: number | undefined;
	let rawIsCropped: boolean | undefined;
	if (aspectRatio !== undefined) {
		const ratio = 1 / 2; // max of 1:2 ratio in feeds
		constrained = Math.max(aspectRatio, ratio);
		max = Math.max(aspectRatio, 0.25); // max of 1:4 in thread
		rawIsCropped = aspectRatio < constrained;
	}

	const cropDisabled = crop === "none";
	const isCropped = rawIsCropped && !cropDisabled;
	const isContain = aspectRatio === undefined;
	const hasAlt = !!image.alt;

	const contents = (
		<div ref={containerRef} style={{ flex: 1 }}>
			<img
				style={{
					width: "100%",
					height: "100%",
					objectFit: isContain ? "contain" : "cover",
				}}
				src={image.thumb}
				onLoad={(e) => {
					if (!isContain) {
						fetchedDimsRef.current = {
							width: e.currentTarget.width,
							height: e.currentTarget.height,
						};
					}
				}}
			/>
			<MediaInsetBorder />

			{(hasAlt || isCropped) && !hideBadge ? (
				<div
					style={{
						position: "absolute",
						flexDirection: "row",
						bottom: a.p_xs.padding,
						right: a.p_xs.padding,
						gap: 3,
						...flatten(largeAlt && [{ gap: 4 }]),
					}}
				>
					{isCropped && (
						<div
							style={{
								borderRadius: 4,
								...t.atoms.bg_contrast_25,
								padding: 3,
								opacity: 0.8,
								...flatten(largeAlt && [{ padding: 5 }]),
							}}
						>
							<Fullscreen fill={t.atoms.text_contrast_high.color} width={largeAlt ? 18 : 12} />
						</div>
					)}
					{hasAlt && (
						<div
							style={{
								justifyContent: "center",
								borderRadius: 4,
								...t.atoms.bg_contrast_25,
								padding: 3,
								opacity: 0.8,

								...flatten(largeAlt && [{ padding: 5 }]),
							}}
						>
							<Text
								style={{
									fontWeight: "800",
									...(largeAlt ? a.text_xs : { fontSize: 8 }),
								}}
							>
								ALT
							</Text>
						</div>
					)}
				</div>
			) : null}
		</div>
	);

	if (cropDisabled) {
		return (
			<button
				type="button"
				onClick={() => onPress?.(containerRef, fetchedDimsRef.current)}
				// onLongPress={onLongPress}
				onMouseDown={onPressIn}
				style={{
					width: "100%",
					borderRadius: 12,
					overflow: "hidden",
					...t.atoms.bg_contrast_25,
					...{ aspectRatio: max ?? 1 },
				}}
			>
				{contents}
			</button>
		);
	} else {
		return (
			<ConstrainedImage fullBleed={crop === "square"} aspectRatio={constrained ?? 1}>
				<button
					type="button"
					onClick={() => onPress?.(containerRef, fetchedDimsRef.current)}
					// onLongPress={onLongPress}
					onMouseDown={onPressIn}
					style={{ height:"100%" }}
				>
					{contents}
				</button>
			</ConstrainedImage>
		);
	}
}
