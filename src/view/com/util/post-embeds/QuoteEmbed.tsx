import {
	AppBskyEmbedExternal,
	AppBskyEmbedImages,
	AppBskyEmbedRecord,
	AppBskyEmbedRecordWithMedia,
	AppBskyEmbedVideo,
	type AppBskyFeedDefs,
	AppBskyFeedPost,
	type ModerationDecision,
	RichText as RichTextAPI,
	moderatePost,
} from "@atproto/api";
import { AtUri } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { RichText } from "#/components/RichText";
import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { InfoCircleIcon } from "#/lib/icons";
import { makeProfileLink } from "#/lib/routes/links";
import { s } from "#/lib/styles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { precacheProfile } from "#/state/queries/profile";
import { useResolveLinkQuery } from "#/state/queries/resolve-link";
import { useSession } from "#/state/session";
import * as bsky from "#/types/bsky";
import { PostEmbeds } from ".";
import { ContentHider } from "../../../../components/moderation/ContentHider";
import { PostAlerts } from "../../../../components/moderation/PostAlerts";
import { Link } from "../Link";
import { PostMeta } from "../PostMeta";
import type { QuoteEmbedViewContext } from "./types";

export function MaybeQuoteEmbed({
	embed,
	onOpen,
	style,
	allowNestedQuotes,
	viewContext,
}: {
	embed: AppBskyEmbedRecord.View;
	onOpen?: () => void;
	style?: React.CSSProperties;
	allowNestedQuotes?: boolean;
	viewContext?: QuoteEmbedViewContext;
}) {
	const t = useTheme();
	const pal = usePalette("default");
	const { currentAccount } = useSession();
	if (
		AppBskyEmbedRecord.isViewRecord(embed.record) &&
		AppBskyFeedPost.isRecord(embed.record.value) &&
		AppBskyFeedPost.validateRecord(embed.record.value).success
	) {
		return (
			<QuoteEmbedModerated
				viewRecord={embed.record}
				onOpen={onOpen}
				style={style}
				allowNestedQuotes={allowNestedQuotes}
				viewContext={viewContext}
			/>
		);
	} else if (AppBskyEmbedRecord.isViewBlocked(embed.record)) {
		return (
			<div
				style={{
					...styles.errorContainer,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_low,
				}}
			>
				<InfoCircleIcon size={18} style={pal.text} />
				<Text type="lg" style={pal.text}>
					Blocked
				</Text>
			</div>
		);
	} else if (AppBskyEmbedRecord.isViewNotFound(embed.record)) {
		return (
			<div
				style={{
					...styles.errorContainer,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_low,
				}}
			>
				<InfoCircleIcon size={18} style={pal.text} />
				<Text type="lg" style={pal.text}>
					Deleted
				</Text>
			</div>
		);
	} else if (AppBskyEmbedRecord.isViewDetached(embed.record)) {
		const isViewerOwner = currentAccount?.did ? embed.record.uri.includes(currentAccount.did) : false;
		return (
			<div
				style={{
					...styles.errorContainer,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_low,
				}}
			>
				<InfoCircleIcon size={18} style={pal.text} />
				<Text type="lg" style={pal.text}>
					{isViewerOwner ? <>Removed by you</> : <>Removed by author</>}
				</Text>
			</div>
		);
	}
	return null;
}

function QuoteEmbedModerated({
	viewRecord,
	onOpen,
	style,
	allowNestedQuotes,
	viewContext,
}: {
	viewRecord: AppBskyEmbedRecord.ViewRecord;
	onOpen?: () => void;
	style?: React.CSSProperties;
	allowNestedQuotes?: boolean;
	viewContext?: QuoteEmbedViewContext;
}) {
	const moderationOpts = useModerationOpts();
	const postView = React.useMemo(() => viewRecordToPostView(viewRecord), [viewRecord]);
	const moderation = React.useMemo(() => {
		return moderationOpts ? moderatePost(postView, moderationOpts) : undefined;
	}, [postView, moderationOpts]);

	return (
		<QuoteEmbed
			quote={postView}
			moderation={moderation}
			onOpen={onOpen}
			style={style}
			allowNestedQuotes={allowNestedQuotes}
			viewContext={viewContext}
		/>
	);
}

