import type { AppBskyFeedDefs } from "@atproto/api";
import type React from "react";

import { atoms as a, useTheme } from "#/alf";
import { MediaInsetBorder } from "#/components/MediaInsetBorder";
import { Text } from "#/components/Typography";
import { PlayButtonIcon } from "#/components/video/PlayButtonIcon";
import { isTenorGifUri } from "#/lib/strings/embed-player";
import * as bsky from "#/types/bsky";

/**
 * Streamlined MediaPreview component which just handles images, gifs, and videos
 */
export function Embed({
	embed,
	style,
}: {
	embed: AppBskyFeedDefs.PostView["embed"];
	style?: React.CSSProperties;
}) {
	const e = bsky.post.parseEmbed(embed);

	if (!e) return null;

	if (e.type === "images") {
		return (
			<Outer style={style}>
				{e.view.images.map((image) => (
					<ImageItem key={image.thumb} thumbnail={image.thumb} alt={image.alt} />
				))}
			</Outer>
		);
	} else if (e.type === "link") {
		if (!e.view.external.thumb) return null;
		if (!isTenorGifUri(e.view.external.uri)) return null;
		return (
			<Outer style={style}>
				<GifItem thumbnail={e.view.external.thumb} alt={e.view.external.title} />
			</Outer>
		);
	} else if (e.type === "video") {
		return (
			<Outer style={style}>
				<VideoItem thumbnail={e.view.thumbnail} alt={e.view.alt} />
			</Outer>
		);
	}

	return null;
}

export function Outer({
	children,
	style,
}: {
	children?: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<div
			style={{
				flexDirection: "row",
				gap: 4,
				...style,
			}}
		>
			{children}
		</div>
	);
}

export function ImageItem({
	thumbnail,
	alt,
	children,
}: {
	thumbnail: string;
	alt?: string;
	children?: React.ReactNode;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				position: "relative",
				flex: 1,
				...{ aspectRatio: 1, maxWidth: 100 },
			}}
		>
			<img
				key={thumbnail}
				src={thumbnail}
				style={{
					flex: 1,
					borderRadius: 4,
					...t.atoms.bg_contrast_25,
					objectFit: "cover",
				}}
			/>
			<MediaInsetBorder style={{ ...a.rounded_xs }} />
			{children}
		</div>
	);
}

export function GifItem({ thumbnail, alt }: { thumbnail: string; alt?: string }) {
	return (
		<ImageItem thumbnail={thumbnail} alt={alt}>
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
				<PlayButtonIcon size={24} />
			</div>
			<div style={styles.altContainer}>
				<Text style={styles.alt}>GIF</Text>
			</div>
		</ImageItem>
	);
}

export function VideoItem({
	thumbnail,
	alt,
}: {
	thumbnail?: string;
	alt?: string;
}) {
	if (!thumbnail) {
		return (
			<div
				style={{
					...{ backgroundColor: "black" },
					flex: 1,
					...{ aspectRatio: 1, maxWidth: 100 },
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<PlayButtonIcon size={24} />
			</div>
		);
	}
	return (
		<ImageItem thumbnail={thumbnail} alt={alt}>
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
				<PlayButtonIcon size={24} />
			</div>
		</ImageItem>
	);
}

const styles = {
	altContainer: {
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		borderRadius: 6,
		padding: "3px 6px",
		position: "absolute",
		right: 5,
		bottom: 5,
		zIndex: 2,
	},
	alt: {
		color: "white",
		fontSize: 7,
		fontWeight: "600",
	},
} satisfies Record<string, React.CSSProperties>;
