import type { AppBskyEmbedExternal } from "@atproto/api";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Divider } from "#/components/Divider";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { Earth_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";
import { parseAltFromGIFDescription } from "#/lib/gif-alt-text";
import { parseEmbedPlayerFromUrl } from "#/lib/strings/embed-player";
import { toNiceDomain } from "#/lib/strings/url-helpers";
import { useExternalEmbedsPrefs } from "#/state/preferences";
import { ExternalGifEmbed } from "#/view/com/util/post-embeds/ExternalGifEmbed";
import { ExternalPlayer } from "#/view/com/util/post-embeds/ExternalPlayerEmbed";
import { GifEmbed } from "#/view/com/util/post-embeds/GifEmbed";

export const ExternalLinkEmbed = ({
	link,
	onOpen,
	style,
	hideAlt,
}: {
	link: AppBskyEmbedExternal.ViewExternal;
	onOpen?: () => void;
	style?: React.CSSProperties;
	hideAlt?: boolean;
}) => {
	const t = useTheme();
	const externalEmbedPrefs = useExternalEmbedsPrefs();
	const niceUrl = toNiceDomain(link.uri);
	const imageUri = link.thumb;
	const embedPlayerParams = React.useMemo(() => {
		const params = parseEmbedPlayerFromUrl(link.uri);

		if (params && externalEmbedPrefs?.[params.source] !== "hide") {
			return params;
		}
	}, [link.uri, externalEmbedPrefs]);
	const hasMedia = Boolean(imageUri || embedPlayerParams);

	if (embedPlayerParams?.source === "tenor") {
		const parsedAlt = parseAltFromGIFDescription(link.description);
		return (
			<div style={style}>
				<GifEmbed
					params={embedPlayerParams}
					thumb={link.thumb}
					altText={parsedAlt.alt}
					isPreferredAltText={parsedAlt.isPreferred}
					hideAlt={hideAlt}
				/>
			</div>
		);
	}

	return (
		<Link label={link.title || `Open link to ${niceUrl}`} to={link.uri} shouldProxy={true} onPress={onOpen}>
			{({ hovered }) => (
				<div
					style={{
						transitionProperty:
							"color, background-color, border-color, text-decoration-color, fill, stroke",
						transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
						transitionDuration: "100ms",

						flexDirection: "column",
						borderRadius: 12,
						overflow: "hidden",
						width: "100%",
						border: "1px solid black",
						borderWidth: 1,
						...style,
						...(hovered ? t.atoms.border_contrast_high : t.atoms.border_contrast_low),
					}}
				>
					{imageUri && !embedPlayerParams ? (
						<img
							style={{
								aspectRatio: 1.91,
							}}
							src={imageUri}
						/>
					) : undefined}

					{embedPlayerParams?.isGif ? (
						<ExternalGifEmbed link={link} params={embedPlayerParams} />
					) : embedPlayerParams ? (
						<ExternalPlayer link={link} params={embedPlayerParams} />
					) : undefined}

					<div
						style={{
							flex: 1,
							paddingTop: 8,
							...{ gap: 3 },
							...(hasMedia && a.border_t),
							...(hovered ? t.atoms.border_contrast_high : t.atoms.border_contrast_low),
						}}
					>
						<div
							style={{
								...{ gap: 3 },
								paddingBottom: 4,
								paddingLeft: 12,
								paddingRight: 12,
							}}
						>
							{!embedPlayerParams?.isGif && !embedPlayerParams?.dimensions && (
								<Text
									numberOfLines={3}
									style={{
										fontSize: 16,
										letterSpacing: 0,
										fontWeight: "600",
										lineHeight: 1.3,
									}}
								>
									{link.title || link.uri}
								</Text>
							)}
							{link.description ? (
								<Text
									numberOfLines={link.thumb ? 2 : 4}
									style={{
										fontSize: 14,
										letterSpacing: 0,
										lineHeight: 1.3,
									}}
								>
									{link.description}
								</Text>
							) : undefined}
						</div>
						<div style={{ ...a.px_md }}>
							<Divider />
							<div
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 2,
									paddingBottom: 8,

									...{
										paddingTop: 6, // off menu
									},
								}}
							>
								<Globe
									size="xs"
									style={{
										transitionProperty:
											"color, background-color, border-color, text-decoration-color, fill, stroke",
										transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
										transitionDuration: "100ms",

										...(hovered ? t.atoms.text_contrast_medium : t.atoms.text_contrast_low),
									}}
								/>
								<Text
									numberOfLines={1}
									style={{
										transitionProperty:
											"color, background-color, border-color, text-decoration-color, fill, stroke",
										transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
										transitionDuration: "100ms",

										fontSize: 12,
										letterSpacing: 0,
										lineHeight: 1.3,
										...(hovered ? t.atoms.text_contrast_high : t.atoms.text_contrast_medium),
									}}
								>
									{toNiceDomain(link.uri)}
								</Text>
							</div>
						</div>
					</div>
				</div>
			)}
		</Link>
	);
};
