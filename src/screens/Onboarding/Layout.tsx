import React from "react";

import { type TextStyleProp, atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { leading } from "#/alf/typography";
import { Button, ButtonIcon } from "#/components/Button";
import { createPortalGroup } from "#/components/Portal";
import { P, Text } from "#/components/Typography";
import { ChevronLeft_Stroke2_Corner0_Rounded as ChevronLeft } from "#/components/icons/Chevron";
import { Context } from "#/screens/Onboarding/state";

const COL_WIDTH = 420;

export const OnboardingControls = createPortalGroup();

export function Layout({ children }: React.PropsWithChildren) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { state, dispatch } = React.useContext(Context);
	const scrollview = React.useRef<HTMLDivElement>(null);
	const prevActiveStep = React.useRef<string>(state.activeStep);

	React.useEffect(() => {
		if (state.activeStep !== prevActiveStep.current) {
			prevActiveStep.current = state.activeStep;
			scrollview.current?.scrollTo({ top: 0 });
		}
	}, [state]);

	const paddingTop = gtMobile ? a.py_5xl : a.py_lg;
	const dialogLabel = "Set up your account";

	return (
		<dialog
			aria-modal
			aria-label={dialogLabel}
			style={{
				...a.fixed,
				...a.inset_0,
				...a.flex_1,
				...t.atoms.bg,
			}}
		>
			{!gtMobile && state.hasPrev && (
				<div
					style={{
						...a.fixed,
						...a.flex_row,
						...a.w_full,
						...a.justify_center,
						...a.z_20,
						...a.px_xl,

						...{
							top: paddingTop.paddingTop - 1,
						},
					}}
				>
					<div
						style={{
							...a.w_full,
							...a.align_start,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						<Button
							key={state.activeStep} // remove focus state on nav
							variant="ghost"
							color="secondary"
							size="small"
							shape="round"
							label={"Go back to previous step"}
							style={a.absolute}
							onPress={() => dispatch({ type: "prev" })}
						>
							<ButtonIcon icon={ChevronLeft} />
						</Button>
					</div>
				</div>
			)}
			<div
				ref={scrollview}
				style={{
					...a.h_full,
					...a.w_full,
					paddingTop: 0,
					borderWidth: 0,
				}}
				data-stable-gutters={1}
			>
				<div
					style={{
						...a.flex_row,
						...a.justify_center,
						...(gtMobile ? a.px_5xl : a.px_xl),
					}}
				>
					<div
						style={{
							...a.flex_1,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						<div
							style={{
								...a.w_full,
								...a.align_center,
								...paddingTop,
							}}
						>
							<div
								style={{
									...a.flex_row,
									...a.gap_sm,
									...a.w_full,
									...{ paddingTop: 17, maxWidth: "60%" },
								}}
							>
								{Array(state.totalSteps)
									.fill(0)
									.map((_, i) => (
										<div
											key={i.toString()}
											style={{
												...a.flex_1,
												...a.pt_xs,
												...a.rounded_full,
												...t.atoms.bg_contrast_50,

												...{
													backgroundColor:
														i + 1 <= state.activeStepIndex
															? t.palette.primary_500
															: t.palette.contrast_100,
												},
											}}
										/>
									))}
							</div>
						</div>

						<div
							style={{
								...a.w_full,
								...a.mb_5xl,
								...{ paddingTop: gtMobile ? 20 : 40 },
							}}
						>
							{children}
						</div>

						<div style={{ height: 400 }} />
					</div>
				</div>
			</div>
			<div
				style={{
					...a.fixed,
					...{ bottom: 0, left: 0, right: 0 },
					...t.atoms.bg,
					...t.atoms.border_contrast_low,
					...a.border_t,
					...a.align_center,
					...(gtMobile ? a.px_5xl : a.px_xl),
					...a.py_2xl,
				}}
			>
				<div
					style={{
						...a.w_full,
						...{ maxWidth: COL_WIDTH },
						...flatten(gtMobile && [a.flex_row, a.justify_between]),
					}}
				>
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
							<div style={{ height: 54 }} />
						))}
					<OnboardingControls.Outlet />
				</div>
			</div>
		</dialog>
	);
}

export function TitleText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	return (
		<Text
			style={{
				...a.pb_sm,
				...a.text_4xl,
				...a.font_bold,
				lineHeight: leading(a.text_4xl, a.leading_tight),
				...style,
			}}
		>
			{children}
		</Text>
	);
}

export function DescriptionText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	const t = useTheme();
	return (
		<P
			style={{
				...t.atoms.text_contrast_medium,
				...style,
			}}
		>
			{children}
		</P>
	);
}
