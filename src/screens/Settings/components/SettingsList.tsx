import React, { useContext, useMemo } from "react";

import { type ViewStyleProp, atoms as a, flatten, useTheme } from "#/alf";
import * as Button from "#/components/Button";
import { Link, type LinkProps } from "#/components/Link";
import { createPortalGroup } from "#/components/Portal";
import { Text } from "#/components/Typography";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRightIcon } from "#/components/icons/Chevron";
import { HITSLOP_10 } from "#/lib/constants";

const ItemContext = React.createContext({
	destructive: false,
	withinGroup: false,
});

const Portal = createPortalGroup();

export function Container({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				flex: 1,
				paddingTop: 12,
				paddingBottom: 12,
			}}
		>
			{children}
		</div>
	);
}

/**
 * This uses `Portal` magic ✨ to render the icons and title correctly. ItemIcon and ItemText components
 * get teleported to the top row, leaving the rest of the children in the bottom row.
 */
export function Group({
	children,
	destructive = false,
	iconInset = true,
	style,
	contentContainerStyle,
}: {
	children: React.ReactNode;
	destructive?: boolean;
	iconInset?: boolean;
	style?: React.CSSProperties;
	contentContainerStyle?: React.CSSProperties;
}) {
	const context = useMemo(() => ({ destructive, withinGroup: true }), [destructive]);
	return (
		<div
			style={{
				width: "100%",
				...style,
			}}
		>
			<Portal.Provider>
				<ItemContext.Provider value={context}>
					<Item
						style={{
							paddingBottom: 2,
							...{ minHeight: 42 },
						}}
					>
						<Portal.Outlet />
					</Item>
					<Item
						style={{
							flexDirection: "column",
							paddingTop: 2,
							alignItems: "flex-start",
							gap: 0,
							...contentContainerStyle,
						}}
						iconInset={iconInset}
					>
						{children}
					</Item>
				</ItemContext.Provider>
			</Portal.Provider>
		</div>
	);
}

export function Item({
	children,
	destructive,
	iconInset = false,
	style,
}: {
	children?: React.ReactNode;
	destructive?: boolean;
	/**
	 * Adds left padding so that the content will be aligned with other Items that contain icons
	 * @default false
	 */
	iconInset?: boolean;
	style?: React.CSSProperties;
}) {
	const context = useContext(ItemContext);
	const childContext = useMemo(() => {
		if (typeof destructive !== "boolean") return context;
		return { ...context, destructive };
	}, [context, destructive]);
	return (
		<div
			style={{
				paddingLeft: 20,
				paddingRight: 20,
				paddingTop: 8,
				paddingBottom: 8,
				alignItems: "center",
				gap: 12,
				width: "100%",
				flexDirection: "row",
				...{ minHeight: 48 },

				...(iconInset && {
					paddingLeft:
						// existing padding
						a.pl_xl.paddingLeft +
						// icon
						28 +
						// gap
						a.gap_md.gap,
				}),

				...style,
			}}
		>
			<ItemContext.Provider value={childContext}>{children}</ItemContext.Provider>
		</div>
	);
}

export function LinkItem({
	children,
	destructive = false,
	contentContainerStyle,
	chevronColor,
	...props
}: LinkProps & {
	contentContainerStyle?: React.CSSProperties;
	destructive?: boolean;
	chevronColor?: string;
}) {
	const t = useTheme();

	return (
		<Link color="secondary" {...props}>
			{(args) => (
				<Item
					destructive={destructive}
					style={{
						...((args.hovered || args.pressed) && t.atoms.bg_contrast_25),
						...contentContainerStyle,
					}}
				>
					{typeof children === "function" ? children(args) : children}
					<Chevron color={chevronColor} />
				</Item>
			)}
		</Link>
	);
}

export function PressableItem({
	children,
	destructive = false,
	contentContainerStyle,
	hoverStyle,
	...props
}: Button.ButtonProps & {
	contentContainerStyle?: React.CSSProperties;
	destructive?: boolean;
}) {
	const t = useTheme();
	return (
		<Button.Button {...props}>
			{(args) => (
				<Item
					destructive={destructive}
					style={{
						...flatten((args.hovered || args.pressed) && [t.atoms.bg_contrast_25, hoverStyle]),
						...contentContainerStyle,
					}}
				>
					{typeof children === "function" ? children(args) : children}
				</Item>
			)}
		</Button.Button>
	);
}

export function ItemIcon({
	icon: Comp,
	size = "xl",
	color: colorProp,
}: Omit<React.ComponentProps<typeof Button.ButtonIcon>, "position"> & {
	color?: string;
}) {
	const t = useTheme();
	const { destructive, withinGroup } = useContext(ItemContext);

	/*
	 * Copied here from icons/common.tsx so we can tweak if we need to, but
	 * also so that we can calculate transforms.
	 */
	const iconSize = {
		xs: 12,
		sm: 16,
		md: 20,
		lg: 24,
		xl: 28,
		"2xl": 32,
	}[size];

	const color = colorProp ?? (destructive ? t.palette.negative_500 : t.atoms.text.color);

	const content = (
		<div
			style={{
				zIndex: 20,
				...{ width: iconSize, height: iconSize },
			}}
		>
			<Comp width={iconSize} style={{ color }} />
		</div>
	);

	if (withinGroup) {
		return <Portal.Portal>{content}</Portal.Portal>;
	} else {
		return content;
	}
}

export function ItemText({ style, ...props }: React.ComponentProps<typeof Button.ButtonText>) {
	const t = useTheme();
	const { destructive, withinGroup } = useContext(ItemContext);

	const content = (
		<Button.ButtonText
			style={{
				fontSize: 16,
				letterSpacing: 0,
				fontWeight: "400",
				textAlign: "left",
				flex: 1,
				...(destructive ? { color: t.palette.negative_500 } : t.atoms.text),
				...style,
			}}
			{...props}
		/>
	);

	if (withinGroup) {
		return <Portal.Portal>{content}</Portal.Portal>;
	} else {
		return content;
	}
}

export function Divider({ style }: ViewStyleProp) {
	const t = useTheme();
	return (
		<div
			style={{
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_medium,
				width: "100%",
				marginTop: 8,
				marginBottom: 8,
				...style,
			}}
		/>
	);
}

export function Chevron({ color: colorProp }: { color?: string }) {
	const { destructive } = useContext(ItemContext);
	const t = useTheme();
	const color = colorProp ?? (destructive ? t.palette.negative_500 : t.palette.contrast_500);
	return <ItemIcon icon={ChevronRightIcon} size="md" color={color} />;
}

export function BadgeText({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	const t = useTheme();
	return (
		<Text
			style={{
				...t.atoms.text_contrast_low,
				fontSize: 16,
				letterSpacing: 0,
				textAlign: "right",,
				lineHeight: 1.3,
				...style,
			}}
			numberOfLines={1}
		>
			{children}
		</Text>
	);
}

export function BadgeButton({
	label,
	onPress,
}: {
	label: string;
	onPress: (evt: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
	const t = useTheme();
	return (
		<Button.Button label={label} onPress={onPress} hitSlop={HITSLOP_10}>
			{({ pressed }) => (
				<Button.ButtonText
					style={{
						fontSize: 16,
						letterSpacing: 0,
						fontWeight: "400",
						textAlign: "right",,
						...{ color: pressed ? t.palette.contrast_300 : t.palette.primary_500 },
					}}
				>
					{label}
				</Button.ButtonText>
			)}
		</Button.Button>
	);
}
