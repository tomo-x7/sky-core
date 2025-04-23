import React from "react";

import { tokens, useGutters, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { GradientFill } from "#/components/GradientFill";
import * as Prompt from "#/components/Prompt";
import { TrendingTopic, TrendingTopicLink, TrendingTopicSkeleton } from "#/components/TrendingTopics";
import { Text } from "#/components/Typography";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Trending2_Stroke2_Corner2_Rounded as Trending } from "#/components/icons/Trending2";
import { useTrendingSettings, useTrendingSettingsApi } from "#/state/preferences/trending";
import { DEFAULT_LIMIT as TRENDING_TOPICS_COUNT, useTrendingTopics } from "#/state/queries/trending/useTrendingTopics";
import { useTrendingConfig } from "#/state/trending-config";

export function ExploreTrendingTopics() {
	const { enabled } = useTrendingConfig();
	const { trendingDisabled } = useTrendingSettings();
	return enabled && !trendingDisabled ? <Inner /> : null;
}

function Inner() {
	const t = useTheme();
	const gutters = useGutters([0, "compact"]);
	const { data: trending, error, isLoading } = useTrendingTopics();
	const noTopics = !isLoading && !error && !trending?.topics?.length;
	const { setTrendingDisabled } = useTrendingSettingsApi();
	const trendingPrompt = Prompt.usePromptControl();

	const onConfirmHide = React.useCallback(() => {
		setTrendingDisabled(true);
	}, [setTrendingDisabled]);

	return error || noTopics ? null : (
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
						<Trending size="lg" fill={t.palette.primary_500} style={{ marginLeft: -2 }} />
						<Text
							style={{
								fontSize: 22,
								letterSpacing: 0,
								fontWeight: "800",
								...t.atoms.text,
							}}
						>
							Trending
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
						What people are posting about.
					</Text>
				</div>
				<Button
					label={"Hide trending topics"}
					size="small"
					variant="ghost"
					color="secondary"
					shape="round"
					onPress={() => trendingPrompt.open()}
				>
					<ButtonIcon icon={X} />
				</Button>
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
						Array(TRENDING_TOPICS_COUNT)
							.fill(0)
							.map((_, i) => <TrendingTopicSkeleton key={i.toString()} index={i} />)
					) : !trending?.topics ? null : (
						<>
							{trending.topics.map((topic) => (
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

			<Prompt.Basic
				control={trendingPrompt}
				title={"Hide trending topics?"}
				description={"You can update this later from your settings."}
				confirmButtonCta={"Hide"}
				onConfirm={onConfirmHide}
			/>
		</>
	);
}
