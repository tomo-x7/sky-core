import {
	AppBskyEmbedExternal,
	AppBskyEmbedImages,
	AppBskyEmbedRecord,
	AppBskyEmbedRecordWithMedia,
	AppBskyEmbedVideo,
	AppBskyFeedDefs,
	AppBskyGraphDefs,
	type ModerationDecision,
	moderateFeedGenerator,
	moderateUserList,
} from "@atproto/api";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import * as ListCard from "#/components/ListCard";
import { Embed as StarterPackCard } from "#/components/StarterPack/StarterPackCard";
import { type MeasuredDimensions, measureHandle } from "#/lib/hooks/useHandleRef";
import { usePalette } from "#/lib/hooks/usePalette";
import { prefetch } from "#/lib/prefetchImage";
import { useLightboxControls } from "#/state/lightbox";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { FeedSourceCard } from "#/view/com/feeds/FeedSourceCard";
import { ContentHider } from "../../../../components/moderation/ContentHider";
import type { Dimensions } from "../../lightbox/ImageViewing/@types";
import { AutoSizedImage } from "../images/AutoSizedImage";
import { ImageLayoutGrid } from "../images/ImageLayoutGrid";
import { ExternalLinkEmbed } from "./ExternalLinkEmbed";
import { MaybeQuoteEmbed } from "./QuoteEmbed";
import { VideoEmbed } from "./VideoEmbed";
import { PostEmbedViewContext, QuoteEmbedViewContext } from "./types";

export * from "./types";

type Embed =
	| AppBskyEmbedRecord.View
	| AppBskyEmbedImages.View
	| AppBskyEmbedVideo.View
	| AppBskyEmbedExternal.View
	| AppBskyEmbedRecordWithMedia.View
	| { $type: string; [k: string]: unknown };

export function PostEmbeds({
	embed,
	moderation,
	onOpen,
	style,
	allowNestedQuotes,
	viewContext,
}: {
	embed?: Embed;
	moderation?: ModerationDecision;
	onOpen?: () => void;
	style?: React.CSSProperties;
	allowNestedQuotes?: boolean;
	viewContext?: PostEmbedViewContext;
}) {
	const { openLightbox } = useLightboxControls();

	// quote post with media
	// =
	if (AppBskyEmbedRecordWithMedia.isView(embed)) {
		return (
			<div style={style}>
				<PostEmbeds embed={embed.media} moderation={moderation} onOpen={onOpen} viewContext={viewContext} />
				<MaybeQuoteEmbed
					embed={embed.record}
					onOpen={onOpen}
					viewContext={
						viewContext === PostEmbedViewContext.Feed
							? QuoteEmbedViewContext.FeedEmbedRecordWithMedia
							: undefined
					}
				/>
			</div>
		);
	}

	if (AppBskyEmbedRecord.isView(embed)) {
		// custom feed embed (i.e. generator view)
		if (AppBskyFeedDefs.isGeneratorView(embed.record)) {
			return (
				<div style={a.mt_sm}>
					<MaybeFeedCard view={embed.record} />
				</div>
			);
		}

		// list embed
		if (AppBskyGraphDefs.isListView(embed.record)) {
			return (
				<div style={a.mt_sm}>
					<MaybeListCard view={embed.record} />
				</div>
			);
		}

		// starter pack embed
		if (AppBskyGraphDefs.isStarterPackViewBasic(embed.record)) {
			return (
				<div style={a.mt_sm}>
					<StarterPackCard starterPack={embed.record} />
				</div>
			);
		}

		// quote post
		// =
		return <MaybeQuoteEmbed embed={embed} style={style} onOpen={onOpen} allowNestedQuotes={allowNestedQuotes} />;
	}

	// image embed
	// =
	if (AppBskyEmbedImages.isView(embed)) {
		const { images } = embed;

		if (images.length > 0) {
			const items = embed.images.map((img) => ({
				uri: img.fullsize,
				thumbUri: img.thumb,
				alt: img.alt,
				dimensions: img.aspectRatio ?? null,
			}));
			const _openLightbox = (
				index: number,
				thumbRects: (MeasuredDimensions | null)[],
				fetchedDims: (Dimensions | null)[],
			) => {
				openLightbox({
					images: items.map((item, i) => ({
						...item,
						thumbRect: thumbRects[i] ?? null,
						thumbDimensions: fetchedDims[i] ?? null,
						type: "image",
					})),
					index,
				});
			};
			const onPress = (
				index: number,
				refs: React.RefObject<HTMLElement>[],
				fetchedDims: (Dimensions | null)[],
			) => {
				const handles = refs.map((r) => r.current);
				// runOnUI(() => {
				// 	"worklet";
				// 	const rects = handles.map(measureHandle);
				// 	runOnJS(_openLightbox)(index, rects, fetchedDims);
				// })();
				const rects = handles.map(measureHandle);
				_openLightbox(index, rects, fetchedDims);
			};
			const onPressIn = (_: number) => {
				setTimeout(() => {
					for (const src of items.map((i) => i.uri)) prefetch(src);
				}, 0);
			};

			if (images.length === 1) {
				const image = images[0];
				return (
					<ContentHider modui={moderation?.ui("contentMedia")}>
						<div
							style={{
								...a.mt_sm,
								...style,
							}}
						>
							<AutoSizedImage
								crop={
									viewContext === PostEmbedViewContext.ThreadHighlighted
										? "none"
										: viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia
											? "square"
											: "constrained"
								}
								image={image}
								onPress={(containerRef, dims) => onPress(0, [containerRef], [dims])}
								onPressIn={() => onPressIn(0)}
								hideBadge={viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia}
							/>
						</div>
					</ContentHider>
				);
			}

			return (
				<ContentHider modui={moderation?.ui("contentMedia")}>
					<div
						style={{
							...a.mt_sm,
							...style,
						}}
					>
						<ImageLayoutGrid
							images={embed.images}
							onPress={onPress}
							onPressIn={onPressIn}
							viewContext={viewContext}
						/>
					</div>
				</ContentHider>
			);
		}
	}

	// external link embed
	// =
	if (AppBskyEmbedExternal.isView(embed)) {
		const link = embed.external;
		return (
			<ContentHider modui={moderation?.ui("contentMedia")}>
				<ExternalLinkEmbed
					link={link}
					onOpen={onOpen}
					style={{
						...a.mt_sm,
						...style,
					}}
				/>
			</ContentHider>
		);
	}

	// video embed
	// =
	if (AppBskyEmbedVideo.isView(embed)) {
		return (
			<ContentHider modui={moderation?.ui("contentMedia")}>
				<VideoEmbed
					embed={embed}
					crop={
						viewContext === PostEmbedViewContext.ThreadHighlighted
							? "none"
							: viewContext === PostEmbedViewContext.FeedEmbedRecordWithMedia
								? "square"
								: "constrained"
					}
				/>
			</ContentHider>
		);
	}

	return <div />;
}

