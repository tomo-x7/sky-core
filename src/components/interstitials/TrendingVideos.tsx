import { AppBskyEmbedVideo, AtUri } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

import { useGutters, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Link } from "#/components/Link";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { CompactVideoPostCard, CompactVideoPostCardPlaceholder } from "#/components/VideoPostCard";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "#/components/icons/Chevron";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Trending2_Stroke2_Corner2_Rounded as Graph } from "#/components/icons/Trending2";
import { VIDEO_FEED_URI } from "#/lib/constants";
import { makeCustomFeedLink } from "#/lib/routes/links";
import { useTrendingSettingsApi } from "#/state/preferences/trending";
import { usePostFeedQuery } from "#/state/queries/post-feed";
import { RQKEY } from "#/state/queries/post-feed";

const CARD_WIDTH = 100;

const FEED_DESC = `feedgen|${VIDEO_FEED_URI}`;
const FEED_PARAMS: {
	feedCacheKey: "discover";
} = {
	feedCacheKey: "discover",
};

export function TrendingVideos() {
	const t = useTheme();
	const gutters = useGutters([0, "base"]);
	const { data, isLoading, error } = usePostFeedQuery(FEED_DESC, FEED_PARAMS);

	// Refetch on unmount if nothing else is using this query.
	const queryClient = useQueryClient();
	useEffect(() => {
		return () => {
			const query = queryClient.getQueryCache().find({ queryKey: RQKEY(FEED_DESC, FEED_PARAMS) });
			if (query && query.getObserversCount() <= 1) {
				query.fetch();
			}
		};
	}, [queryClient]);

	const { setTrendingVideoDisabled } = useTrendingSettingsApi();
	const trendingPrompt = Prompt.usePromptControl();

	const onConfirmHide = React.useCallback(() => {
		setTrendingVideoDisabled(true);
	}, [setTrendingVideoDisabled]);

	if (error) {
		return null;
	}

	return (
		<div
			style={{
				paddingTop: 16,
				paddingBottom: 16,
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
				...t.atoms.bg_contrast_25,
			}}
		>
			<div
				style={{
					...gutters,
					paddingBottom: 8,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						gap: 4,
					}}
				>
					<Graph />
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							lineHeight: 1.3,
						}}
					>
						Trending Videos
					</Text>
				</div>
				<Button
					label={"Dismiss this section"}
					size="tiny"
					variant="ghost"
					color="secondary"
					shape="round"
					onPress={() => trendingPrompt.open()}
				>
					<ButtonIcon icon={X} />
				</Button>
			</div>
			<div
			// ScrollView
			// horizontal
			// showsHorizontalScrollIndicator={false}
			// decelerationRate="fast"
			// snapToInterval={CARD_WIDTH + atoms.gap_sm.gap}
			>
				<div
					style={{
						flexDirection: "row",
						gap: 8,

						...{
							paddingLeft: gutters.paddingLeft,
							paddingRight: gutters.paddingRight,
						},
					}}
				>
					{isLoading ? (
						Array(10)
							.fill(0)
							.map((_, i) => (
								<div key={i.toString()} style={{ width: CARD_WIDTH }}>
									<CompactVideoPostCardPlaceholder />
								</div>
							))
					) : error || !data ? (
						<Text>Whoops! Trending videos failed to load.</Text>
					) : (
						<VideoCards data={data} />
					)}
				</div>
			</div>
			<Prompt.Basic
				control={trendingPrompt}
				title={"Hide trending videos?"}
				description={"You can update this later from your settings."}
				confirmButtonCta={"Hide"}
				onConfirm={onConfirmHide}
			/>
		</div>
	);
}

function VideoCards({
	data,
}: {
	data: Exclude<ReturnType<typeof usePostFeedQuery>["data"], undefined>;
}) {
	const t = useTheme();
	const items = React.useMemo(() => {
		return data.pages
			.flatMap((page) => page.slices)
			.map((slice) => slice.items[0])
			.filter(Boolean)
			.filter((item) => AppBskyEmbedVideo.isView(item.post.embed))
			.slice(0, 8);
	}, [data]);
	const href = React.useMemo(() => {
		const urip = new AtUri(VIDEO_FEED_URI);
		return makeCustomFeedLink(urip.host, urip.rkey, undefined, "discover");
	}, []);

	return (
		<>
			{items.map((item) => (
				<div key={item.post.uri} style={{ width: CARD_WIDTH }}>
					<CompactVideoPostCard
						post={item.post}
						moderation={item.moderation}
						sourceContext={{
							type: "feedgen",
							uri: VIDEO_FEED_URI,
							sourceInterstitial: "discover",
						}}
					/>
				</div>
			))}
			<div style={{ width: CARD_WIDTH * 2 }}>
				<Link
					to={href}
					label={"View more"}
					style={{
						justifyContent: "center",
						alignItems: "center",
						flex: 1,
						borderRadius: 12,
						...t.atoms.bg,
					}}
				>
					{({ pressed }) => (
						<div
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 12,

								...{
									opacity: pressed ? 0.6 : 1,
								},
							}}
						>
							<Text style={{ fontSize: 16 }}>View more</Text>
							<div
								style={{
									alignItems: "center",
									justifyContent: "center",
									borderRadius: 999,

									...{
										width: 34,
										height: 34,
										backgroundColor: t.palette.primary_500,
									},
								}}
							>
								<ButtonIcon icon={ChevronRight} />
							</div>
						</div>
					)}
				</Link>
			</div>
		</>
	);
}
