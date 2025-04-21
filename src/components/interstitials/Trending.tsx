import React from "react";

import { useGutters, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import * as Prompt from "#/components/Prompt";
import { TrendingTopicLink } from "#/components/TrendingTopics";
import { Text } from "#/components/Typography";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Trending2_Stroke2_Corner2_Rounded as Graph } from "#/components/icons/Trending2";
import { useTrendingSettings, useTrendingSettingsApi } from "#/state/preferences/trending";
import { useTrendingTopics } from "#/state/queries/trending/useTrendingTopics";
import { useTrendingConfig } from "#/state/trending-config";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";

export function TrendingInterstitial() {
	const { enabled } = useTrendingConfig();
	const { trendingDisabled } = useTrendingSettings();
	return enabled && !trendingDisabled ? <Inner /> : null;
}

function Inner() {
	const t = useTheme();
	const gutters = useGutters([0, "base", 0, "base"]);
	const trendingPrompt = Prompt.usePromptControl();
	const { setTrendingDisabled } = useTrendingSettingsApi();
	const { data: trending, error, isLoading } = useTrendingTopics();
	const noTopics = !isLoading && !error && !trending?.topics?.length;

	const onConfirmHide = React.useCallback(() => {
		setTrendingDisabled(true);
	}, [setTrendingDisabled]);

	return error || noTopics ? null : (
		<div
			style={{
				...t.atoms.border_contrast_low,
				borderTop: "1px solid black",
				borderTopWidth: 1,
			}}
		>
			<div
			// ScrollView
			//  horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast"
			>
				<div
					style={{
						...gutters,
						flexDirection: "row",
						alignItems: "center",
						gap: 16,
					}}
				>
					<div style={{ paddingLeft: 4, paddingRight: 2 }}>
						<Graph size="sm" />
					</div>
					{isLoading ? (
						<div
							style={{
								paddingTop: 16,
								paddingBottom: 16,
								flexDirection: "row",
								gap: 16,
								alignItems: "center",
							}}
						>
							<LoadingPlaceholder width={80} height={undefined} style={{ alignSelf: "stretch" }} />
							<LoadingPlaceholder width={50} height={undefined} style={{ alignSelf: "stretch" }} />
							<LoadingPlaceholder width={120} height={undefined} style={{ alignSelf: "stretch" }} />
							<LoadingPlaceholder width={30} height={undefined} style={{ alignSelf: "stretch" }} />
							<LoadingPlaceholder width={180} height={undefined} style={{ alignSelf: "stretch" }} />
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									fontSize: 14,
									letterSpacing: 0,
									fontWeight: "600",
								}}
							>
								{" "}
							</Text>
						</div>
					) : !trending?.topics ? null : (
						<>
							{trending.topics.map((topic) => (
								<TrendingTopicLink key={topic.link} topic={topic}>
									<div style={{ paddingTop: 16, paddingBottom: 16 }}>
										<Text
											style={{
												...t.atoms.text,
												fontSize: 14,
												letterSpacing: 0,
												fontWeight: "600",

												...// NOTE: we use opacity 0.7 instead of a color to match the color of the home pager tab bar
												{ opacity: 0.7 },
											}}
										>
											{topic.topic}
										</Text>
									</div>
								</TrendingTopicLink>
							))}
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
		</div>
	);
}
