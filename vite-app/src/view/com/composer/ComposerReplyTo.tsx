import { AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyFeedPost } from "@atproto/api";
import React from "react";
import { LayoutAnimation } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { ComposerOptsPostRef } from "#/state/shell/composer";
import { PreviewableUserAvatar } from "#/view/com/util/UserAvatar";
import { MaybeQuoteEmbed } from "#/view/com/util/post-embeds/QuoteEmbed";

export function ComposerReplyTo({ replyTo }: { replyTo: ComposerOptsPostRef }) {
	const t = useTheme();
	const { embed } = replyTo;

	const [showFull, setShowFull] = React.useState(false);

	const onPress = React.useCallback(() => {
		setShowFull((prev) => !prev);
		LayoutAnimation.configureNext({
			duration: 350,
			update: { type: "spring", springDamping: 0.7 },
		});
	}, []);

	const quoteEmbed = React.useMemo(() => {
		if (
			AppBskyEmbedRecord.isView(embed) &&
			AppBskyEmbedRecord.isViewRecord(embed.record) &&
			AppBskyFeedPost.isRecord(embed.record.value)
		) {
			return embed;
		} else if (
			AppBskyEmbedRecordWithMedia.isView(embed) &&
			AppBskyEmbedRecord.isViewRecord(embed.record.record) &&
			AppBskyFeedPost.isRecord(embed.record.record.value)
		) {
			return embed.record;
		}
		return null;
	}, [embed]);

	const images = React.useMemo(() => {
		if (AppBskyEmbedImages.isView(embed)) {
			return embed.images;
		} else if (AppBskyEmbedRecordWithMedia.isView(embed) && AppBskyEmbedImages.isView(embed.media)) {
			return embed.media.images;
		}
	}, [embed]);

	return (
		<button
			type="button"
			style={{
				...t.atoms.border_contrast_medium,
				...styles.replyToLayout,
			}}
			onClick={onPress}
		>
			<PreviewableUserAvatar
				size={50}
				profile={replyTo.author}
				moderation={replyTo.moderation?.ui("avatar")}
				type={replyTo.author.associated?.labeler ? "labeler" : "user"}
				disableNavigation={true}
			/>
			<div style={styles.replyToPost}>
				<Text type="xl-medium" style={t.atoms.text} numberOfLines={1} emoji>
					{sanitizeDisplayName(replyTo.author.displayName || sanitizeHandle(replyTo.author.handle))}
				</Text>
				<div style={styles.replyToBody}>
					<div style={styles.replyToText}>
						<Text type="post-text" style={t.atoms.text} numberOfLines={!showFull ? 6 : undefined} emoji>
							{replyTo.text}
						</Text>
					</div>
					{images && !replyTo.moderation?.ui("contentMedia").blur && (
						<ComposerReplyToImages images={images} showFull={showFull} />
					)}
				</div>
				{showFull && quoteEmbed && <MaybeQuoteEmbed embed={quoteEmbed} />}
			</div>
		</button>
	);
}

function ComposerReplyToImages({
	images,
}: {
	images: AppBskyEmbedImages.ViewImage[];
	showFull: boolean;
}) {
	return (
		<div
			style={{
				...styles.imagesContainer,
				...a.mx_xs,
			}}
		>
			{(images.length === 1 && <img src={images[0].thumb} style={a.flex_1} />) ||
				(images.length === 2 && (
					<div
						style={{
							...a.flex_1,
							...a.flex_row,
							...a.gap_2xs,
						}}
					>
						<img src={images[0].thumb} style={a.flex_1} />
						<img src={images[1].thumb} style={a.flex_1} />
					</div>
				)) ||
				(images.length === 3 && (
					<div
						style={{
							...a.flex_1,
							...a.flex_row,
							...a.gap_2xs,
						}}
					>
						<img src={images[0].thumb} style={a.flex_1} />
						<div
							style={{
								...a.flex_1,
								...a.gap_2xs,
							}}
						>
							<img src={images[1].thumb} style={a.flex_1} />
							<img src={images[2].thumb} style={a.flex_1} />
						</div>
					</div>
				)) ||
				(images.length === 4 && (
					<div
						style={{
							...a.flex_1,
							...a.gap_2xs,
						}}
					>
						<div
							style={{
								...a.flex_1,
								...a.flex_row,
								...a.gap_2xs,
							}}
						>
							<img src={images[0].thumb} style={a.flex_1} />
							<img src={images[1].thumb} style={a.flex_1} />
						</div>
						<div
							style={{
								...a.flex_1,
								...a.flex_row,
								...a.gap_2xs,
							}}
						>
							<img src={images[2].thumb} style={a.flex_1} />
							<img src={images[3].thumb} style={a.flex_1} />
						</div>
					</div>
				))}
		</div>
	);
}

const styles = {
	replyToLayout: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderBottomWidth: 1,
		paddingTop: 4,
		paddingBottom: 16,
		marginBottom: 12,
		marginLeft: 16,
		marginRight: 16,
	},
	replyToPost: {
		flex: 1,
		paddingLeft: 13,
		paddingRight: 8,
	},
	replyToBody: {
		flexDirection: "row",
		gap: 10,
	},
	replyToText: {
		flex: 1,
		flexGrow: 1,
	},
	imagesContainer: {
		borderRadius: 6,
		overflow: "hidden",
		marginTop: 2,
		height: 64,
		width: 64,
	},
} satisfies Record<string, React.CSSProperties>;
