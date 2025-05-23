import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

import { useTheme } from "#/alf";
import type * as Dialog from "#/components/Dialog";
import { Context, ItemContext, useMenuContext, useMenuItemContext } from "#/components/Menu/context";
import type {
	ContextType,
	GroupProps,
	ItemIconProps,
	ItemProps,
	ItemTextProps,
	RadixPassThroughTriggerProps,
	TriggerProps,
} from "#/components/Menu/types";
import { Portal } from "#/components/Portal";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { useA11y } from "#/state/a11y";

export type { DialogControlProps as MenuControlProps } from "#/components/Dialog";

export function useMenuControl(): Dialog.DialogControlProps {
	const id = React.useId();
	const [isOpen, setIsOpen] = React.useState(false);
	return React.useMemo(
		() => ({
			id,
			ref: { current: null },
			isOpen,
			open() {
				setIsOpen(true);
			},
			close() {
				setIsOpen(false);
			},
		}),
		[id, isOpen],
	);
}

export function Root({
	children,
	control,
}: React.PropsWithChildren<{
	control?: Dialog.DialogOuterProps["control"];
}>) {
	const defaultControl = useMenuControl();
	const context = React.useMemo<ContextType>(
		() => ({
			control: control || defaultControl,
		}),
		[control, defaultControl],
	);
	const onOpenChange = React.useCallback(
		(open: boolean) => {
			if (context.control?.isOpen && !open) {
				context.control.close();
			} else if (!context.control?.isOpen && open) {
				context.control?.open();
			}
		},
		[context.control],
	);

	return (
		<Context.Provider value={context}>
			{context.control?.isOpen && (
				<Portal>
					<button
						type="button"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 50,
						}}
						onClick={() => context.control?.close()}
						aria-label="Context menu backdrop, click to close the menu."
					/>
				</Portal>
			)}
			<DropdownMenu.Root open={context.control?.isOpen} onOpenChange={onOpenChange}>
				{children}
			</DropdownMenu.Root>
		</Context.Provider>
	);
}

const RadixTriggerPassThrough = React.forwardRef<
	any,
	{
		children: (props: RadixPassThroughTriggerProps) => React.ReactNode;
	}
>((props, ref) => {
	return props.children({
		...props,
		ref: ref,
	});
});
RadixTriggerPassThrough.displayName = "RadixTriggerPassThrough";

export function Trigger({ children, label, hint }: TriggerProps) {
	const { control } = useMenuContext();
	const { state: hovered, onIn: onMouseEnter, onOut: onMouseLeave } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();

	return (
		<DropdownMenu.Trigger asChild>
			<RadixTriggerPassThrough>
				{(props) =>
					children({
						isNative: false,
						control: control!,
						state: {
							hovered,
							focused,
							pressed: false,
						},
						props: {
							...props,
							// No-op override to prevent false positive that interprets mobile scroll as a tap.
							// This requires the custom onPress handler below to compensate.
							// https://github.com/radix-ui/primitives/issues/1912
							onPress: () => {
								if (window.event instanceof KeyboardEvent) {
									// The onPointerDown hack above is not relevant to this press, so don't do anything.
									return;
								}
								// Compensate for the disabled onPointerDown above by triggering it manually.
								if (control?.isOpen) {
									control.close();
								} else {
									control?.open();
								}
							},
							onFocus: onFocus,
							onBlur: onBlur,
							onMouseEnter,
							onMouseLeave,
						},
					})
				}
			</RadixTriggerPassThrough>
		</DropdownMenu.Trigger>
	);
}

export function Outer({
	children,
	style,
}: React.PropsWithChildren<{
	showCancel?: boolean;
	style?: React.CSSProperties;
}>) {
	const t = useTheme();
	const { reduceMotionEnabled } = useA11y();

	return (
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				sideOffset={5}
				collisionPadding={{ left: 5, right: 5, bottom: 5 }}
				loop
				aria-label="Test"
				className="dropdown-menu-transform-origin dropdown-menu-constrain-size"
			>
				<div
					style={{
						borderRadius: 8,
						padding: 4,
						border: "1px solid black",
						borderWidth: 1,
						...(t.name === "light" ? t.atoms.bg : t.atoms.bg_contrast_25),
						...t.atoms.shadow_md,
						...t.atoms.border_contrast_low,
						overflow: "auto",
						animation: reduceMotionEnabled ? undefined : "zoomIn ease-out 0.1s, fadeIn ease-out 0.1s",
						...style,
					}}
				>
					{children}
				</div>

				{/* Disabled until we can fix positioning
        <DropdownMenu.Arrow
          className="DropdownMenuArrow"
          fill={
            (t.name === 'light' ? t.atoms.bg : t.atoms.bg_contrast_25)
              .backgroundColor
          }
        />
          */}
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	);
}

