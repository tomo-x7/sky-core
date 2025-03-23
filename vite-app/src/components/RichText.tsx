import { AppBskyRichtextFacet, RichText as RichTextAPI } from "@atproto/api";
import React from "react";

import { type TextStyleProp, atoms as a, flatten } from "#/alf";
import { isOnlyEmoji } from "#/alf/typography";
import { InlineLinkText, type LinkProps } from "#/components/Link";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { RichTextTag } from "#/components/RichTextTag";
import { Text, type TextProps } from "#/components/Typography";
import { toShortUrl } from "#/lib/strings/url-helpers";

const WORD_WRAP = { wordWrap: 1 };

export type RichTextProps = TextStyleProp &
	Pick<TextProps, "selectable"> & {
		value: RichTextAPI | string;
		numberOfLines?: number;
		disableLinks?: boolean;
		enableTags?: boolean;
		authorHandle?: string;
		onLinkPress?: LinkProps["onPress"];
		interactiveStyle?: React.CSSProperties;
		emojiMultiplier?: number;
		shouldProxyLinks?: boolean;
		onLayout?: (rect: DOMRect) => void;
	};

export function RichText({
	value,
	style,
	numberOfLines,
	disableLinks,
	selectable,
	enableTags = false,
	authorHandle,
	onLinkPress,
	interactiveStyle,
	emojiMultiplier = 1.85,
	onLayout,
	// onTextLayout,
	shouldProxyLinks,
}: RichTextProps) {
	const richText = React.useMemo(
		() => (value instanceof RichTextAPI ? value : new RichTextAPI({ text: value })),
		[value],
	);

	const flattenedStyle = style;
	const plainStyles = [a.leading_snug, flattenedStyle];
	const interactiveStyles = [a.leading_snug, interactiveStyle, flattenedStyle];

	const { text, facets } = richText;

	if (!facets?.length) {
		if (isOnlyEmoji(text)) {
			const fontSize =
				Number.parseFloat(String(flattenedStyle?.fontSize ?? a.text_sm.fontSize)) * emojiMultiplier;
			return (
				<Text
					emoji
					selectable={selectable}
					style={{
						...flatten(plainStyles),
						...{ fontSize },
					}}
					onLayout={onLayout}
					// onTextLayout={onTextLayout}
					dataset={WORD_WRAP}
				>
					{text}
				</Text>
			);
		}
		return (
			<Text
				emoji
				selectable={selectable}
				style={flatten(plainStyles)}
				numberOfLines={numberOfLines}
				onLayout={onLayout}
				// onTextLayout={onTextLayout}
				dataset={WORD_WRAP}
			>
				{text}
			</Text>
		);
	}

	const els = [];
	let key = 0;
	// N.B. must access segments via `richText.segments`, not via destructuring
	for (const segment of richText.segments()) {
		const link = segment.link;
		const mention = segment.mention;
		const tag = segment.tag;
		if (mention && AppBskyRichtextFacet.validateMention(mention).success && !disableLinks) {
			els.push(
				<ProfileHoverCard key={key} inline did={mention.did}>
					<InlineLinkText
						selectable={selectable}
						to={`/profile/${mention.did}`}
						style={flatten(interactiveStyles)}
						// @ts-expect-error TODO
						dataset={WORD_WRAP}
						shouldProxy={shouldProxyLinks}
						onPress={onLinkPress}
					>
						{segment.text}
					</InlineLinkText>
				</ProfileHoverCard>,
			);
		} else if (link && AppBskyRichtextFacet.validateLink(link).success) {
			if (disableLinks) {
				els.push(toShortUrl(segment.text));
			} else {
				els.push(
					<InlineLinkText
						selectable={selectable}
						key={key}
						to={link.uri}
						style={flatten(interactiveStyles)}
						// @ts-expect-error TODO
						dataset={WORD_WRAP}
						shareOnLongPress
						shouldProxy={shouldProxyLinks}
						onPress={onLinkPress}
						emoji
					>
						{toShortUrl(segment.text)}
					</InlineLinkText>,
				);
			}
		} else if (!disableLinks && enableTags && tag && AppBskyRichtextFacet.validateTag(tag).success) {
			els.push(
				<RichTextTag
					key={key}
					display={segment.text}
					tag={tag.tag}
					textStyle={flatten(interactiveStyles)}
					authorHandle={authorHandle}
				/>,
			);
		} else {
			els.push(segment.text);
		}
		key++;
	}

	return (
		<Text
			emoji
			selectable={selectable}
			style={flatten(plainStyles)}
			numberOfLines={numberOfLines}
			onLayout={onLayout}
			// onTextLayout={onTextLayout}
			dataset={WORD_WRAP}
		>
			{els}
		</Text>
	);
}
