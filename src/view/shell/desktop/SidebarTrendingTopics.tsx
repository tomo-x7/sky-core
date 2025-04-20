import React from "react";

import { flatten, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Divider } from "#/components/Divider";
import * as Prompt from "#/components/Prompt";
import { TrendingTopic, TrendingTopicLink, TrendingTopicSkeleton } from "#/components/TrendingTopics";
import { Text } from "#/components/Typography";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Trending2_Stroke2_Corner2_Rounded as Graph } from "#/components/icons/Trending2";
import { useTrendingSettings, useTrendingSettingsApi } from "#/state/preferences/trending";
import { useTrendingTopics } from "#/state/queries/trending/useTrendingTopics";
import { useTrendingConfig } from "#/state/trending-config";

const TRENDING_LIMIT = 6;

export function SidebarTrendingTopics() {
	const { enabled } = useTrendingConfig();
	const { trendingDisabled } = useTrendingSettings();
	return !enabled ? null : trendingDisabled ? null : <Inner />;
}

function Inner() {
	const t = useTheme();
	const trendingPrompt = Prompt.usePromptControl();
	const { setTrendingDisabled } = useTrendingSettingsApi();
	const { data: trending, error, isLoading } = useTrendingTopics();
	const noTopics = !isLoading && !error && !trending?.topics?.length;

	const onConfirmHide = React.useCallback(() => {
		setTrendingDisabled(true);
	}, [setTrendingDisabled]);

	return error || noTopics ? null : (
		<>
			<div
				style={{
					gap: 8,
					...{ paddingBottom: 2 },
				}}
			>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 4,
					}}
				>
					<Graph size="sm" />
					<Text
						style={{
							flex: 1,
							fontSize: 14,
							letterSpacing: 0,
							fontWeight: "600",
							...t.atoms.text_contrast_medium,
						}}
					>
						Trending
					</Text>
					<Button
						label={"Hide trending topics"}
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
					style={{
						flexDirection: "row",
						flexWrap: "wrap",
						...{ gap: "6px 4px" },
					}}
				>
					{isLoading ? (
						Array(TRENDING_LIMIT)
							.fill(0)
							.map((_n, i) => <TrendingTopicSkeleton key={i} size="small" index={i} />)
					) : !trending?.topics ? null : (
						<>
							{trending.topics.slice(0, TRENDING_LIMIT).map((topic) => (
								<TrendingTopicLink key={topic.link} topic={topic}>
									{({ hovered }) => (
										<TrendingTopic
											size="small"
											topic={topic}
											style={flatten(
												hovered && [t.atoms.border_contrast_high, t.atoms.bg_contrast_25],
											)}
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
			<Divider />
		</>
	);
}
