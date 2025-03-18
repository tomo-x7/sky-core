import {
	type AppBskyLabelerDefs,
	type InterpretedLabelValueDefinition,
	type ModerationOpts,
	interpretLabelValueDefinitions,
} from "@atproto/api";
import React from "react";
import { findNodeHandle } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Divider } from "#/components/Divider";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { LabelerLabelPreference } from "#/components/moderation/LabelPreference";
import { useScrollHandlers } from "#/lib/ScrollContext";
import { useAnimatedScrollHandler } from "#/lib/hooks/useAnimatedScrollHandler_FIXED";
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
	setScrollViewTag: (tag: number | null) => void;
}
export const ProfileLabelsSection = React.forwardRef<SectionRef, LabelsSectionProps>(function LabelsSectionImpl(
	{
		isLabelerLoading,
		labelerInfo,
		labelerError,
		moderationOpts,
		scrollElRef,
		headerHeight,
		isFocused,
		setScrollViewTag,
	},
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

	React.useEffect(() => {
		if (isFocused && scrollElRef.current) {
			const nativeTag = findNodeHandle(scrollElRef.current);
			setScrollViewTag(nativeTag);
		}
	}, [isFocused, scrollElRef, setScrollViewTag]);

	return (
		<Layout.Center style={{ flex: 1, minHeight: "100dvh" }}>
			{isLabelerLoading ? (
				<div
					style={{
						...a.w_full,
						...a.align_center,
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
	const scrollHandler = useAnimatedScrollHandler({
		onBeginDrag(e, ctx) {
			onBeginDragFromContext?.(e, ctx);
		},
		onEndDrag(e, ctx) {
			onEndDragFromContext?.(e, ctx);
		},
		onScroll(e, ctx) {
			onScrollFromContext?.(e, ctx);
		},
		onMomentumEnd(e, ctx) {
			onMomentumEndFromContext?.(e, ctx);
		},
	});

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
			// @ts-expect-error TODO fix this
			ref={scrollElRef}
			scrollEventThrottle={1}
			contentContainerStyle={{
				paddingTop: headerHeight,
				borderWidth: 0,
			}}
			contentOffset={{ x: 0, y: headerHeight * -1 }}
			onScroll={scrollHandler}
		>
			<div
				style={{
					...a.pt_xl,
					...a.px_lg,
					...a.border_t,
					...t.atoms.border_contrast_low,
				}}
			>
				<div>
					<Text
						style={{
							...t.atoms.text_contrast_high,
							...a.leading_snug,
							...a.text_sm,
						}}
					>
						Labels are annotations on users and content. They can be used to hide, warn, and categorize the
						network.
					</Text>
					{labelerInfo.creator.viewer?.blocking ? (
						<div
							style={{
								...a.flex_row,
								...a.gap_sm,
								...a.align_center,
								...a.mt_md,
							}}
						>
							<CircleInfo size="sm" fill={t.atoms.text_contrast_medium.color} />
							<Text
								style={{
									...t.atoms.text_contrast_high,
									...a.leading_snug,
									...a.text_sm,
								}}
							>
								Blocking does not prevent this labeler from placing labels on your account.
							</Text>
						</div>
					) : null}
					{labelValues.length === 0 ? (
						<Text
							style={{
								...a.pt_xl,
								...t.atoms.text_contrast_high,
								...a.leading_snug,
								...a.text_sm,
							}}
						>
							This labeler hasn't declared what labels it publishes, and may not be active.
						</Text>
					) : !isSubscribed ? (
						<Text
							style={{
								...a.pt_xl,
								...t.atoms.text_contrast_high,
								...a.leading_snug,
								...a.text_sm,
							}}
						>
							<>Subscribe to @{labelerInfo.creator.handle} to use these labels:</>
						</Text>
					) : null}
				</div>
				{labelDefs.length > 0 && (
					<div
						style={{
							...a.mt_xl,
							...a.w_full,
							...a.rounded_md,
							...a.overflow_hidden,
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