export function QuoteEmbed({
	quote,
	moderation,
	onOpen,
	style,
	allowNestedQuotes,
}: {
	quote: AppBskyFeedDefs.PostView;
	moderation?: ModerationDecision;
	onOpen?: () => void;
	style?: React.CSSProperties;
	allowNestedQuotes?: boolean;
	viewContext?: QuoteEmbedViewContext;
}) {
	const t = useTheme();
	const queryClient = useQueryClient();
	const pal = usePalette("default");
	const itemUrip = new AtUri(quote.uri);
	const itemHref = makeProfileLink(quote.author, "post", itemUrip.rkey);
	const itemTitle = `Post by ${quote.author.handle}`;

	const richText = React.useMemo(() => {
		if (!bsky.dangerousIsType<AppBskyFeedPost.Record>(quote.record, AppBskyFeedPost.isRecord)) return undefined;
		const { text, facets } = quote.record;
		return text.trim() ? new RichTextAPI({ text: text, facets: facets }) : undefined;
	}, [quote.record]);

	const embed = React.useMemo(() => {
		const e = quote.embed;

		if (allowNestedQuotes) {
			return e;
		} else {
			if (AppBskyEmbedImages.isView(e) || AppBskyEmbedExternal.isView(e) || AppBskyEmbedVideo.isView(e)) {
				return e;
			} else if (
				AppBskyEmbedRecordWithMedia.isView(e) &&
				(AppBskyEmbedImages.isView(e.media) ||
					AppBskyEmbedExternal.isView(e.media) ||
					AppBskyEmbedVideo.isView(e.media))
			) {
				return e.media;
			}
		}
	}, [quote.embed, allowNestedQuotes]);

	const onBeforePress = React.useCallback(() => {
		precacheProfile(queryClient, quote.author);
		onOpen?.();
	}, [queryClient, quote.author, onOpen]);

	const [hover, setHover] = React.useState(false);
	return (
		<div
			onPointerEnter={() => {
				setHover(true);
			}}
			onPointerLeave={() => {
				setHover(false);
			}}
		>
			<ContentHider
				modui={moderation?.ui("contentList")}
				style={{
					borderRadius: 12,
					padding: 12,
					marginTop: 8,
					border: "1px solid black",
					borderWidth: 1,
					...t.atoms.border_contrast_low,
					...style,
				}}
				childContainerStyle={{ paddingTop: 8 }}
			>
				<SubtleWebHover hover={hover} />
				<Link
					hoverStyle={{ borderColor: pal.colors.borderLinkHover }}
					href={itemHref}
					title={itemTitle}
					onBeforePress={onBeforePress}
				>
					<div style={{ pointerEvents: "none" }}>
						<PostMeta
							author={quote.author}
							moderation={moderation}
							showAvatar
							postHref={itemHref}
							timestamp={quote.indexedAt}
						/>
					</div>
					{moderation ? (
						<PostAlerts modui={moderation.ui("contentView")} style={{ paddingTop: 4, paddingBottom: 4 }} />
					) : null}
					{richText ? (
						<RichText value={richText} style={{ fontSize: 16 }} numberOfLines={20} disableLinks />
					) : null}
					{embed && <PostEmbeds embed={embed} moderation={moderation} />}
				</Link>
			</ContentHider>
		</div>
	);
}

export function QuoteX({ onRemove }: { onRemove: () => void }) {
	return (
		<button
			type="button"
			style={{
				position: "absolute",
				padding: 4,
				borderRadius: 999,
				alignItems: "center",
				justifyContent: "center",

				...{
					top: 16,
					right: 10,
					backgroundColor: "rgba(0, 0, 0, 0.75)",
				},
			}}
			onClick={onRemove}
			// onAccessibilityEscape={onRemove}
			// hitSlop={HITSLOP_20}
		>
			{/* @ts-expect-error */}
			<FontAwesomeIcon size={12} icon="xmark" style={s.white} />
		</button>
	);
}

export function LazyQuoteEmbed({ uri }: { uri: string }) {
	const { data } = useResolveLinkQuery(uri);
	const moderationOpts = useModerationOpts();
	if (!data || data.type !== "record" || data.kind !== "post") {
		return null;
	}
	const moderation = moderationOpts ? moderatePost(data.view, moderationOpts) : undefined;
	return <QuoteEmbed quote={data.view} moderation={moderation} />;
}

function viewRecordToPostView(viewRecord: AppBskyEmbedRecord.ViewRecord): AppBskyFeedDefs.PostView {
	const { value, embeds, ...rest } = viewRecord;
	return {
		...rest,
		$type: "app.bsky.feed.defs#postView",
		record: value,
		embed: embeds?.[0],
	};
}

const styles = {
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 8,
		marginTop: 8,
		paddingTop: 14,
		paddingBottom: 14,
		paddingLeft: 14,
		paddingRight: 14,
		borderWidth: 1,
	},
	alert: {
		marginBottom: 6,
	},
} satisfies Record<string, React.CSSProperties>;
