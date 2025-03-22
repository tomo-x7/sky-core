import React, { useState } from "react";

import { type TextStyleProp, atoms as a, applyFonts, flatten, useAlf, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import type { Props as SVGIconProps } from "#/components/icons/common";
import { mergeRefs } from "#/lib/merge-refs";
import { usePlaceholderStyle } from "#/lib/placeholderStyle";

const Context = React.createContext<{
	inputRef: React.RefObject<HTMLInputElement> | null;
	isInvalid: boolean;
	hovered: boolean;
	onHoverIn: () => void;
	onHoverOut: () => void;
	focused: boolean;
	onFocus: () => void;
	onBlur: () => void;
}>({
	inputRef: null,
	isInvalid: false,
	hovered: false,
	onHoverIn: () => {},
	onHoverOut: () => {},
	focused: false,
	onFocus: () => {},
	onBlur: () => {},
});

export type RootProps = React.PropsWithChildren<{ isInvalid?: boolean }>;

export function Root({ children, isInvalid = false }: RootProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();

	const context = React.useMemo(
		() => ({
			inputRef,
			hovered,
			onHoverIn,
			onHoverOut,
			focused,
			onFocus,
			onBlur,
			isInvalid,
		}),
		[hovered, onHoverIn, onHoverOut, focused, onFocus, onBlur, isInvalid],
	);

	return (
		<Context.Provider value={context}>
			<div
				style={{
					...a.flex_row,
					...a.align_center,
					...a.relative,
					...a.w_full,
					...a.px_md,
				}}
				{...{
					onClick: () => inputRef.current?.focus(),
					onMouseOver: onHoverIn,
					onMouseOut: onHoverOut,
				}}
			>
				{children}
			</div>
		</Context.Provider>
	);
}

export function useSharedInputStyles() {
	const t = useTheme();
	return React.useMemo(() => {
		const hover: React.CSSProperties[] = [
			{
				borderColor: t.palette.contrast_100,
			},
		];
		const focus: React.CSSProperties[] = [
			{
				backgroundColor: t.palette.contrast_50,
				borderColor: t.palette.primary_500,
			},
		];
		const error: React.CSSProperties[] = [
			{
				backgroundColor: t.palette.negative_25,
				borderColor: t.palette.negative_300,
			},
		];
		const errorHover: React.CSSProperties[] = [
			{
				backgroundColor: t.palette.negative_25,
				borderColor: t.palette.negative_500,
			},
		];

		return {
			chromeHover: flatten(hover),
			chromeFocus: flatten(focus),
			chromeError: flatten(error),
			chromeErrorHover: flatten(errorHover),
		};
	}, [t]);
}

export type InputProps = Omit<JSX.IntrinsicElements["input"], "value" | "onChangeText"> & {
	label: string;
	/**
	 * @deprecated Controlled inputs are *strongly* discouraged. Use `defaultValue` instead where possible.
	 *
	 * See https://github.com/facebook/react-native-website/pull/4247
	 */
	value?: string;
	onChangeText?: (value: string) => void;
	isInvalid?: boolean;
	inputRef?: React.RefObject<HTMLInputElement> | React.ForwardedRef<HTMLInputElement>;
	multiline?: boolean;
	returnKeyType?: JSX.IntrinsicElements["input"]["enterKeyHint"];
	type?: JSX.IntrinsicElements["input"]["type"];
	onSubmitEditing?: () => void;
	blurOnSubmit?: boolean;
	enablesReturnKeyAutomatically?: boolean;
};

export function Input({
	label,
	placeholder,
	value,
	onChangeText,
	onFocus,
	onBlur,
	isInvalid,
	inputRef,
	style,
	returnKeyType,
	type = "text",
	onSubmitEditing,
	blurOnSubmit = true,
	enablesReturnKeyAutomatically = false,
	...rest
}: InputProps) {
	const t = useTheme();
	const { fonts } = useAlf();
	const ctx = React.useContext(Context);
	const withinRoot = Boolean(ctx.inputRef);
	const [val, setVal] = useState<string>("");
	const phStyleCName = usePlaceholderStyle(t.palette.contrast_500);

	const { chromeHover, chromeFocus, chromeError, chromeErrorHover } = useSharedInputStyles();

	if (!withinRoot) {
		return (
			<Root isInvalid={isInvalid}>
				<Input
					label={label}
					placeholder={placeholder}
					value={value}
					onChangeText={onChangeText}
					isInvalid={isInvalid}
					onSubmitEditing={onSubmitEditing}
					blurOnSubmit={blurOnSubmit}
					enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
					{...rest}
				/>
			</Root>
		);
	}

	const refs = mergeRefs([ctx.inputRef, inputRef!].filter(Boolean));
	const flattened = flatten([
		a.relative,
		a.z_20,
		a.flex_1,
		a.text_md,
		t.atoms.text,
		a.px_xs,
		{
			// paddingVertical doesn't work w/multiline - esb
			lineHeight: a.text_md.fontSize * 1.1875,

			minHeight: rest.multiline ? 80 : undefined,
			minWidth: 0,
		},
		// fix for autofill styles covering border
		{
			paddingTop: 10,
			paddingBottom: 11,
			marginTop: 2,
			marginBottom: 2,
		},
		style,
	]);
	applyFonts(flattened, fonts.family);

	// should always be defined on `typography`
	if (flattened.fontSize) {
		flattened.fontSize = Math.round(Number.parseFloat(String(flattened.fontSize)) * fonts.scaleMultiplier);
	}

	return (
		<>
			<input
				// hitSlop={HITSLOP_20}
				{...rest}
				ref={refs}
				value={value}
				onChange={(ev) => {
					setVal(ev.target.value);
					onChangeText?.(ev.target.value);
				}}
				onFocus={(e) => {
					ctx.onFocus();
					onFocus?.(e);
				}}
				onBlur={(e) => {
					ctx.onBlur();
					onBlur?.(e);
				}}
				placeholder={placeholder || label}
				style={flattened}
				type={type}
				enterKeyHint={returnKeyType}
				className={phStyleCName}
				onKeyDown={(ev) => {
					if (ev.key === "Enter") {
						if (blurOnSubmit) ev.currentTarget.blur();
						onSubmitEditing?.();
					}
				}}
				disabled={rest.disabled || (enablesReturnKeyAutomatically && val === "")}
			/>
			<div
				style={{
					...a.z_10,
					...a.absolute,
					...a.inset_0,
					...a.rounded_sm,
					...t.atoms.bg_contrast_25,
					...{ borderColor: "transparent", borderWidth: 2 },
					...(ctx.hovered ? chromeHover : {}),
					...(ctx.focused ? chromeFocus : {}),
					...(ctx.isInvalid || isInvalid ? chromeError : {}),
					...((ctx.isInvalid || isInvalid) && (ctx.hovered || ctx.focused) ? chromeErrorHover : {}),
				}}
			/>
		</>
	);
}

export function LabelText({ children }: React.PropsWithChildren) {
	const t = useTheme();
	return (
		<Text
			style={{
				...a.text_sm,
				...a.font_bold,
				...t.atoms.text_contrast_medium,
				...a.mb_sm,
			}}
		>
			{children}
		</Text>
	);
}

export function Icon({ icon: Comp }: { icon: React.ComponentType<SVGIconProps> }) {
	const t = useTheme();
	const ctx = React.useContext(Context);
	const { hover, focus, errorHover, errorFocus } = React.useMemo(() => {
		const hover: React.CSSProperties = { color: t.palette.contrast_800 };
		const focus: React.CSSProperties = { color: t.palette.primary_500 };
		const errorHover: React.CSSProperties = { color: t.palette.negative_500 };
		const errorFocus: React.CSSProperties = { color: t.palette.negative_500 };

		return {
			hover,
			focus,
			errorHover,
			errorFocus,
		};
	}, [t]);

	return (
		<div
			style={{
				...a.z_20,
				...a.pr_xs,
			}}
		>
			<Comp
				size="md"
				style={{
					...{ color: t.palette.contrast_500, pointerEvents: "none", flexShrink: 0 },
					...(ctx.hovered ? hover : {}),
					...(ctx.focused ? focus : {}),
					...(ctx.isInvalid && ctx.hovered ? errorHover : {}),
					...(ctx.isInvalid && ctx.focused ? errorFocus : {}),
				}}
			/>
		</div>
	);
}

export function SuffixText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	const t = useTheme();
	const ctx = React.useContext(Context);
	return (
		<Text
			numberOfLines={1}
			style={{
				...a.z_20,
				...a.pr_sm,
				...a.text_md,
				...t.atoms.text_contrast_medium,
				...a.pointer_events_none,
				...a.leading_snug,
				marginTop: -2,
				...((ctx.hovered || ctx.focused) && { color: t.palette.contrast_800 }),
				...style,
			}}
		>
			{children}
		</Text>
	);
}
