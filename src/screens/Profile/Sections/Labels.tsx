import {
	type AppBskyLabelerDefs,
	type InterpretedLabelValueDefinition,
	type ModerationOpts,
	interpretLabelValueDefinitions,
} from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import { Divider } from "#/components/Divider";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { LabelerLabelPreference } from "#/components/moderation/LabelPreference";
import { useScrollHandlers } from "#/lib/ScrollContext";
import { isLabelerSubscribed, lookupLabelValueDefinition } from "#/lib/moderation";
import type { ListRef } from "#/view/com/util/List";
import { ErrorState } from "../ErrorState";
import type { SectionRef } from "./types";

interface LabelsSectionProps {
	isLabelerLoading: boolean;
	labelerInfo: AppBskyLabelerDefs.LabelerViewDetailed | undefined;
	labelerError: Error | null;
	moderationOpts: ModerationOpts;
	scrollElRef: ListRef;
	headerHeight: number;
	isFocused: boolean;
}
export const ProfileLabelsSection = React.forwardRef<SectionRef, LabelsSectionProps>(function LabelsSectionImpl(
	{ isLabelerLoading, labelerInfo, labelerError, moderationOpts, scrollElRef, headerHeight, isFocused },
	ref,
) {
	const onScrollToTop = React.useCallback(() => {
		scrollElRef.current?.scrollTo({
			animated: false,
			x: 0,
			y: -headerHeight,
		});
	}, [scrollElRef, headerHeight]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: onScrollToTop,
	}));

	return (
		<Layout.Center style={{ flex: 1, minHeight: "100dvh" }}>
			{isLabelerLoading ? (
				<div
					style={{
						width: "100%",
						alignItems: "center",
					}}
				>
					<Loader size="xl" />
				</div>
			) : labelerError || !labelerInfo ? (
				<ErrorState error={labelerError?.toString() || "Something went wrong, please try again."} />
			) : (
				<ProfileLabelsSectionInner
					moderationOpts={moderationOpts}
					labelerInfo={labelerInfo}
					scrollElRef={scrollElRef}
					headerHeight={headerHeight}
				/>
			)}
		</Layout.Center>
	);
});

export function ProfileLabelsSectionInner({
	moderationOpts,
	labelerInfo,
	scrollElRef,
	headerHeight,
}: {
	moderationOpts: ModerationOpts;
	labelerInfo: AppBskyLabelerDefs.LabelerViewDetailed;
	scrollElRef: ListRef;
	headerHeight: number;
}) {
	const t = useTheme();

	// Intentionally destructured outside the main thread closure.
	// See https://github.com/bluesky-social/social-app/pull/4108.
	const {
		onBeginDrag: onBeginDragFromContext,
		onEndDrag: onEndDragFromContext,
		onScroll: onScrollFromContext,
		onMomentumEnd: onMomentumEndFromContext,
	} = useScrollHandlers();
	// const scrollHandler = useAnimatedScrollHandler({
	// 	onBeginDrag(e, ctx) {
	// 		onBeginDragFromContext?.(e, ctx);
	// 	},
	// 	onEndDrag(e, ctx) {
	// 		onEndDragFromContext?.(e, ctx);
	// 	},
	// 	onScroll(e, ctx) {
	// 		onScrollFromContext?.(e, ctx);
	// 	},
	// 	onMomentumEnd(e, ctx) {
	// 		onMomentumEndFromContext?.(e, ctx);
	// 	},
	// });

	const { labelValues } = labelerInfo.policies;
	const isSubscribed = isLabelerSubscribed(labelerInfo, moderationOpts);
	const labelDefs = React.useMemo(() => {
		const customDefs = interpretLabelValueDefinitions(labelerInfo);
		return labelValues
			.map((val) => lookupLabelValueDefinition(val, customDefs))
			.filter((def) => def?.configurable) as InterpretedLabelValueDefinition[];
	}, [labelerInfo, labelValues]);

	return (
		<Layout.Content
			ref={scrollElRef}
			// scrollEventThrottle={1}
			contentContainerStyle={{
				paddingTop: headerHeight,
				borderWidth: 0,
			}}
			// contentOffset={{ x: 0, y: headerHeight * -1 }}
			// onScroll={scrollHandler}
		>
			<div
				style={{
					paddingTop: 20,
					paddingLeft: 16,
					paddingRight: 16,
					borderTop: "1px solid black",
					borderTopWidth: 1,
					...t.atoms.border_contrast_low,
				}}
			>
				<div>
					<Text
						style={{
							...t.atoms.text_contrast_high,
							lineHeight: 1.3,
							fontSize: 14,
							letterSpacing: 0,
						}}
					>
						Labels are annotations on users and content. They can be used to hide, warn, and categorize the
						network.
					</Text>
					{labelerInfo.creator.viewer?.blocking ? (
						<div
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
								marginTop: 12,
							}}
						>
							<CircleInfo size="sm" fill={t.atoms.text_contrast_medium.color} />
							<Text
								style={{
									...t.atoms.text_contrast_high,
									lineHeight: 1.3,
									fontSize: 14,
									letterSpacing: 0,
								}}
							>
								Blocking does not prevent this labeler from placing labels on your account.
							</Text>
						</div>
					) : null}
					{labelValues.length === 0 ? (
						<Text
							style={{
								paddingTop: 20,
								...t.atoms.text_contrast_high,
								lineHeight: 1.3,
								fontSize: 14,
								letterSpacing: 0,
							}}
						>
							This labeler hasn't declared what labels it publishes, and may not be active.
						</Text>
					) : !isSubscribed ? (
						<Text
							style={{
								paddingTop: 20,
								...t.atoms.text_contrast_high,
								lineHeight: 1.3,
								fontSize: 14,
								letterSpacing: 0,
							}}
						>
							<>Subscribe to @{labelerInfo.creator.handle} to use these labels:</>
						</Text>
					) : null}
				</div>
				{labelDefs.length > 0 && (
					<div
						style={{
							marginTop: 20,
							width: "100%",
							borderRadius: 12,
							overflow: "hidden",
							...t.atoms.bg_contrast_25,
						}}
					>
						{labelDefs.map((labelDef, i) => {
							return (
								<React.Fragment key={labelDef.identifier}>
									{i !== 0 && <Divider />}
									<LabelerLabelPreference
										disabled={isSubscribed ? undefined : true}
										labelDefinition={labelDef}
										labelerDid={labelerInfo.creator.did}
									/>
								</React.Fragment>
							);
						})}
					</div>
				)}
				<div style={{ height: 100 }} />
			</div>
		</Layout.Content>
	);
}
