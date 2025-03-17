import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { useFocusGuards } from "@radix-ui/react-focus-guards";
import { FocusScope } from "@radix-ui/react-focus-scope";
import React, { useImperativeHandle } from "react";
import { TouchableWithoutFeedback } from "react-native";
import { RemoveScrollBar } from "react-remove-scroll-bar";
import { FlatList, type FlatListProps } from "#/lib/flatlist";

import hexRgb from "hex-rgb";
import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Context } from "#/components/Dialog/context";
import type { DialogControlProps, DialogInnerProps, DialogOuterProps } from "#/components/Dialog/types";
import { Portal } from "#/components/Portal";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { useA11y } from "#/state/a11y";
import { useDialogStateControlContext } from "#/state/dialogs";

export { useDialogContext, useDialogControl } from "#/components/Dialog/context";
export * from "#/components/Dialog/shared";
export * from "#/components/Dialog/types";
export * from "#/components/Dialog/utils";
export { Input } from "#/components/forms/TextField";

function stopPropagation<T extends { stopPropagation: () => void } = Event>(e: T) {
	return e.stopPropagation();
}
function preventDefault<T extends { preventDefault: () => void } = Event>(e: T) {
	e.preventDefault();
}

export function Outer({ children, control, onClose, webOptions }: React.PropsWithChildren<DialogOuterProps>) {
	const { gtMobile } = useBreakpoints();
	const [isOpen, setIsOpen] = React.useState(false);
	const { setDialogIsOpen } = useDialogStateControlContext();

	const open = React.useCallback(() => {
		setDialogIsOpen(control.id, true);
		setIsOpen(true);
	}, [setDialogIsOpen, control.id]);

	const close = React.useCallback<DialogControlProps["close"]>(
		(cb) => {
			setDialogIsOpen(control.id, false);
			setIsOpen(false);

			try {
				if (cb && typeof cb === "function") {
					// This timeout ensures that the callback runs at the same time as it would on native. I.e.
					// console.log('Step 1') -> close(() => console.log('Step 3')) -> console.log('Step 2')
					// This should always output 'Step 1', 'Step 2', 'Step 3', but without the timeout it would output
					// 'Step 1', 'Step 3', 'Step 2'.
					setTimeout(cb);
				}
			} catch (e: unknown) {
				console.error("Dialog closeCallback failed", {
					message: (e as { message: unknown }).message,
				});
			}

			onClose?.();
		},
		[control.id, onClose, setDialogIsOpen],
	);

	const handleBackgroundPress = React.useCallback(async () => {
		close();
	}, [close]);

	useImperativeHandle(
		control.ref,
		() => ({
			open,
			close,
		}),
		[close, open],
	);

	const context = React.useMemo(
		() => ({
			close,
			isNativeDialog: false,
			disableDrag: false,
			setDisableDrag: () => {},
			isWithinDialog: true,
		}),
		[close],
	);

	return (
		<>
			{isOpen && (
				<Portal>
					<Context.Provider value={context}>
						<RemoveScrollBar />
						<TouchableWithoutFeedback
							accessibilityHint={undefined}
							accessibilityLabel={"Close active dialog"}
							onPress={handleBackgroundPress}
						>
							<div
								style={{
									...a.fixed,
									...a.inset_0,
									...a.z_10,
									...a.px_xl,
									...(webOptions?.alignCenter ? a.justify_center : undefined),
									...a.align_center,

									overflowY: "auto",
									paddingTop: gtMobile ? "10vh" : a.pt_xl.paddingTop,
									paddingBottom: gtMobile ? "10vh" : a.pt_xl.paddingTop,
								}}
							>
								<Backdrop />
								{/**
								 * This is needed to prevent centered dialogs from overflowing
								 * above the screen, and provides a "natural" centering so that
								 * stacked dialogs appear relatively aligned.
								 */}
								<div
									style={{
										...a.w_full,
										...a.z_20,
										...a.align_center,

										...{ minHeight: "60vh", position: "static" },
									}}
								>
									{children}
								</div>
							</div>
						</TouchableWithoutFeedback>
					</Context.Provider>
				</Portal>
			)}
		</>
	);
}