export function MaybeFeedCard({ view }: { view: AppBskyFeedDefs.GeneratorView }) {
	const pal = usePalette("default");
	const moderationOpts = useModerationOpts();
	const moderation = React.useMemo(() => {
		return moderationOpts ? moderateFeedGenerator(view, moderationOpts) : undefined;
	}, [view, moderationOpts]);

	return (
		<ContentHider modui={moderation?.ui("contentList")}>
			<FeedSourceCard
				feedUri={view.uri}
				style={{
					...pal.view,
					...pal.border,
					...styles.customFeedOuter,
				}}
				showLikes
			/>
		</ContentHider>
	);
}

export function MaybeListCard({ view }: { view: AppBskyGraphDefs.ListView }) {
	const moderationOpts = useModerationOpts();
	const moderation = React.useMemo(() => {
		return moderationOpts ? moderateUserList(view, moderationOpts) : undefined;
	}, [view, moderationOpts]);
	const t = useTheme();

	return (
		<ContentHider modui={moderation?.ui("contentList")}>
			<div
				style={{
					...a.border,
					...t.atoms.border_contrast_medium,
					...a.p_md,
					...a.rounded_sm,
				}}
			>
				<ListCard.Default view={view} />
			</div>
		</ContentHider>
	);
}

const styles = {
	altContainer: {
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		borderRadius: 6,
		paddingLeft: 6,
		paddingRight: 6,
		paddingTop: 3,
		paddingBottom: 3,
		position: "absolute",
		right: 6,
		bottom: 6,
	},
	alt: {
		color: "white",
		fontSize: 7,
		fontWeight: "600",
	},
	customFeedOuter: {
		borderWidth: 1,
		borderRadius: 8,
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 12,
		paddingBottom: 12,
	},
} satisfies Record<string, React.CSSProperties>;
