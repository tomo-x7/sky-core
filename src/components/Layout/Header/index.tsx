import { createContext, useCallback, useContext } from "react";

import { useNavigate } from "react-router-dom";
import { type TextStyleProp, useBreakpoints, useGutters, useLayoutBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, type ButtonProps } from "#/components/Button";
import { BUTTON_VISUAL_ALIGNMENT_OFFSET, HEADER_SLOT_SIZE, SCROLLBAR_OFFSET } from "#/components/Layout/const";
import { ScrollbarOffsetContext } from "#/components/Layout/context";
import { Text } from "#/components/Typography";
import { ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeft } from "#/components/icons/Arrow";
import { Menu_Stroke2_Corner0_Rounded as Menu } from "#/components/icons/Menu";
import { Keyboard } from "#/lib/Keyboard";
import { HITSLOP_30 } from "#/lib/constants";
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
				width: "100%",
				borderBottom: noBottomBorder ? undefined : "1px solid black",
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				...(sticky ? { position: "sticky", top: 0, zIndex: 10, ...t.atoms.bg } : undefined),
				...gutters,
				paddingTop: 4,
				paddingBottom: 4,
				...{ minHeight: 52 },
				...t.atoms.border_contrast_low,
				...(gtMobile ? { marginLeft: "auto", marginRight: "auto", maxWidth: 600 } : undefined),

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
				flex: 1,
				justifyContent: "center",
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
				zIndex: 50,
				...{ width: HEADER_SLOT_SIZE },
			}}
		>
			{children}
		</div>
	);
}

export function BackButton({ onPress, style, ...props }: Partial<ButtonProps>) {
	const navigate = useNavigate();

	const onPressBack = useCallback(
		(evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			onPress?.(evt);
			if (evt.defaultPrevented) return;
			if (history.length > 1) {
				navigate(-1);
			} else {
				navigate("/");
			}
		},
		[onPress, navigate],
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
					backgroundColor: "transparent",
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
				fontSize: gtMobile ? 20 : 18,
				letterSpacing: 0,
				fontWeight: "800",
				lineHeight: 1.15,
				...style,
			}}
			numberOfLines={2}
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
				fontSize: 14,
				letterSpacing: 0,
				lineHeight: 1.3,
				...t.atoms.text_contrast_medium,
			}}
			numberOfLines={2}
		>
			{children}
		</Text>
	);
}