export function Inner({
	children,
	style,
	label,
	accessibilityLabelledBy,
	accessibilityDescribedBy,
	header,
	contentContainerStyle,
}: DialogInnerProps) {
	const t = useTheme();
	const { close } = React.useContext(Context);
	const { gtMobile } = useBreakpoints();
	const { reduceMotionEnabled } = useA11y();
	useFocusGuards();
	return (
		<FocusScope loop asChild trapped>
			<dialog
				aria-label={label}
				aria-labelledby={accessibilityLabelledBy}
				aria-describedby={accessibilityDescribedBy}
				onClick={stopPropagation}
				//@ts-ignore
				onStartShouldSetResponder={() => true}
				onTouchEnd={stopPropagation}
				style={{
					...a.relative,
					...a.rounded_md,
					...a.w_full,
					...a.border,
					...t.atoms.bg,

					maxWidth: 600,
					borderColor: t.palette.contrast_200,
					// TODO:2pxは適当に決めたので要チェック
					boxShadow: `2px 2px 30px ${hexRgb(t.palette.black, { alpha: t.name === "light" ? 0.1 : 0.4, format: "css" })}`,

					...(!reduceMotionEnabled ? a.zoom_fade_in : {}),
					...style,
				}}
			>
				<DismissableLayer
					onInteractOutside={preventDefault}
					onFocusOutside={preventDefault}
					onDismiss={close}
					style={{ display: "flex", flexDirection: "column" }}
				>
					{header}
					<div style={{ ...(gtMobile ? a.p_2xl : a.p_xl), ...contentContainerStyle }}>{children}</div>
				</DismissableLayer>
			</dialog>
		</FocusScope>
	);
}

export const ScrollableInner = Inner;

export const InnerFlatList = React.forwardRef<
	HTMLDivElement,
	FlatListProps<any> & { label?: string } & {
		webInnerStyle?: React.CSSProperties;
		webInnerContentContainerStyle?: React.CSSProperties;
	}
>(function InnerFlatList({ label, style, webInnerStyle, webInnerContentContainerStyle, ...props }, ref) {
	const { gtMobile } = useBreakpoints();
	return (
		<Inner
			label={label}
			style={{
				...a.overflow_hidden,
				...a.px_0,
				// 100 minus 10vh of paddingVertical
				maxHeight: "80vh",
				...webInnerStyle,
			}}
			contentContainerStyle={{ ...a.px_0, ...webInnerContentContainerStyle }}
		>
			<FlatList
				ref={ref}
				style={{
					...(gtMobile ? a.px_2xl : a.px_xl),
					...style,
				}}
				{...props}
			/>
		</Inner>
	);
});

export function Close() {
	const { close } = React.useContext(Context);
	return (
		<div
			style={{
				...a.absolute,
				...a.z_10,

				...{
					top: a.pt_md.paddingTop,
					right: a.pr_md.paddingRight,
				},
			}}
		>
			<Button
				size="small"
				variant="ghost"
				color="secondary"
				shape="round"
				onPress={() => close()}
				label={"Close active dialog"}
			>
				<ButtonIcon icon={X} size="md" />
			</Button>
		</div>
	);
}

export function Handle() {
	return null;
}

function Backdrop() {
	const t = useTheme();
	const { reduceMotionEnabled } = useA11y();
	return (
		<div style={{ opacity: 0.8 }}>
			<div
				//@ts-ignore
				style={{
					...a.fixed,
					...a.inset_0,
					...{ backgroundColor: t.palette.black },
					...(!reduceMotionEnabled && a.fade_in),
				}}
			/>
		</div>
	);
}
