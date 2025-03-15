import React from "react";
import { ScrollView, View } from "react-native";

import { type TextStyleProp, atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { leading } from "#/alf/typography";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { createPortalGroup } from "#/components/Portal";
import { P, Text } from "#/components/Typography";
import { ChevronLeft_Stroke2_Corner0_Rounded as ChevronLeft } from "#/components/icons/Chevron";
import { Context } from "#/screens/Onboarding/state";
import { useOnboardingDispatch } from "#/state/shell";

const COL_WIDTH = 420;

export const OnboardingControls = createPortalGroup();

export function Layout({ children }: React.PropsWithChildren) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const onboardDispatch = useOnboardingDispatch();
	const { state, dispatch } = React.useContext(Context);
	const scrollview = React.useRef<ScrollView>(null);
	const prevActiveStep = React.useRef<string>(state.activeStep);

	React.useEffect(() => {
		if (state.activeStep !== prevActiveStep.current) {
			prevActiveStep.current = state.activeStep;
			scrollview.current?.scrollTo({ y: 0, animated: false });
		}
	}, [state]);

	const paddingTop = gtMobile ? a.py_5xl : a.py_lg;
	const dialogLabel = "Set up your account";

	return (
		<View
			aria-modal
			// biome-ignore lint/a11y/useSemanticElements: <explanation>
			role="dialog"
			aria-role="dialog"
			aria-label={dialogLabel}
			accessibilityLabel={dialogLabel}
			accessibilityHint={"Customizes your Bluesky experience"}
			style={[a.fixed, a.inset_0, a.flex_1, t.atoms.bg]}
		>
			{__DEV__ && (
				<View style={[a.absolute, a.p_xl, a.z_10, { right: 0, top: 0 }]}>
					<Button
						variant="ghost"
						color="negative"
						size="small"
						onPress={() => onboardDispatch({ type: "skip" })}
						// DEV ONLY
						label="Clear onboarding state"
					>
						<ButtonText>Clear</ButtonText>
					</Button>
				</View>
			)}

			{!gtMobile && state.hasPrev && (
				<View
					style={[
						a.fixed,
						a.flex_row,
						a.w_full,
						a.justify_center,
						a.z_20,
						a.px_xl,
						{
							top: paddingTop.paddingTop - 1,
						},
					]}
				>
					<View style={[a.w_full, a.align_start, { maxWidth: COL_WIDTH }]}>
						<Button
							key={state.activeStep} // remove focus state on nav
							variant="ghost"
							color="secondary"
							size="small"
							shape="round"
							label={"Go back to previous step"}
							style={[a.absolute]}
							onPress={() => dispatch({ type: "prev" })}
						>
							<ButtonIcon icon={ChevronLeft} />
						</Button>
					</View>
				</View>
			)}

			<ScrollView
				ref={scrollview}
				style={[a.h_full, a.w_full, { paddingTop: 0 }]}
				contentContainerStyle={{ borderWidth: 0 }}
				// @ts-ignore web only --prf
				dataSet={{ "stable-gutters": 1 }}
			>
				<View style={[a.flex_row, a.justify_center, gtMobile ? a.px_5xl : a.px_xl]}>
					<View style={[a.flex_1, { maxWidth: COL_WIDTH }]}>
						<View style={[a.w_full, a.align_center, paddingTop]}>
							<View style={[a.flex_row, a.gap_sm, a.w_full, { paddingTop: 17, maxWidth: "60%" }]}>
								{Array(state.totalSteps)
									.fill(0)
									.map((_, i) => (
										<View
											key={i.toString()}
											style={[
												a.flex_1,
												a.pt_xs,
												a.rounded_full,
												t.atoms.bg_contrast_50,
												{
													backgroundColor:
														i + 1 <= state.activeStepIndex
															? t.palette.primary_500
															: t.palette.contrast_100,
												},
											]}
										/>
									))}
							</View>
						</View>

						<View style={[a.w_full, a.mb_5xl, { paddingTop: gtMobile ? 20 : 40 }]}>{children}</View>

						<View style={{ height: 400 }} />
					</View>
				</View>
			</ScrollView>

			<View
				style={[
					a.fixed,
					{ bottom: 0, left: 0, right: 0 },
					t.atoms.bg,
					t.atoms.border_contrast_low,
					a.border_t,
					a.align_center,
					gtMobile ? a.px_5xl : a.px_xl,
					a.py_2xl,
				]}
			>
				<View style={[a.w_full, { maxWidth: COL_WIDTH }, gtMobile && [a.flex_row, a.justify_between]]}>
					{gtMobile &&
						(state.hasPrev ? (
							<Button
								key={state.activeStep} // remove focus state on nav
								variant="solid"
								color="secondary"
								size="large"
								shape="round"
								label={"Go back to previous step"}
								onPress={() => dispatch({ type: "prev" })}
							>
								<ButtonIcon icon={ChevronLeft} />
							</Button>
						) : (
							<View style={{ height: 54 }} />
						))}
					<OnboardingControls.Outlet />
				</View>
			</View>
		</View>
	);
}

export function TitleText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	return (
		<Text
			style={[
				a.pb_sm,
				a.text_4xl,
				a.font_bold,
				{
					lineHeight: leading(a.text_4xl, a.leading_tight),
				},
				flatten(style),
			]}
		>
			{children}
		</Text>
	);
}

export function DescriptionText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	const t = useTheme();
	return <P style={[t.atoms.text_contrast_medium, flatten(style)]}>{children}</P>;
}
