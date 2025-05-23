import { AppBskyFeedPost, AppBskyRichtextFacet, AtUri, RichText as RichTextAPI, moderatePost } from "@atproto/api";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Loader } from "#/components/Loader";
import * as MediaPreview from "#/components/MediaPreview";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { ContentHider } from "#/components/moderation/ContentHider";
import { PostAlerts } from "#/components/moderation/PostAlerts";
import { makeProfileLink } from "#/lib/routes/links";
import { convertBskyAppUrlIfNeeded, isBskyPostUrl, makeRecordUri } from "#/lib/strings/url-helpers";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { usePostQuery } from "#/state/queries/post";
import * as bsky from "#/types/bsky";
import { PostMeta } from "#/view/com/util/PostMeta";

export function useMessageEmbed() {
	const state = useLocation().state;
	const embedFromParams = state.embed;
	const navigate = useNavigate();

	const [embedUri, setEmbed] = useState(embedFromParams);

	if (embedFromParams && embedUri !== embedFromParams) {
		setEmbed(embedFromParams);
	}

	return {
		embedUri,
		setEmbed: useCallback(
			(embedUrl: string | undefined) => {
				if (!embedUrl) {
					const { embed, ...newState } = state || {}; // embed を削除
					navigate(location.pathname, { state: newState, replace: true });
					setEmbed(undefined);
					return;
				}

				if (embedFromParams) return;

				const url = convertBskyAppUrlIfNeeded(embedUrl);
				const [_0, user, _1, rkey] = url.split("/").filter(Boolean);
				const uri = makeRecordUri(user, "app.bsky.feed.post", rkey);

				setEmbed(uri);
			},
			[embedFromParams, navigate, state],
		),
	};
}

export function useExtractEmbedFromFacets(message: string, setEmbed: (embedUrl: string | undefined) => void) {
	const rt = new RichTextAPI({ text: message });
	rt.detectFacetsWithoutResolution();

	let uriFromFacet: string | undefined;

	for (const facet of rt.facets ?? []) {
		for (const feature of facet.features) {
			if (AppBskyRichtextFacet.isLink(feature) && isBskyPostUrl(feature.uri)) {
				uriFromFacet = feature.uri;
				break;
			}
		}
	}

	useEffect(() => {
		if (uriFromFacet) {
			setEmbed(uriFromFacet);
		}
	}, [uriFromFacet, setEmbed]);
}

export function MessageInputEmbed({
	embedUri,
	setEmbed,
}: {
	embedUri: string | undefined;
	setEmbed: (embedUrl: string | undefined) => void;
}) {
	const t = useTheme();

	const { data: post, status } = usePostQuery(embedUri);

	const moderationOpts = useModerationOpts();
	const moderation = useMemo(
		() => (moderationOpts && post ? moderatePost(post, moderationOpts) : undefined),
		[moderationOpts, post],
	);

	const { rt, record } = useMemo(() => {
		if (post && bsky.dangerousIsType<AppBskyFeedPost.Record>(post.record, AppBskyFeedPost.isRecord)) {
			return {
				rt: new RichTextAPI({
					text: post.record.text,
					facets: post.record.facets,
				}),
				record: post.record,
			};
		}

		return { rt: undefined, record: undefined };
	}, [post]);

	if (!embedUri) {
		return null;
	}

	let content = null;
	switch (status) {
		case "pending":
			content = (
				<div
					style={{
						flex: 1,
						...{ minHeight: 64 },
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Loader />
				</div>
			);
			break;
		case "error":
			content = (
				<div
					style={{
						flex: 1,
						...{ minHeight: 64 },
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text style={{ textAlign: "center" }}>Could not fetch post</Text>
				</div>
			);
			break;
		case "success": {
			const itemUrip = new AtUri(post.uri);
			const itemHref = makeProfileLink(post.author, "post", itemUrip.rkey);

			if (!post || !moderation || !rt || !record) {
				return null;
			}

			content = (
				<div
					style={{
						flex: 1,
						...t.atoms.bg,
						...t.atoms.border_contrast_low,
						borderRadius: 12,
						border: "1px solid black",
						borderWidth: 1,
						padding: 8,
						marginBottom: 8,
						pointerEvents: "none",
					}}
				>
					<PostMeta
						showAvatar
						author={post.author}
						moderation={moderation}
						timestamp={post.indexedAt}
						postHref={itemHref}
						style={{ flex: "0 0 auto" }}
					/>
					<ContentHider modui={moderation.ui("contentView")}>
						<PostAlerts modui={moderation.ui("contentView")} style={{ paddingTop: 4, paddingBottom: 4 }} />
						{rt.text && (
							<div style={{ marginTop: 4 }}>
								<RichText
									enableTags
									value={rt}
									style={{
										fontSize: 14,
										letterSpacing: 0,
										...t.atoms.text_contrast_high,
									}}
									authorHandle={post.author.handle}
									numberOfLines={3}
								/>
							</div>
						)}
						<MediaPreview.Embed embed={post.embed} style={{ marginTop: 8 }} />
					</ContentHider>
				</div>
			);
			break;
		}
	}

	return (
		<div
			style={{
				flexDirection: "row",
				gap: 8,
			}}
		>
			{content}
			<Button
				label={"Remove embed"}
				onPress={() => {
					// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
					setEmbed(undefined);
				}}
				size="tiny"
				variant="solid"
				color="secondary"
				shape="round"
			>
				<ButtonIcon icon={X} />
			</Button>
		</div>
	);
}
