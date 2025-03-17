import React, { useContext, useMemo } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import type { StyleProp } from "react-native";
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import Animated, { type AnimatedScrollViewProps, useAnimatedProps } from "react-native-reanimated";

import { atoms as a, useBreakpoints, useLayoutBreakpoints, useTheme } from "#/alf";
import { useDialogContext } from "#/components/Dialog";
import { SCROLLBAR_OFFSET } from "#/components/Layout/const";
import { ScrollbarOffsetContext } from "#/components/Layout/context";
import { useShellLayout } from "#/state/shell/shell-layout";

export * from "#/components/Layout/const";
export * as Header from "#/components/Layout/Header";

export type ScreenProps = JSX.IntrinsicElements["div"] & {
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
					...a.util_screen_outer,
					...{ paddingTop: 0 },
					...style,
				}}
				{...props}
			/>
		</>
	);
});

export type ContentProps = Omit<AnimatedScrollViewProps, "style"> & {
	style?: React.CSSProperties;
	contentContainerStyle?: StyleProp<ViewStyle>;
	ignoreTabletLayoutOffset?: boolean;
};

/**
 * Default scroll view for simple pages
 */
export const Content = React.memo(function Content({
	children,
	style,
	contentContainerStyle,
	ignoreTabletLayoutOffset,
	...props
}: ContentProps) {
	const t = useTheme();
	const { footerHeight } = useShellLayout();
	const animatedProps = useAnimatedProps(() => {
		return {
			scrollIndicatorInsets: {
				bottom: footerHeight.get(),
				top: 0,
				right: 1,
			},
		} satisfies AnimatedScrollViewProps;
	});

	return (
		<Animated.ScrollView
			id="content"
			automaticallyAdjustsScrollIndicatorInsets={false}
			indicatorStyle={t.scheme === "dark" ? "white" : "black"}
			// sets the scroll inset to the height of the footer
			animatedProps={animatedProps}
			// @ts-expect-error
			style={{
				...scrollViewStyles.common,
				...style,
			}}
			contentContainerStyle={[scrollViewStyles.contentContainer, contentContainerStyle]}
			{...props}
		>
			<Center ignoreTabletLayoutOffset={ignoreTabletLayoutOffset}>
				{/* @ts-expect-error web only -esb */}
				{children}
			</Center>
		</Animated.ScrollView>
	);
});

const scrollViewStyles = StyleSheet.create({
	common: {
		width: "100%",
	},
	contentContainer: {
		paddingBottom: 100,
	},
});

export type KeyboardAwareContentProps = Omit<KeyboardAwareScrollViewProps, "style"> & {
	children: React.ReactNode;
	style: React.CSSProperties;
	contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Default scroll view for simple pages.
 *
 * BE SURE TO TEST THIS WHEN USING, it's untested as of writing this comment.
 */
export const KeyboardAwareContent = React.memo(function LayoutScrollView({
	children,
	style,
	contentContainerStyle,
	...props
}: KeyboardAwareContentProps) {
	return (
		<KeyboardAwareScrollView
			// @ts-expect-error
			style={{
				...scrollViewStyles.common,
				...style,
			}}
			contentContainerStyle={[scrollViewStyles.contentContainer, contentContainerStyle]}
			keyboardShouldPersistTaps="handled"
			{...props}
		>
			<Center>{children}</Center>
		</KeyboardAwareScrollView>
	);
});

/**
 * Utility component to center content within the screen
 */
export const Center = React.memo(function LayoutContent({
	children,
	style,
	ignoreTabletLayoutOffset,
	...props
}: JSX.IntrinsicElements["div"] & { ignoreTabletLayoutOffset?: boolean }) {
	const { isWithinOffsetView } = useContext(ScrollbarOffsetContext);
	const { gtMobile } = useBreakpoints();
	const { centerColumnOffset } = useLayoutBreakpoints();
	const { isWithinDialog } = useDialogContext();
	const ctx = useMemo(() => ({ isWithinOffsetView: true }), []);
	return (
		<div
			style={{
				...a.w_full,
				...a.mx_auto,

				...(gtMobile && {
					maxWidth: 600,
				}),

				...(!isWithinOffsetView && {
					transform: `translateX(${centerColumnOffset && !ignoreTabletLayoutOffset && !isWithinDialog ? -150 : 0}px) translateX(${SCROLLBAR_OFFSET ?? 0}px)`,
				}),

				...style,
			}}
			{...props}
		>
			<ScrollbarOffsetContext.Provider value={ctx}>{children}</ScrollbarOffsetContext.Provider>
		</div>
	);
});

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
				...a.fixed,
				...a.inset_0,
				...a.border_l,
				...a.border_r,
				...t.atoms.border_contrast_low,

				...{
					width: 602,
					left: "50%",
					transform: `translateX(-50%) translateX(${centerColumnOffset ? -150 : 0}px) ${a.scrollbar_offset.transform}`,
				},
			}}
		/>
	) : null;
});
