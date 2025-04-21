import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, type ButtonColor, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";

export {
	type DialogControlProps as PromptControlProps,
	useDialogControl as usePromptControl,
} from "#/components/Dialog";

const Context = React.createContext<{
	titleId: string;
	descriptionId: string;
}>({
	titleId: "",
	descriptionId: "",
});

export function Outer({
	children,
	control,
}: React.PropsWithChildren<{
	control: Dialog.DialogControlProps;
}>) {
	const { gtMobile } = useBreakpoints();
	const titleId = React.useId();
	const descriptionId = React.useId();

	const context = React.useMemo(() => ({ titleId, descriptionId }), [titleId, descriptionId]);

	return (
		<Dialog.Outer control={control} webOptions={{ alignCenter: true }}>
			<Dialog.Handle />
			<Context.Provider value={context}>
				<Dialog.ScrollableInner
					accessibilityDescribedBy={descriptionId}
					style={gtMobile ? { width: "auto", maxWidth: 400, minWidth: 200 } : { width: "100%" }}
				>
					{children}
				</Dialog.ScrollableInner>
			</Context.Provider>
		</Dialog.Outer>
	);
}

export function TitleText({ children }: React.PropsWithChildren) {
	return (
		<Text
			style={{
				fontSize: 22,
				letterSpacing: 0,
				fontWeight: "600",
				paddingBottom: 8,
				lineHeight: 1.3,
			}}
		>
			{children}
		</Text>
	);
}

export function DescriptionText({ children, selectable }: React.PropsWithChildren<{ selectable?: boolean }>) {
	const t = useTheme();
	return (
		<Text
			selectable={selectable}
			style={{
				fontSize: 16,
				letterSpacing: 0,
				lineHeight: 1.3,
				...t.atoms.text_contrast_high,
				paddingBottom: 16,
			}}
		>
			{children}
		</Text>
	);
}

export function Actions({ children }: React.PropsWithChildren) {
	const { gtMobile } = useBreakpoints();

	return (
		<div
			style={{
				width: "100%",
				gap: 12,
				justifyContent: gtMobile ? "flex-start" : "flex-end",
				flexDirection: gtMobile ? "row-reverse" : "column",
			}}
		>
			{children}
		</div>
	);
}

export function Cancel({
	cta,
}: {
	/**
	 * Optional i18n string. If undefined, it will default to "Cancel".
	 */
	cta?: string;
}) {
	const { gtMobile } = useBreakpoints();
	const { close } = Dialog.useDialogContext();
	const onPress = React.useCallback(() => {
		close();
	}, [close]);

	return (
		<Button
			variant="solid"
			color="secondary"
			size={gtMobile ? "small" : "large"}
			label={cta || "Cancel"}
			onPress={onPress}
		>
			<ButtonText>{cta || "Cancel"}</ButtonText>
		</Button>
	);
}

export function Action({
	onPress,
	color = "primary",
	cta,
}: {
	/**
	 * Callback to run when the action is pressed. The method is called _after_
	 * the dialog closes.
	 *
	 * Note: The dialog will close automatically when the action is pressed, you
	 * should NOT close the dialog as a side effect of this method.
	 */
	onPress: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	color?: ButtonColor;
	/**
	 * Optional i18n string. If undefined, it will default to "Confirm".
	 */
	cta?: string;
}) {
	const { gtMobile } = useBreakpoints();
	const { close } = Dialog.useDialogContext();
	const handleOnPress = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			close(() => onPress?.(e));
		},
		[close, onPress],
	);

	return (
		<Button
			variant="solid"
			color={color}
			size={gtMobile ? "small" : "large"}
			label={cta || "Confirm"}
			onPress={handleOnPress}
		>
			<ButtonText>{cta || "Confirm"}</ButtonText>
		</Button>
	);
}

export function Basic({
	control,
	title,
	description,
	cancelButtonCta,
	confirmButtonCta,
	onConfirm,
	confirmButtonColor,
	showCancel = true,
}: React.PropsWithChildren<{
	control: Dialog.DialogOuterProps["control"];
	title: string;
	description: string;
	cancelButtonCta?: string;
	confirmButtonCta?: string;
	/**
	 * Callback to run when the Confirm button is pressed. The method is called
	 * _after_ the dialog closes.
	 *
	 * Note: The dialog will close automatically when the action is pressed, you
	 * should NOT close the dialog as a side effect of this method.
	 */
	onConfirm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	confirmButtonColor?: ButtonColor;
	showCancel?: boolean;
}>) {
	return (
		<Outer control={control}>
			<TitleText>{title}</TitleText>
			<DescriptionText>{description}</DescriptionText>
			<Actions>
				<Action cta={confirmButtonCta} onPress={onConfirm} color={confirmButtonColor} />
				{showCancel && <Cancel cta={cancelButtonCta} />}
			</Actions>
		</Outer>
	);
}
