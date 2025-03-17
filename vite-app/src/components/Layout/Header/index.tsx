import { useNavigation } from "@react-navigation/native";
import { createContext, useCallback, useContext } from "react";
import { Keyboard } from "react-native";

import {
	type TextStyleProp,
	atoms as a,
	flatten,
	useBreakpoints,
	useGutters,
	useLayoutBreakpoints,
	useTheme,
} from "#/alf";
import { Button, ButtonIcon, type ButtonProps } from "#/components/Button";
import { BUTTON_VISUAL_ALIGNMENT_OFFSET, HEADER_SLOT_SIZE, SCROLLBAR_OFFSET } from "#/components/Layout/const";
import { ScrollbarOffsetContext } from "#/components/Layout/context";
import { Text } from "#/components/Typography";
import { ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeft } from "#/components/icons/Arrow";
import { Menu_Stroke2_Corner0_Rounded as Menu } from "#/components/icons/Menu";
import { HITSLOP_30 } from "#/lib/constants";
import type { NavigationProp } from "#/lib/routes/types";
import { useSetDrawerOpen } from "#/state/shell";

export function Outer({
	children,
	noBottomBorder,
	headerRef,
	sticky = true,
}: {
	children: React.ReactNode;
	noBottomBorder?: boolean;
	headerRef?: React.RefObject<HTMLDivElement>;
	sticky?: boolean;
}) {
	const t = useTheme();
	const gutters = useGutters([0, "base"]);
	const { gtMobile } = useBreakpoints();
	const { isWithinOffsetView } = useContext(ScrollbarOffsetContext);
	const { centerColumnOffset } = useLayoutBreakpoints();

	return (
		<div
			ref={headerRef}
			style={{
				...a.w_full,
				...(!noBottomBorder && a.border_b),
				...a.flex_row,
				...a.align_center,
				...a.gap_sm,

				...flatten(sticky ? [a.sticky, { top: 0 }, a.z_10, t.atoms.bg] : []),

				...gutters,
				...a.py_xs,
				...{ minHeight: 52 },
				...t.atoms.border_contrast_low,
				...flatten(gtMobile ? [a.mx_auto, { maxWidth: 600 }] : []),

				...(!isWithinOffsetView && {
					transform: `translateX(${centerColumnOffset ? -150 : 0}px) translateX(${SCROLLBAR_OFFSET ?? 0}px)`,
				}),
			}}
		>
			{children}
		</div>
	);
}

const AlignmentContext = createContext<"platform" | "left">("platform");

export function Content({
	children,
	align = "platform",
}: {
	children?: React.ReactNode;
	align?: "platform" | "left";
}) {
	return (
		<div
			style={{
				...a.flex_1,
				...a.justify_center,
				...{ minHeight: HEADER_SLOT_SIZE },
			}}
		>
			<AlignmentContext.Provider value={align}>{children}</AlignmentContext.Provider>
		</div>
	);
}

export function Slot({ children }: { children?: React.ReactNode }) {
	return (
		<div
			style={{
				...a.z_50,
				...{ width: HEADER_SLOT_SIZE },
			}}
		>
			{children}
		</div>
	);
}

export function BackButton({ onPress, style, ...props }: Partial<ButtonProps>) {
	const navigation = useNavigation<NavigationProp>();

	const onPressBack = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			onPress?.(evt);
			if (evt.defaultPrevented) return;
			if (navigation.canGoBack()) {
				navigation.goBack();
			} else {
				navigation.navigate("Home");
			}
		},
		[onPress, navigation],
	);

	return (
		<Slot>
			<Button
				label={"Go back"}
				size="small"
				variant="ghost"
				color="secondary"
				shape="square"
				onPress={onPressBack}
				hitSlop={HITSLOP_30}
				style={{
					...{ marginLeft: -BUTTON_VISUAL_ALIGNMENT_OFFSET },
					...a.bg_transparent,
					...style,
				}}
				{...props}
			>
				<ButtonIcon icon={ArrowLeft} size="lg" />
			</Button>
		</Slot>
	);
}

export function MenuButton() {
	const setDrawerOpen = useSetDrawerOpen();
	const { gtMobile } = useBreakpoints();

	const onPress = useCallback(() => {
		Keyboard.dismiss();
		setDrawerOpen(true);
	}, [setDrawerOpen]);

	return gtMobile ? null : (
		<Slot>
			<Button
				label={"Open drawer menu"}
				size="small"
				variant="ghost"
				color="secondary"
				shape="square"
				onPress={onPress}
				hitSlop={HITSLOP_30}
				style={{ marginLeft: -BUTTON_VISUAL_ALIGNMENT_OFFSET }}
			>
				<ButtonIcon icon={Menu} size="lg" />
			</Button>
		</Slot>
	);
}

export function TitleText({ children, style }: { children: React.ReactNode } & TextStyleProp) {
	const { gtMobile } = useBreakpoints();
	const align = useContext(AlignmentContext);
	return (
		<Text
			style={{
				...a.text_lg,
				...a.font_heavy,
				...a.leading_tight,
				...(gtMobile && a.text_xl),
				...style,
			}}
			numberOfLines={2}
			emoji
		>
			{children}
		</Text>
	);
}

export function SubtitleText({ children }: { children: React.ReactNode }) {
	const t = useTheme();
	const align = useContext(AlignmentContext);
	return (
		<Text
			style={{
				...a.text_sm,
				...a.leading_snug,
				...t.atoms.text_contrast_medium,
			}}
			numberOfLines={2}
		>
			{children}
		</Text>
	);
}
