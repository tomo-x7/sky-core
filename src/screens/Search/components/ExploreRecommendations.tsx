import type { AppBskyUnspeccedDefs } from "@atproto/api";

import { useGutters, useTheme } from "#/alf";
import { TrendingTopic, TrendingTopicLink, TrendingTopicSkeleton } from "#/components/TrendingTopics";
import { Text } from "#/components/Typography";
import { Hashtag_Stroke2_Corner0_Rounded } from "#/components/icons/Hashtag";
import { DEFAULT_LIMIT as RECOMMENDATIONS_COUNT, useTrendingTopics } from "#/state/queries/trending/useTrendingTopics";
import { useTrendingConfig } from "#/state/trending-config";

export function ExploreRecommendations() {
	const { enabled } = useTrendingConfig();
	return enabled ? <Inner /> : null;
}

function Inner() {
	const t = useTheme();
	const gutters = useGutters([0, "compact"]);
	const { data: trending, error, isLoading } = useTrendingTopics();
	const noRecs = !isLoading && !error && !trending?.suggested?.length;
	const allFeeds = trending?.suggested && isAllFeeds(trending.suggested);

	return error || noRecs ? null : (
		<>
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
						<Hashtag_Stroke2_Corner0_Rounded
							size="lg"
							fill={t.palette.primary_500}
							style={{ marginLeft: -2 }}
						/>
						<Text
							style={{
								fontSize: 22,
								letterSpacing: 0,
								fontWeight: "800",
								...t.atoms.text,
							}}
						>
							Recommended
						</Text>
					</div>
					{!allFeeds ? (
						<Text
							style={{
								...t.atoms.text_contrast_high,
								lineHeight: 1.3,
							}}
						>
							Content from across the network we think you might like.
						</Text>
					) : (
						<Text
							style={{
								...t.atoms.text_contrast_high,
								lineHeight: 1.3,
							}}
						>
							Feeds we think you might like.
						</Text>
					)}
				</div>
			</div>

			<div
				style={{
					paddingTop: 12,
					paddingBottom: 16,
				}}
			>
				<div
					style={{
						flexDirection: "row",
						justifyContent: "flex-start",
						flexWrap: "wrap",
						...{ rowGap: 8, columnGap: 6 },
						...gutters,
					}}
				>
					{isLoading ? (
						Array(RECOMMENDATIONS_COUNT)
							.fill(0)
							.map((_, i) => <TrendingTopicSkeleton key={i.toString()} index={i} />)
					) : !trending?.suggested ? null : (
						<>
							{trending.suggested.map((topic) => (
								<TrendingTopicLink key={topic.link} topic={topic}>
									{({ hovered }) => (
										<TrendingTopic
											topic={topic}
											style={
												hovered
													? {
															...t.atoms.border_contrast_high,
															...t.atoms.bg_contrast_25,
														}
													: {}
											}
										/>
									)}
								</TrendingTopicLink>
							))}
						</>
					)}
				</div>
			</div>
		</>
	);
}

function isAllFeeds(topics: AppBskyUnspeccedDefs.TrendingTopic[]) {
	return topics.every((topic) => {
		const segments = topic.link.split("/").slice(1);
		return segments[0] === "profile" && segments[2] === "feed";
	});
}
