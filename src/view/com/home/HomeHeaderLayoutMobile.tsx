import type React from "react";

import type { JSX } from "react";
import { useTheme } from "#/alf";
import { ButtonIcon } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { Hashtag_Stroke2_Corner0_Rounded as FeedsIcon } from "#/components/icons/Hashtag";
import { HITSLOP_10 } from "#/lib/constants";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useMinimalShellHeaderTransform } from "#/lib/hooks/useMinimalShellTransform";
import { emitSoftReset } from "#/state/events";
import { useSession } from "#/state/session";
import { useShellLayout } from "#/state/shell/shell-layout";
import { Logo } from "#/view/icons/Logo";

export function HomeHeaderLayoutMobile({
	children,
}: {
	children: React.ReactNode;
	tabBarAnchor: JSX.Element | null | undefined;
}) {
	const t = useTheme();
	const { headerHeight } = useShellLayout();
	const headerMinimalShellTransform = useMinimalShellHeaderTransform();
	const { hasSession } = useSession();
	const ref = useOnLayout((e) => {
		headerHeight.set(e.height);
	});
	return (
		<div
			// Animated.View
			style={{
				position: "fixed",
				zIndex: 10,
				...t.atoms.bg,

				top: 0,
				left: 0,
				right: 0,

				...headerMinimalShellTransform,
			}}
			ref={ref}
		>
			<Layout.Header.Outer noBottomBorder>
				<Layout.Header.Slot>
					<Layout.Header.MenuButton />
				</Layout.Header.Slot>

				<div
					style={{
						flex: 1,
						alignItems: "center",
					}}
				>
					<PressableScale
						targetScale={0.9}
						onClick={() => {
							emitSoftReset();
						}}
					>
						<Logo width={30} />
					</PressableScale>
				</div>

				<Layout.Header.Slot>
					{hasSession && (
						<Link
							to="/feeds"
							hitSlop={HITSLOP_10}
							label={"View your feeds and explore more"}
							size="small"
							variant="ghost"
							color="secondary"
							shape="square"
							style={{
								justifyContent: "center",

								...{
									marginRight: -Layout.BUTTON_VISUAL_ALIGNMENT_OFFSET,
								},
							}}
						>
							<ButtonIcon icon={FeedsIcon} size="lg" />
						</Link>
					)}
				</Layout.Header.Slot>
			</Layout.Header.Outer>
			{children}
		</div>
	);
}
