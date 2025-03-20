import type React from "react";

import type { ViewStyleProp } from "#/alf";

/**
 * Mutated by useImperativeHandle to provide a public API for controlling the
 * dialog. The methods here will actually become the handlers defined within
 * the `Dialog.Outer` component.
 *
 * `Partial<GestureResponderEvent>` here allows us to add this directly to the
 * `onPress` prop of a button, for example. If this type was not added, we
 * would need to create a function to wrap `.open()` with.
 */
export type DialogControlRefProps = {
	open: (options?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	close: (callback?: () => void) => void;
};

/**
 * The return type of the useDialogControl hook.
 */
export type DialogControlProps = DialogControlRefProps & {
	id: string;
	ref: React.RefObject<DialogControlRefProps>;
	isOpen?: boolean;
};

export type DialogContextProps = {
	close: DialogControlProps["close"];
	isNativeDialog: boolean;
	disableDrag: boolean;
	setDisableDrag: React.Dispatch<React.SetStateAction<boolean>>;
	// in the event that the hook is used outside of a dialog
	isWithinDialog: boolean;
};

export type DialogOuterProps = {
	control: DialogControlProps;
	onClose?: () => void;
	webOptions?: {
		alignCenter?: boolean;
	};
	testID?: string;
};

type DialogInnerPropsBase<T> = React.PropsWithChildren<ViewStyleProp> & T;
export type DialogInnerProps =
	| DialogInnerPropsBase<{
			label?: undefined;
			accessibilityDescribedBy: string;
			contentContainerStyle?: React.CSSProperties;
			header?: React.ReactNode;
	  }>
	| DialogInnerPropsBase<{
			label?: string;
			accessibilityLabelledBy?: undefined;
			accessibilityDescribedBy?: undefined;
			contentContainerStyle?: React.CSSProperties;
			header?: React.ReactNode;
	  }>;
