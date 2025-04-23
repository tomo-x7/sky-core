import type React from "react";

import type { JSX } from "react";
import { atoms as a, useBreakpoints, useGutters, useTheme } from "#/alf";
import { ButtonIcon } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { Hashtag_Stroke2_Corner0_Rounded as FeedsIcon } from "#/components/icons/Hashtag";
import { useKawaiiMode } from "#/state/preferences/kawaii";
import { useSession } from "#/state/session";
import { useShellLayout } from "#/state/shell/shell-layout";
import { HomeHeaderLayoutMobile } from "#/view/com/home/HomeHeaderLayoutMobile";
import { Logo } from "#/view/icons/Logo";

export function HomeHeaderLayout(props: {
	children: React.ReactNode;
	tabBarAnchor: JSX.Element | null | undefined;
}) {
	const { gtMobile } = useBreakpoints();
	if (!gtMobile) {
		return <HomeHeaderLayoutMobile {...props} />;
	} else {
		return <HomeHeaderLayoutDesktopAndTablet {...props} />;
	}
}

function HomeHeaderLayoutDesktopAndTablet({
	children,
	tabBarAnchor,
}: {
	children: React.ReactNode;
	tabBarAnchor: JSX.Element | null | undefined;
}) {
	const t = useTheme();
	const { headerHeight } = useShellLayout();
	const { hasSession } = useSession();
	const kawaii = useKawaiiMode();
	const gutters = useGutters([0, "base"]);

	return (
		<>
			{hasSession && (
				<Layout.Center>
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							...gutters,
							paddingTop: 12,
							...t.atoms.bg,
						}}
					>
						<div style={{ width: 34 }} />
						<div
							style={{
								flex: 1,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Logo width={kawaii ? 60 : 28} />
						</div>
						<Link
							to="/feeds"
							hitSlop={10}
							label={"View your feeds and explore more"}
							size="small"
							variant="ghost"
							color="secondary"
							shape="square"
							style={{ justifyContent:"center" }}
						>
							<ButtonIcon icon={FeedsIcon} size="lg" />
						</Link>
					</div>
				</Layout.Center>
			)}
			{tabBarAnchor}
			<Layout.Center
				style={{
					position: "sticky",
					zIndex: 10,
					alignItems: "center",
					...t.atoms.bg,
					...{ top: 0 },
				}}
				ref={useOnLayout((e) => {
					headerHeight.set(e.height);
				})}
			>
				{children}
			</Layout.Center>
		</>
	);
}
