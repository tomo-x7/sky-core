import React from "react";

import { useTheme } from "#/alf";
import { Loader } from "#/components/Loader";
import { Embed as StarterPackEmbed } from "#/components/StarterPack/StarterPackCard";
import { Text } from "#/components/Typography";
import { cleanError } from "#/lib/strings/errors";
import { useResolveGifQuery, useResolveLinkQuery } from "#/state/queries/resolve-link";
import type { Gif } from "#/state/queries/tenor";
import { ExternalEmbedRemoveBtn } from "#/view/com/composer/ExternalEmbedRemoveBtn";
import { ExternalLinkEmbed } from "#/view/com/util/post-embeds/ExternalLinkEmbed";
import { MaybeFeedCard, MaybeListCard } from "../util/post-embeds";

export const ExternalEmbedGif = ({
	onRemove,
	gif,
}: {
	onRemove: () => void;
	gif: Gif;
}) => {
	const t = useTheme();
	const { data, error } = useResolveGifQuery(gif);
	const linkInfo = React.useMemo(
		() =>
			data && {
				title: data.title ?? data.uri,
				uri: data.uri,
				description: data.description ?? "",
				thumb: data.thumb?.source.path,
			},
		[data],
	);

	const loadingStyle: React.CSSProperties = {
		aspectRatio: gif.media_formats.gif.dims[0] / gif.media_formats.gif.dims[1],
		width: "100%",
	};

	return (
		<div
			style={{
				overflow: "hidden",
				...t.atoms.border_contrast_medium,
			}}
		>
			{linkInfo ? (
				<div style={{ pointerEvents: "auto" }}>
					<ExternalLinkEmbed link={linkInfo} hideAlt />
				</div>
			) : error ? (
				<Container
					style={{
						alignItems: "flex-start",
						padding: 12,
						gap: 4,
					}}
				>
					<Text numberOfLines={1} style={t.atoms.text_contrast_high}>
						{gif.url}
					</Text>
					<Text numberOfLines={2} style={{ color: t.palette.negative_400 }}>
						{cleanError(error)}
					</Text>
				</Container>
			) : (
				<Container style={loadingStyle}>
					<Loader size="xl" />
				</Container>
			)}
			<ExternalEmbedRemoveBtn onRemove={onRemove} />
		</div>
	);
};

export const ExternalEmbedLink = ({
	uri,
	hasQuote,
	onRemove,
}: {
	uri: string;
	hasQuote: boolean;
	onRemove: () => void;
}) => {
	const t = useTheme();
	const { data, error } = useResolveLinkQuery(uri);
	const linkComponent = React.useMemo(() => {
		if (data) {
			if (data.type === "external") {
				return (
					<ExternalLinkEmbed
						link={{
							title: data.title || uri,
							uri,
							description: data.description,
							thumb: data.thumb?.source.path,
						}}
						hideAlt
					/>
				);
			} else if (data.kind === "feed") {
				return <MaybeFeedCard view={data.view} />;
			} else if (data.kind === "list") {
				return <MaybeListCard view={data.view} />;
			} else if (data.kind === "starter-pack") {
				return <StarterPackEmbed starterPack={data.view} />;
			}
		}
	}, [data, uri]);

	if (data?.type === "record" && hasQuote) {
		// This is not currently supported by the data model so don't preview it.
		return null;
	}

	return (
		<div
			style={{
				marginBottom: 20,
				overflow: "hidden",
				...t.atoms.border_contrast_medium,
			}}
		>
			{linkComponent ? (
				<div style={{ pointerEvents: "none" }}>{linkComponent}</div>
			) : error ? (
				<Container
					style={{
						alignItems: "flex-start",
						padding: 12,
						gap: 4,
					}}
				>
					<Text numberOfLines={1} style={t.atoms.text_contrast_high}>
						{uri}
					</Text>
					<Text numberOfLines={2} style={{ color: t.palette.negative_400 }}>
						{cleanError(error)}
					</Text>
				</Container>
			) : (
				<Container>
					<Loader size="xl" />
				</Container>
			)}
			<ExternalEmbedRemoveBtn onRemove={onRemove} />
		</div>
	);
};

function Container({
	style,
	children,
}: {
	style?: React.CSSProperties;
	children: React.ReactNode;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				borderRadius: 8,
				border: "1px solid black",
				borderWidth: 1,
				alignItems: "center",
				justifyContent: "center",
				paddingTop: 40,
				paddingBottom: 40,
				...t.atoms.bg_contrast_25,
				...t.atoms.border_contrast_medium,
				...style,
			}}
		>
			{children}
		</div>
	);
}
