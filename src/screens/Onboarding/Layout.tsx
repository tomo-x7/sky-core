import React, { type CSSProperties } from "react";

import { type TextStyleProp, useBreakpoints, useTheme } from "#/alf";
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

	const paddingTop = {
		paddingTop: gtMobile ? 40 : 16,
		paddingBottom: gtMobile ? 40 : 16,
	} satisfies CSSProperties;
	const dialogLabel = "Set up your account";

	return (
		<dialog
			aria-modal
			aria-label={dialogLabel}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				flex: 1,
				...t.atoms.bg,
			}}
		>
			{!gtMobile && state.hasPrev && (
				<div
					style={{
						position: "fixed",
						flexDirection: "row",
						width: "100%",
						justifyContent: "center",
						zIndex: 20,
						paddingLeft: 20,
						paddingRight: 20,

						...{
							top: paddingTop.paddingTop - 1,
						},
					}}
				>
					<div
						style={{
							width: "100%",
							alignItems: "flex-start",
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
							style={{ position: "absolute" }}
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
					height: "100%",
					width: "100%",
					paddingTop: 0,
					borderWidth: 0,
				}}
				data-stable-gutters={1}
			>
				<div
					style={{
						flexDirection: "row",
						justifyContent: "center",
						paddingLeft: gtMobile ? 40 : 20,
						paddingRight: gtMobile ? 40 : 20,
					}}
				>
					<div
						style={{
							flex: 1,
							...{ maxWidth: COL_WIDTH },
						}}
					>
						<div
							style={{
								width: "100%",
								alignItems: "center",
								...paddingTop,
							}}
						>
							<div
								style={{
									flexDirection: "row",
									gap: 8,
									width: "100%",
									...{ paddingTop: 17, maxWidth: "60%" },
								}}
							>
								{Array(state.totalSteps)
									.fill(0)
									.map((_, i) => (
										<div
											key={i.toString()}
											style={{
												flex: 1,
												paddingTop: 4,
												borderRadius: 999,
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
								width: "100%",
								marginBottom: 40,
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
					position: "fixed",
					...{ bottom: 0, left: 0, right: 0 },
					...t.atoms.bg,
					...t.atoms.border_contrast_low,
					borderTop: "1px solid black",
					borderTopWidth: 1,
					alignItems: "center",
					paddingTop: 24,
					paddingBottom: 24,
					paddingLeft: gtMobile ? 40 : 20,
					paddingRight: gtMobile ? 40 : 20,
				}}
			>
				<div
					style={{
						width: "100%",
						...{ maxWidth: COL_WIDTH },
						flexDirection: gtMobile ? "row" : undefined,
						justifyContent: gtMobile ? "space-between" : undefined,
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
				paddingBottom: 8,
				fontSize: 32,
				letterSpacing: 0,
				fontWeight: "600",
				lineHeight: leading({ fontSize: 32, letterSpacing: 0 }, { lineHeight: 1.15 }),
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
