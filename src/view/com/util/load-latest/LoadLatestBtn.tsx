import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery } from "react-responsive";

import { useLayoutBreakpoints } from "#/alf";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useMinimalShellFabTransform } from "#/lib/hooks/useMinimalShellTransform";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { clamp } from "#/lib/numbers";
import { colors } from "#/lib/styles";
import { useSession } from "#/state/session";

export function LoadLatestBtn({
	onPress,
	label,
	showIndicator,
}: {
	onPress: () => void;
	label: string;
	showIndicator: boolean;
}) {
	const pal = usePalette("default");
	const { hasSession } = useSession();
	const { isDesktop, isTablet, isMobile, isTabletOrMobile } = useWebMediaQueries();
	const { centerColumnOffset } = useLayoutBreakpoints();
	const fabMinimalShellTransform = useMinimalShellFabTransform();

	// move button inline if it starts overlapping the left nav
	const isTallViewport = useMediaQuery({ minHeight: 700 });

	// Adjust height of the fab if we have a session only on mobile web. If we don't have a session, we want to adjust
	// it on both tablet and mobile since we are showing the bottom bar (see createNativeStackNavigatorWithAuth)
	const showBottomBar = hasSession ? isMobile : isTabletOrMobile;

	const bottomPosition = isTablet ? { bottom: 50 } : { bottom: clamp(0, 15, 60) + 15 };

	return (
		<div
			// Animated.View
			style={showBottomBar ? fabMinimalShellTransform : undefined}
		>
			<PressableScale
				style={{
					...styles.loadLatest,
					...(isDesktop
						? isTallViewport
							? styles.loadLatestOutOfLine
							: styles.loadLatestInline
						: undefined),
					...(isTablet
						? centerColumnOffset
							? styles.loadLatestInlineOffset
							: styles.loadLatestInline
						: undefined),
					...pal.borderDark,
					...pal.view,
					...bottomPosition,
				}}
				onClick={onPress}
				// TODO
				// hitSlop={HITSLOP_20}
				targetScale={0.9}
			>
				<FontAwesomeIcon icon="angle-up" color={pal.colors.text} size="lg" />
				{showIndicator && (
					<div
						style={{
							...styles.indicator,
							...pal.borderDark,
						}}
					/>
				)}
			</PressableScale>
		</div>
	);
}

const styles = {
	loadLatest: {
		zIndex: 20,
		position: "fixed",
		left: 18,
		borderWidth: 1,
		width: 52,
		height: 52,
		borderRadius: 26,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	loadLatestInline: {
		left: "calc(50vw - 282px)",
	},
	loadLatestInlineOffset: {
		left: "calc(50vw - 432px)",
	},
	loadLatestOutOfLine: {
		left: "calc(50vw - 382px)",
	},
	indicator: {
		position: "absolute",
		top: 3,
		right: 3,
		backgroundColor: colors.blue3,
		width: 12,
		height: 12,
		borderRadius: 6,
		borderWidth: 1,
	},
} satisfies Record<string, React.CSSProperties>;