export function Item({ children, label, onPress, style, ...rest }: ItemProps) {
	const t = useTheme();
	const { control } = useMenuContext();
	const { state: hovered, onIn: onMouseEnter, onOut: onMouseLeave } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();

	return (
		<DropdownMenu.Item asChild>
			<button
				type="button"
				{...rest}
				className="radix-dropdown-item"
				onClick={(e) => {
					onPress(e as unknown as React.MouseEvent<HTMLAnchorElement>);

					/**
					 * Ported forward from Radix
					 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#item
					 */
					if (!e.defaultPrevented) {
						control?.close();
					}
				}}
				onFocus={onFocus}
				onBlur={onBlur}
				// need `flatten` here for Radix compat
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: 16,
					borderRadius: 4,
					minHeight: 32,
					padding: "8px 10px",
					outline: 0,
					...((hovered || focused) &&
						!rest.disabled && {
							outline: "0 !important",
							...(t.name === "light" ? t.atoms.bg_contrast_25 : t.atoms.bg_contrast_50),
						}),
					...style,
				}}
				{...{
					onMouseEnter,
					onMouseLeave,
				}}
			>
				<ItemContext.Provider value={{ disabled: Boolean(rest.disabled) }}>{children}</ItemContext.Provider>
			</button>
		</DropdownMenu.Item>
	);
}

export function ItemText({ children, style }: ItemTextProps) {
	const t = useTheme();
	const { disabled } = useMenuItemContext();
	return (
		<Text
			style={{
				flex: 1,
				fontWeight: "600",
				...t.atoms.text_contrast_high,
				...style,
				...(disabled && t.atoms.text_contrast_low),
			}}
		>
			{children}
		</Text>
	);
}

export function ItemIcon({ icon: Comp, position = "left" }: ItemIconProps) {
	const t = useTheme();
	const { disabled } = useMenuItemContext();
	return (
		<div
			style={{
				...(position === "left" && {
					marginLeft: -2,
				}),

				...(position === "right" && {
					marginRight: -2,
					marginLeft: 12,
				}),
			}}
		>
			<Comp size="md" fill={disabled ? t.atoms.text_contrast_low.color : t.atoms.text_contrast_medium.color} />
		</div>
	);
}

export function ItemRadio({ selected }: { selected: boolean }) {
	const t = useTheme();
	return (
		<div
			style={{
				justifyContent: "center",
				alignItems: "center",
				borderRadius: 999,
				...t.atoms.border_contrast_high,

				...{
					borderWidth: 1,
					height: 20,
					width: 20,
				},
			}}
		>
			{selected ? (
				<div
					style={{
						position: "absolute",
						borderRadius: 999,
						...{ height: 14, width: 14 },

						...(selected
							? {
									backgroundColor: t.palette.primary_500,
								}
							: {}),
					}}
				/>
			) : null}
		</div>
	);
}

export function LabelText({ children }: { children: React.ReactNode }) {
	const t = useTheme();
	return (
		<Text
			style={{
				fontWeight: "600",
				paddingTop: 12,
				paddingBottom: 8,
				...t.atoms.text_contrast_low,

				...{
					paddingLeft: 10,
					paddingRight: 10,
				},
			}}
		>
			{children}
		</Text>
	);
}

export function Group({ children }: GroupProps) {
	return children;
}

export function Divider() {
	const t = useTheme();
	return (
		<DropdownMenu.Separator
			style={{
				marginTop: 4,
				marginBottom: 4,
				...t.atoms.bg_contrast_100,
				flexShrink: 0,
				height: 1,
			}}
		/>
	);
}
