/**
 * In the Web build, we center all content so that it mirrors the
 * mobile experience (a single narrow column). We then place a UI
 * shell around the content if you're in desktop.
 *
 * Because scrolling is handled by components deep in the hierarchy,
 * we can't just wrap the top-level element with a max width. The
 * centering has to be done at the ScrollView.
 *
 * These components wrap the RN ScrollView-based components to provide
 * consistent layout. It also provides <CenteredView> for views that
 * need to match layout but which aren't scrolled.
 */

import React from "react";

import { useLayoutBreakpoints } from "#/alf";
import { useDialogContext } from "#/components/Dialog";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";

interface AddedProps {
	desktopFixedHeight?: boolean | number;
}

/**
 * @deprecated use `Layout` components
 */
export const CenteredView = React.forwardRef(function CenteredView(
	{
		style,
		topBorder,
		...props
	}: React.PropsWithChildren<
		Omit<JSX.IntrinsicElements["div"], "style" | "ref"> & {
			sideBorders?: boolean;
			topBorder?: boolean;
			style?: React.CSSProperties;
		}
	>,
	ref: React.Ref<HTMLDivElement>,
) {
	const pal = usePalette("default");
	const { isMobile } = useWebMediaQueries();
	const { centerColumnOffset } = useLayoutBreakpoints();
	const { isWithinDialog } = useDialogContext();
	if (!isMobile) {
		style = { ...style, ...styles.container };
	}
	if (centerColumnOffset && !isWithinDialog) {
		style = { ...style, ...styles.containerOffset };
	}
	if (topBorder) {
		style = { ...style, borderTopWidth: 1 };
		style = { ...style, ...pal.border };
	}
	return <div ref={ref} style={style} {...props} />;
});

/**
 * @deprecated use `Layout` components
 */
export const ScrollView = React.forwardRef(function ScrollViewImpl(
	{ ...props }: React.PropsWithChildren<JSX.IntrinsicElements["div"]>,
	ref: React.Ref<HTMLDivElement>,
) {
	const { isMobile } = useWebMediaQueries();
	const { centerColumnOffset } = useLayoutBreakpoints();
	// if (!isMobile) {
	// 	contentContainerStyle = addStyle(contentContainerStyle, styles.containerScroll);
	// }
	// if (centerColumnOffset) {
	// 	contentContainerStyle = addStyle(contentContainerStyle, styles.containerOffset);
	// }
	return (
		<div
			// Animated.ScrollView
			// contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
			ref={ref}
			{...props}
		/>
	);
});

const styles = {
	contentContainer: {
		minHeight: "100dvh",
	},
	container: {
		width: "100%",
		maxWidth: 600,
		marginLeft: "auto",
		marginRight: "auto",
	},
	containerOffset: {
		transform: "translateX(-150px)",
	},
	containerScroll: {
		width: "100%",
		maxWidth: 600,
		marginLeft: "auto",
		marginRight: "auto",
	},
	fixedHeight: {
		height: "100dvh",
	},
} as const;
