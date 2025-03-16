import type { AppBskyLabelerDefs } from "@atproto/api";
import React from "react";
import { Pressable, View } from "react-native";
import type { ScrollView } from "react-native-gesture-handler";

import { atoms as a, useGutters, useTheme } from "#/alf";
import * as Admonition from "#/components/Admonition";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText, Link, createStaticClick } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useDelayedLoading } from "#/components/hooks/useDelayedLoading";
import { ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as Retry } from "#/components/icons/ArrowRotateCounterClockwise";
import {
	CheckThick_Stroke2_Corner0_Rounded as Check,
	Check_Stroke2_Corner0_Rounded as CheckThin,
} from "#/components/icons/Check";
import { PaperPlane_Stroke2_Corner0_Rounded as PaperPlane } from "#/components/icons/PaperPlane";
import { SquareArrowTopRight_Stroke2_Corner0_Rounded as SquareArrowTopRight } from "#/components/icons/SquareArrowTopRight";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { wait } from "#/lib/async/wait";
import { getLabelingServiceTitle } from "#/lib/moderation";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useMyLabelersQuery } from "#/state/queries/preferences";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { useSubmitReportMutation } from "./action";
import { DMCA_LINK } from "./const";
import { useCopyForSubject } from "./copy";
import { initialState, reducer } from "./state";
import type { ReportDialogProps, ReportSubject } from "./types";
import { parseReportSubject } from "./utils/parseReportSubject";
import { type ReportOption, useReportOptions } from "./utils/useReportOptions";

export { useDialogControl as useReportDialogControl } from "#/components/Dialog";

export function ReportDialog(
	props: Omit<ReportDialogProps, "subject"> & {
		subject: ReportSubject;
	},
) {
	const subject = React.useMemo(() => parseReportSubject(props.subject), [props.subject]);

	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			{subject ? <Inner {...props} subject={subject} /> : <Invalid />}
		</Dialog.Outer>
	);
}

/**
 * This should only be shown if the dialog is configured incorrectly by a
 * developer, but nevertheless we should have a graceful fallback.
 */
