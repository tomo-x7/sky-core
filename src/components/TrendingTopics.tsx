import type { AtUri } from "@atproto/api";
import React from "react";

import { type ViewStyleProp, atoms as a, flatten, useTheme } from "#/alf";
import { Link as InternalLink, type LinkProps } from "#/components/Link";
import { Text } from "#/components/Typography";
import { StarterPack as StarterPackIcon } from "#/components/icons/StarterPack";
// import {makeProfileLink} from '#/lib/routes/links'
// import {feedUriToHref} from '#/lib/strings/url-helpers'
// import {Hashtag_Stroke2_Corner0_Rounded as Hashtag} from '#/components/icons/Hashtag'
// import {CloseQuote_Filled_Stroke2_Corner0_Rounded as Quote} from '#/components/icons/Quote'
// import {UserAvatar} from '#/view/com/util/UserAvatar'
import type { TrendingTopic as TrendingTopicType } from "#/state/queries/trending/useTrendingTopics";

export function TrendingTopic({
	topic: raw,
	size,
	style,
}: { topic: TrendingTopicType; size?: "large" | "small" } & ViewStyleProp) {
	const t = useTheme();
	const topic = useTopic(raw);

	const isSmall = size === "small";
	const hasIcon = topic.type === "starter-pack" && !isSmall;
	const iconSize = 20;

	return (
		<div
			style={{
				flexDirection: "row",
				alignItems: "center",
				borderRadius: 999,
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.border_contrast_medium,
				...t.atoms.bg,

				...flatten(
					isSmall
						? [
								{
									padding: "5px 10px",
								},
							]
						: [a.py_sm, a.px_md],
				),

				...(hasIcon && { gap: 6 }),
				...style,
			}}
		>
			{hasIcon && topic.type === "starter-pack" && (
				<StarterPackIcon
					gradient="sky"
					width={iconSize}
					style={{ marginLeft: -3, marginTop: -1, marginBottom: -1 }}
				/>
			)}
			{/*
        <div
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            a.overflow_hidden,
            {
              width: iconSize,
              height: iconSize,
            },
          ]}>
          {topic.type === 'tag' ? (
            <Hashtag width={iconSize} />
          ) : topic.type === 'topic' ? (
            <Quote width={iconSize - 2} />
          ) : topic.type === 'feed' ? (
            <UserAvatar
              type="user"
              size={aviSize}
              avatar=""
            />
          ) : (
            <UserAvatar
              type="user"
              size={aviSize}
              avatar=""
            />
          )}
        </div>
        */}
			<Text
				style={{
					fontWeight: "600",
					lineHeight: 1.15,
					...flatten(isSmall ? [a.text_sm] : [a.text_md, { paddingBottom: 1 }]),
				}}
				numberOfLines={1}
			>
				{topic.displayName}
			</Text>
		</div>
	);
}

export function TrendingTopicSkeleton({
	size = "large",
	index = 0,
}: {
	size?: "large" | "small";
	index?: number;
}) {
	const t = useTheme();
	const isSmall = size === "small";
	return (
		<div
			style={{
				borderRadius: 999,
				border: "1px solid black",
				borderWidth: 1,
				...t.atoms.border_contrast_medium,
				...t.atoms.bg_contrast_25,

				...(isSmall
					? {
							width: index % 2 === 0 ? 75 : 90,
							height: 27,
						}
					: {
							width: index % 2 === 0 ? 90 : 110,
							height: 36,
						}),
			}}
		/>
	);
}

export function TrendingTopicLink({
	topic: raw,
	children,
	...rest
}: {
	topic: TrendingTopicType;
} & Omit<LinkProps, "to" | "label">) {
	const topic = useTopic(raw);

	return (
		<InternalLink label={topic.label} to={topic.url} {...rest}>
			{children}
		</InternalLink>
	);
}

type ParsedTrendingTopic =
	| {
			type: "topic" | "tag" | "starter-pack" | "unknown";
			label: string;
			displayName: string;
			url: string;
			uri: undefined;
	  }
	| {
			type: "profile" | "feed";
			label: string;
			displayName: string;
			url: string;
			uri: AtUri;
	  };

function useTopic(raw: TrendingTopicType): ParsedTrendingTopic {
	return React.useMemo(() => {
		const { topic: displayName, link } = raw;

		if (link.startsWith("/search")) {
			return {
				type: "topic",
				label: `Browse posts about ${displayName}`,
				displayName,
				uri: undefined,
				url: link,
			};
		} else if (link.startsWith("/hashtag")) {
			return {
				type: "tag",
				label: `Browse posts tagged with ${displayName}`,
				displayName,
				// displayName: displayName.replace(/^#/, ''),
				uri: undefined,
				url: link,
			};
		} else if (link.startsWith("/starter-pack")) {
			return {
				type: "starter-pack",
				label: `Browse starter pack ${displayName}`,
				displayName,
				uri: undefined,
				url: link,
			};
		}

		/*
    if (!link.startsWith('at://')) {
      // above logic
    } else {
      const urip = new AtUri(link)
      switch (urip.collection) {
        case 'app.bsky.actor.profile': {
          return {
            type: 'profile',
            label: `View ${displayName}'s profile`,
            displayName,
            uri: urip,
            url: makeProfileLink({did: urip.host, handle: urip.host}),
          }
        }
        case 'app.bsky.feed.generator': {
          return {
            type: 'feed',
            label: `Browse the ${displayName} feed`,
            displayName,
            uri: urip,
            url: feedUriToHref(link),
          }
        }
      }
    }
     */

		return {
			type: "unknown",
			label: `Browse topic ${displayName}`,
			displayName,
			uri: undefined,
			url: link,
		};
	}, [raw]);
}
