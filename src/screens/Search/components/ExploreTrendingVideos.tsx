import { AppBskyEmbedVideo, AtUri } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { atoms as a, tokens, useGutters, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { GradientFill } from "#/components/GradientFill";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { CompactVideoPostCard, CompactVideoPostCardPlaceholder } from "#/components/VideoPostCard";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "#/components/icons/Chevron";
import { Pin_Stroke2_Corner0_Rounded as Pin } from "#/components/icons/Pin";
import { Trending2_Stroke2_Corner2_Rounded as Graph } from "#/components/icons/Trending2";
import { VIDEO_FEED_URI } from "#/lib/constants";
import { makeCustomFeedLink } from "#/lib/routes/links";
import { useSavedFeeds } from "#/state/queries/feed";
import { RQKEY, usePostFeedQuery } from "#/state/queries/post-feed";
import { useAddSavedFeedsMutation } from "#/state/queries/preferences";

const CARD_WIDTH = 100;

const FEED_DESC = `feedgen|${VIDEO_FEED_URI}`;
const FEED_PARAMS: {
	feedCacheKey: "explore";
} = {
	feedCacheKey: "explore",
};

export function ExploreTrendingVideos() {
	const t = useTheme();
	const gutters = useGutters([0, "base"]);
	const { data, isLoading, error } = usePostFeedQuery(FEED_DESC, FEED_PARAMS);

	// Refetch on tab change if nothing else is using this query.
	const queryClient = useQueryClient();
	useFocusEffect(() => {
		return () => {
			const query = queryClient.getQueryCache().find({ queryKey: RQKEY(FEED_DESC, FEED_PARAMS) });
			if (query && query.getObserversCount() <= 1) {
				query.fetch();
			}
		};
	});

	const { data: saved } = useSavedFeeds();
	const isSavedAlready = React.useMemo(() => {
		return !!saved?.feeds?.some((info) => info.config.value === VIDEO_FEED_URI);
	}, [saved]);

	const { mutateAsync: addSavedFeeds, isPending: isPinPending } = useAddSavedFeedsMutation();
	const pinFeed = React.useCallback(
		(e: any) => {
			e.preventDefault();

			addSavedFeeds([
				{
					type: "feed",
					value: VIDEO_FEED_URI,
					pinned: true,
				},
			]);

			// prevent navigation
			return false;
		},
		[addSavedFeeds],
	);

	if (error) {
		return null;
	}

	return (
		<div style={{ paddingBottom: 20 }}>
			<div
				style={{
					flexDirection: "row",
					paddingLeft: 16,
					paddingRight: 16,
					paddingBottom: 16,
					paddingTop: 24,
					gap: 12,
					borderBottom: "1px solid black",
					...t.atoms.border_contrast_low,
				}}
			>
				<div
					style={{
						flex: 1,
						gap: 8,
					}}
				>
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
					>
						<Graph size="lg" fill={t.palette.primary_500} style={{ marginLeft: -2 }} />
						<Text
							style={{
								fontSize: 22,
								letterSpacing: 0,
								fontWeight: "800",
								...t.atoms.text,
							}}
						>
							Trending Videos
						</Text>
						<div
							style={{
								paddingTop: 4,
								paddingBottom: 4,
								paddingLeft: 8,
								paddingRight: 8,
								borderRadius: 8,
								overflow: "hidden",
							}}
						>
							<GradientFill gradient={tokens.gradients.primary} />
							<Text
								style={{
									fontSize: 14,
									letterSpacing: 0,
									fontWeight: "800",
									...{ color: "white" },
								}}
							>
								BETA
							</Text>
						</div>
					</div>
					<Text
						style={{
							...t.atoms.text_contrast_high,
							lineHeight: 1.3,
						}}
					>
						Popular videos in your network.
					</Text>
				</div>
			</div>
			<div
			// ScrollView
			// horizontal
			// showsHorizontalScrollIndicator={false}
			// decelerationRate="fast"
			// snapToInterval={CARD_WIDTH + tokens.space.sm}
			>
				<div
					style={{
						paddingTop: 16,
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
			{!isSavedAlready && (
				<div
					style={{
						...gutters,
						paddingTop: 16,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 20,
					}}
				>
					<Text
						style={{
							flex: 1,
							fontSize: 14,
							letterSpacing: 0,
							lineHeight: 1.3,
						}}
					>
						Pin the trending videos feed to your home screen for easy access
					</Text>
					<Button
						disabled={isPinPending}
						label={"Pin"}
						size="small"
						variant="outline"
						color="secondary"
						onPress={pinFeed}
					>
						<ButtonText>{"Pin"}</ButtonText>
						<ButtonIcon icon={Pin} position="right" />
					</Button>
				</div>
			)}
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
		return makeCustomFeedLink(urip.host, urip.rkey, undefined, "explore");
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
							sourceInterstitial: "explore",
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
						...t.atoms.bg_contrast_25,
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
							<Text style={{ fontSize:16 }}>View more</Text>
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