function Invalid() {
	return (
		<Dialog.ScrollableInner label={"Report dialog"}>
			<Text
				style={{
					...a.font_heavy,
					...a.text_xl,
					...a.leading_snug,
					...a.pb_xs,
				}}
			>
				Invalid report subject
			</Text>
			<Text
				style={{
					...a.text_md,
					...a.leading_snug,
				}}
			>
				Something wasn't quite right with the data you're trying to report. Please contact support.
			</Text>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}

function Inner(props: ReportDialogProps) {
	const t = useTheme();
	const ref = React.useRef<ScrollView>(null);
	const {
		data: allLabelers,
		isLoading: isLabelerLoading,
		error: labelersLoadError,
		refetch: refetchLabelers,
	} = useMyLabelersQuery({ excludeNonConfigurableLabelers: true });
	const isLoading = useDelayedLoading(500, isLabelerLoading);
	const copy = useCopyForSubject(props.subject);
	const reportOptions = useReportOptions();
	const [state, dispatch] = React.useReducer(reducer, initialState);

	/**
	 * Submission handling
	 */
	const { mutateAsync: submitReport } = useSubmitReportMutation();
	const [isPending, setPending] = React.useState(false);
	const [isSuccess, setSuccess] = React.useState(false);

	/**
	 * Labelers that support this `subject` and its NSID collection
	 */
	const supportedLabelers = React.useMemo(() => {
		if (!allLabelers) return [];
		return allLabelers
			.filter((l) => {
				const subjectTypes: string[] | undefined = l.subjectTypes;
				if (subjectTypes === undefined) return true;
				if (props.subject.type === "account") {
					return subjectTypes.includes("account");
				} else if (props.subject.type === "chatMessage") {
					return subjectTypes.includes("chat");
				} else {
					return subjectTypes.includes("record");
				}
			})
			.filter((l) => {
				const collections: string[] | undefined = l.subjectCollections;
				if (collections === undefined) return true;
				// all chat collections accepted, since only Bluesky handles chats
				if (props.subject.type === "chatMessage") return true;
				return collections.includes(props.subject.nsid);
			})
			.filter((l) => {
				if (!state.selectedOption) return true;
				const reasonTypes: string[] | undefined = l.reasonTypes;
				if (reasonTypes === undefined) return true;
				return reasonTypes.includes(state.selectedOption.reason);
			});
	}, [props, allLabelers, state.selectedOption]);
	const hasSupportedLabelers = !!supportedLabelers.length;
	const hasSingleSupportedLabeler = supportedLabelers.length === 1;

	const onSubmit = React.useCallback(async () => {
		dispatch({ type: "clearError" });

		try {
			setPending(true);
			// wait at least 1s, make it feel substantial
			await wait(
				1e3,
				submitReport({
					subject: props.subject,
					state,
				}),
			);
			setSuccess(true);
			// give time for user feedback
			setTimeout(() => {
				props.control.close();
			}, 1e3);
		} catch (e: any) {
			dispatch({
				type: "setError",
				error: "Something went wrong. Please try again.",
			});
		} finally {
			setPending(false);
		}
	}, [submitReport, state, props]);

	return (
		<Dialog.ScrollableInner
			label={"Report dialog"}
			ref={ref}
			style={{
				...a.w_full,
				...{ maxWidth: 500 },
			}}
		>
			<View style={a.gap_2xl}>
				<StepOuter>
					<StepTitle index={1} title={copy.subtitle} activeIndex1={state.activeStepIndex1} />
					{isLoading ? (
						<View style={a.gap_sm}>
							<OptionCardSkeleton />
							<OptionCardSkeleton />
							<OptionCardSkeleton />
							<OptionCardSkeleton />
							<OptionCardSkeleton />
							{/* Here to capture focus for a hot sec to prevent flash */}
							<Pressable accessible={false} />
						</View>
					) : labelersLoadError || !allLabelers ? (
						<Admonition.Outer type="error">
							<Admonition.Row>
								<Admonition.Icon />
								<Admonition.Text>Something went wrong, please try again</Admonition.Text>
								<Admonition.Button
									label={"Retry loading report options"}
									onPress={() => refetchLabelers()}
								>
									<ButtonText>Retry</ButtonText>
									<ButtonIcon icon={Retry} />
								</Admonition.Button>
							</Admonition.Row>
						</Admonition.Outer>
					) : (
						<>
							{state.selectedOption ? (
								<View
									style={{
										...a.flex_row,
										...a.align_center,
										...a.gap_md,
									}}
								>
									<View style={a.flex_1}>
										<OptionCard option={state.selectedOption} />
									</View>
									<Button
										label={"Change report reason"}
										size="tiny"
										variant="solid"
										color="secondary"
										shape="round"
										onPress={() => {
											dispatch({ type: "clearOption" });
										}}
									>
										<ButtonIcon icon={X} />
									</Button>
								</View>
							) : (
								<View style={a.gap_sm}>
									{reportOptions[props.subject.type].map((o) => (
										<OptionCard
											key={o.reason}
											option={o}
											onSelect={() => {
												dispatch({ type: "selectOption", option: o });
											}}
										/>
									))}

									{["post", "account"].includes(props.subject.type) && (
										<Link to={DMCA_LINK} label={"View details for reporting a copyright violation"}>
											{({ hovered, pressed }) => (
												<View
													style={{
														...a.flex_row,
														...a.align_center,
														...a.w_full,
														...a.px_md,
														...a.py_sm,
														...a.rounded_sm,
														...a.border,
														...(hovered || pressed
															? [t.atoms.border_contrast_high]
															: [t.atoms.border_contrast_low]),
													}}
												>
													<Text
														style={{
															...a.flex_1,
															...a.italic,
															...a.leading_snug,
														}}
													>
														Need to report a copyright violation?
													</Text>
													<SquareArrowTopRight size="sm" fill={t.atoms.text.color} />
												</View>
											)}
										</Link>
									)}
								</View>
							)}
						</>
					)}
				</StepOuter>

				<StepOuter>
					<StepTitle index={2} title={"Select moderation service"} activeIndex1={state.activeStepIndex1} />
					{state.activeStepIndex1 >= 2 &&
						(state.selectedLabeler ? (
							<>
								{hasSingleSupportedLabeler ? (
									<LabelerCard labeler={state.selectedLabeler} />
								) : (
									<View
										style={{
											...a.flex_row,
											...a.align_center,
											...a.gap_md,
										}}
									>
										<View style={a.flex_1}>
											<LabelerCard labeler={state.selectedLabeler} />
										</View>
										<Button
											label={"Change moderation service"}
											size="tiny"
											variant="solid"
											color="secondary"
											shape="round"
											onPress={() => {
												dispatch({ type: "clearLabeler" });
											}}
										>
											<ButtonIcon icon={X} />
										</Button>
									</View>
								)}
							</>
						) : (
							<>
								{hasSupportedLabelers ? (
									<View style={a.gap_sm}>
										{hasSingleSupportedLabeler ? (
											<>
												<LabelerCard labeler={supportedLabelers[0]} />
												<ActionOnce
													check={() => !state.selectedLabeler}
													callback={() => {
														dispatch({
															type: "selectLabeler",
															labeler: supportedLabelers[0],
														});
													}}
												/>
											</>
										) : (
											<>
												{supportedLabelers.map((l) => (
													<LabelerCard
														key={l.creator.did}
														labeler={l}
														onSelect={() => {
															dispatch({ type: "selectLabeler", labeler: l });
														}}
													/>
												))}
											</>
										)}
									</View>
								) : (
									// should never happen in our app
									<Admonition.Admonition type="warning">
										Unfortunately, none of your subscribed labelers supports this report type.
									</Admonition.Admonition>
								)}
							</>
						))}
				</StepOuter>

				<StepOuter>
					<StepTitle index={3} title={"Submit report"} activeIndex1={state.activeStepIndex1} />
					{state.activeStepIndex1 === 3 && (
						<>
							<View
								style={{
									...a.pb_xs,
									...a.gap_xs,
								}}
							>
								<Text
									style={{
										...a.leading_snug,
										...a.pb_xs,
									}}
								>
									Your report will be sent to{" "}
									<Text
										style={{
											...a.font_bold,
											...a.leading_snug,
										}}
									>
										{state.selectedLabeler?.creator.displayName}
									</Text>
									.{" "}
									{!state.detailsOpen ? (
										<InlineLinkText
											label={"Add more details (optional)"}
											{...createStaticClick(() => {
												dispatch({ type: "showDetails" });
											})}
										>
											Add more details (optional)
										</InlineLinkText>
									) : null}
								</Text>

								{state.detailsOpen && (
									<View>
										<Dialog.Input
											multiline
											value={state.details}
											onChangeText={(details) => {
												dispatch({ type: "setDetails", details });
											}}
											label={"Additional details (limit 300 characters)"}
											style={{ paddingRight: 60 }}
											numberOfLines={4}
										/>
										<View
											style={{
												...a.absolute,
												...a.flex_row,
												...a.align_center,
												...a.pr_md,
												...a.pb_sm,

												...{
													bottom: 0,
													right: 0,
												},
											}}
										>
											<CharProgress count={state.details?.length || 0} />
										</View>
									</View>
								)}
							</View>
							<Button
								label={"Submit report"}
								size="large"
								variant="solid"
								color="primary"
								disabled={isPending || isSuccess}
								onPress={onSubmit}
							>
								<ButtonText>Submit report</ButtonText>
								<ButtonIcon icon={isSuccess ? CheckThin : isPending ? Loader : PaperPlane} />
							</Button>

							{state.error && <Admonition.Admonition type="error">{state.error}</Admonition.Admonition>}
						</>
					)}
				</StepOuter>
			</View>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}

function ActionOnce({
	check,
	callback,
}: {
	check: () => boolean;
	callback: () => void;
}) {
	React.useEffect(() => {
		if (check()) {
			callback();
		}
	}, [check, callback]);
	return null;
}

function StepOuter({ children }: { children: React.ReactNode }) {
	return (
		<View
			style={{
				...a.gap_md,
				...a.w_full,
			}}
		>
			{children}
		</View>
	);
}

function StepTitle({
	index,
	title,
	activeIndex1,
}: {
	index: number;
	title: string;
	activeIndex1: number;
}) {
	const t = useTheme();
	const active = activeIndex1 === index;
	const completed = activeIndex1 > index;
	return (
		<View
			style={{
				...a.flex_row,
				...a.gap_sm,
				...a.pr_3xl,
			}}
		>
			<View
				style={{
					...a.justify_center,
					...a.align_center,
					...a.rounded_full,
					...a.border,

					...{
						width: 24,
						height: 24,
						backgroundColor: active
							? t.palette.primary_500
							: completed
								? t.palette.primary_100
								: t.atoms.bg_contrast_25.backgroundColor,
						borderColor: active
							? t.palette.primary_500
							: completed
								? t.palette.primary_400
								: t.atoms.border_contrast_low.borderColor,
					},
				}}
			>
				{completed ? (
					<Check width={12} />
				) : (
					<Text
						style={{
							...a.font_heavy,
							...a.text_center,
							...t.atoms.text,

							...{
								color: active
									? "white"
									: completed
										? t.palette.primary_700
										: t.atoms.text_contrast_medium.color,
								fontVariant: ["tabular-nums"],
								width: 24,
								height: 24,
								lineHeight: 24,
							},
						}}
					>
						{index}
					</Text>
				)}
			</View>
			<Text
				style={{
					...a.flex_1,
					...a.font_heavy,
					...a.text_lg,
					...a.leading_snug,
					...(active ? t.atoms.text : t.atoms.text_contrast_medium),

					...{
						top: 1,
					},
				}}
			>
				{title}
			</Text>
		</View>
	);
}

function OptionCard({
	option,
	onSelect,
}: {
	option: ReportOption;
	onSelect?: (option: ReportOption) => void;
}) {
	const t = useTheme();
	const gutters = useGutters(["compact"]);
	const onPress = React.useCallback(() => {
		onSelect?.(option);
	}, [onSelect, option]);
	return (
		<Button label={`Create report for ${option.title}`} onPress={onPress} disabled={!onSelect}>
			{({ hovered, pressed }) => (
				<View
					style={{
						...a.w_full,
						...gutters,
						...a.py_sm,
						...a.rounded_sm,
						...a.border,
						...t.atoms.bg_contrast_25,
						...(hovered || pressed ? [t.atoms.border_contrast_high] : [t.atoms.border_contrast_low]),
					}}
				>
					<Text
						style={{
							...a.text_md,
							...a.font_bold,
							...a.leading_snug,
						}}
					>
						{option.title}
					</Text>
					<Text
						style={{
							...a.text_sm,
							...a.leading_snug,
							...t.atoms.text_contrast_medium,
						}}
					>
						{option.description}
					</Text>
				</View>
			)}
		</Button>
	);
}

function OptionCardSkeleton() {
	const t = useTheme();
	return (
		<View
			style={{
				...a.w_full,
				...a.rounded_sm,
				...a.border,
				...t.atoms.bg_contrast_25,
				...t.atoms.border_contrast_low,

				...// magic, based on web
				{ height: 55 },
			}}
		/>
	);
}

function LabelerCard({
	labeler,
	onSelect,
}: {
	labeler: AppBskyLabelerDefs.LabelerViewDetailed;
	onSelect?: (option: AppBskyLabelerDefs.LabelerViewDetailed) => void;
}) {
	const t = useTheme();
	const onPress = React.useCallback(() => {
		onSelect?.(labeler);
	}, [onSelect, labeler]);
	const title = getLabelingServiceTitle({
		displayName: labeler.creator.displayName,
		handle: labeler.creator.handle,
	});
	return (
		<Button label={`Send report to ${title}`} onPress={onPress} disabled={!onSelect}>
			{({ hovered, pressed }) => (
				<View
					style={{
						...a.w_full,
						...a.p_sm,
						...a.flex_row,
						...a.align_center,
						...a.gap_sm,
						...a.rounded_md,
						...a.border,
						...t.atoms.bg_contrast_25,
						...(hovered || pressed ? [t.atoms.border_contrast_high] : [t.atoms.border_contrast_low]),
					}}
				>
					<UserAvatar type="labeler" size={36} avatar={labeler.creator.avatar} />
					<View style={a.flex_1}>
						<Text
							style={{
								...a.text_md,
								...a.font_bold,
								...a.leading_snug,
							}}
						>
							{title}
						</Text>
						<Text
							style={{
								...a.text_sm,
								...a.leading_snug,
								...t.atoms.text_contrast_medium,
							}}
						>
							By {sanitizeHandle(labeler.creator.handle, "@")}
						</Text>
					</View>
				</View>
			)}
		</Button>
	);
}
