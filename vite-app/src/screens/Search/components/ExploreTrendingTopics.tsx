import React from "react";

import { atoms as a, tokens, useGutters, useTheme } from "#/alf";
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
					...a.flex_row,
					...a.px_lg,
					...a.py_lg,
					...a.pt_2xl,
					...a.gap_md,
					...a.border_b,
					...t.atoms.border_contrast_low,
				}}
			>
				<div
					style={{
						...a.flex_1,
						...a.gap_sm,
					}}
				>
					<div
						style={{
							...a.flex_row,
							...a.align_center,
							...a.gap_sm,
						}}
					>
						<Trending size="lg" fill={t.palette.primary_500} style={{ marginLeft: -2 }} />
						<Text
							style={{
								...a.text_2xl,
								...a.font_heavy,
								...t.atoms.text,
							}}
						>
							Trending
						</Text>
						<div
							style={{
								...a.py_xs,
								...a.px_sm,
								...a.rounded_sm,
								...a.overflow_hidden,
							}}
						>
							<GradientFill gradient={tokens.gradients.primary} />
							<Text
								style={{
									...a.text_sm,
									...a.font_heavy,
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
							...a.leading_snug,
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
					...a.pt_md,
					...a.pb_lg,
				}}
			>
				<div
					style={{
						...a.flex_row,
						...a.justify_start,
						...a.flex_wrap,
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
													? { ...t.atoms.border_contrast_high, ...t.atoms.bg_contrast_25 }
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
