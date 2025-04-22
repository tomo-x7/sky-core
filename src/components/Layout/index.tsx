import React, { useContext, useMemo } from "react";

import { useBreakpoints, useLayoutBreakpoints, useTheme } from "#/alf";
import { useDialogContext } from "#/components/Dialog";
import { SCROLLBAR_OFFSET } from "#/components/Layout/const";
import { ScrollbarOffsetContext } from "#/components/Layout/context";
import { useShellLayout } from "#/state/shell/shell-layout";

export * from "#/components/Layout/const";
export * as Header from "#/components/Layout/Header";

export type ScreenProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
	noInsetTop?: boolean;
};

/**
 * Outermost component of every screen
 */
export const Screen = React.memo(function Screen({ style, noInsetTop, ...props }: ScreenProps) {
	return (
		<>
			<WebCenterBorders />
			<div
				style={{
					minHeight: "100dvh",
					...{ paddingTop: 0 },
					...style,
				}}
				{...props}
			/>
		</>
	);
});

export type ContentProps = Omit<JSX.IntrinsicElements["div"], "style" | "ref"> & {
	style?: React.CSSProperties;
	contentContainerStyle?: React.CSSProperties;
	ignoreTabletLayoutOffset?: boolean;
};

const ContentImpl = React.forwardRef<HTMLDivElement, ContentProps>(
	({ children, style, contentContainerStyle, ignoreTabletLayoutOffset, ...props }, ref) => {
		const t = useTheme();
		const { footerHeight } = useShellLayout();
		// const animatedProps = useAnimatedProps(() => {
		// 	return {
		// 		scrollIndicatorInsets: {
		// 			bottom: footerHeight.get(),
		// 			top: 0,
		// 			right: 1,
		// 		},
		// 	} satisfies AnimatedScrollViewProps;
		// });

		return (
			<div
				// Animated.ScrollView
				id="content"
				// automaticallyAdjustsScrollIndicatorInsets={false}
				// indicatorStyle={t.scheme === "dark" ? "white" : "black"}
				// sets the scroll inset to the height of the footer
				// animatedProps={animatedProps}
				style={{
					...scrollViewStyles.common,
					...style,
				}}
				// contentContainerStyle={[scrollViewStyles.contentContainer, contentContainerStyle]}
				{...props}
				ref={ref}
			>
				<Center ignoreTabletLayoutOffset={ignoreTabletLayoutOffset}>{children}</Center>
			</div>
		);
	},
);
/**
 * Default scroll view for simple pages
 */
export const Content = React.memo(ContentImpl);

const scrollViewStyles = {
	common: {
		width: "100%",
	},
	contentContainer: {
		paddingBottom: 100,
	},
} satisfies Record<string, React.CSSProperties>;

export type KeyboardAwareContentProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
	children: React.ReactNode;
	style: React.CSSProperties;
	// contentContainerStyle?: React.CSSProperties;
};

/**
 * Default scroll view for simple pages.
 *
 * BE SURE TO TEST THIS WHEN USING, it's untested as of writing this comment.
 */
export const KeyboardAwareContent = React.memo(function LayoutScrollView({
	children,
	style,
	...props
}: KeyboardAwareContentProps) {
	return (
		<div
			// KeyboardAwareScrollView
			style={{
				...scrollViewStyles.common,
				...style,
			}}
			// contentContainerStyle={[scrollViewStyles.contentContainer, contentContainerStyle]}
			// keyboardShouldPersistTaps="handled"
			{...props}
		>
			<Center>{children}</Center>
		</div>
	);
});

type CenterProps = Omit<JSX.IntrinsicElements["div"], "ref"> & { ignoreTabletLayoutOffset?: boolean };
const CenterImpl = React.forwardRef<HTMLDivElement, CenterProps>(function LayoutContent(
	{ children, style, ignoreTabletLayoutOffset, ...props },
	ref,
) {
	const { isWithinOffsetView } = useContext(ScrollbarOffsetContext);
	const { gtMobile } = useBreakpoints();
	const { centerColumnOffset } = useLayoutBreakpoints();
	const { isWithinDialog } = useDialogContext();
	const ctx = useMemo(() => ({ isWithinOffsetView: true }), []);
	return (
		<div
			style={{
				width: "100%",
				marginLeft: "auto",
				marginRight: "auto",

				...(gtMobile && {
					maxWidth: 600,
				}),

				...(!isWithinOffsetView && {
					transform: `translateX(${centerColumnOffset && !ignoreTabletLayoutOffset && !isWithinDialog ? -150 : 0}px) translateX(${SCROLLBAR_OFFSET ?? 0}px)`,
				}),

				...style,
			}}
			ref={ref}
			{...props}
		>
			<ScrollbarOffsetContext.Provider value={ctx}>{children}</ScrollbarOffsetContext.Provider>
		</div>
	);
});
/**
 * Utility component to center content within the screen
 */
export const Center = React.memo(CenterImpl);

/**
 * Only used within `Layout.Screen`, not for reuse
 */
const WebCenterBorders = React.memo(function LayoutContent() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { centerColumnOffset } = useLayoutBreakpoints();
	return gtMobile ? (
		<div
			style={{
				position: "fixed",
				top: 0,
				right: 0,
				bottom: 0,
				borderLeft: "1px solid black",
				borderRight: "1px solid black",
				...t.atoms.border_contrast_low,
				width: 602,
				left: "50%",
				transform: `translateX(calc(-50%${centerColumnOffset ? " - 150px" : ""} - (var(--removed-body-scroll-bar-size, 0px) / 2)))`,
			}}
		/>
	) : null;
});
