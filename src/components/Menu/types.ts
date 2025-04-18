import type React from "react";

import type { TextStyleProp, ViewStyleProp } from "#/alf";
import type * as Dialog from "#/components/Dialog";
import type { Props as SVGIconProps } from "#/components/icons/common";

export type ContextType = {
	control: Dialog.DialogOuterProps["control"] | null;
};

export type ItemContextType = {
	disabled: boolean;
};

export type RadixPassThroughTriggerProps = {
	ref: React.Ref<any>;
};
export type TriggerProps = {
	children(props: TriggerChildProps): React.ReactNode;
	label: string;
	hint?: string;
};
export type TriggerChildProps = {
	isNative: false;
	control: Dialog.DialogOuterProps["control"];
	state: {
		hovered: boolean;
		focused: boolean;
		/**
		 * Native only, `false` on web
		 */
		pressed: false;
	};
	props: RadixPassThroughTriggerProps & {
		onPress: () => void;
		onFocus: () => void;
		onBlur: () => void;
		onMouseEnter: () => void;
		onMouseLeave: () => void;
	};
};

export type ItemProps = React.PropsWithChildren<
	Omit<JSX.IntrinsicElements["button"], "style" | "onClick" | "ref"> &
		ViewStyleProp & {
			label: string;
			onPress: (e: React.MouseEvent<HTMLAnchorElement>) => void;
		}
>;

export type ItemTextProps = React.PropsWithChildren<TextStyleProp & {}>;
export type ItemIconProps = React.PropsWithChildren<{
	icon: React.ComponentType<SVGIconProps>;
	position?: "left" | "right";
}>;

export type GroupProps = React.PropsWithChildren<ViewStyleProp & {}>;
