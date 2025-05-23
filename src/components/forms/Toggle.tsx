import React from "react";

import { type TextStyleProp, flatten, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { CheckThick_Stroke2_Corner0_Rounded as Checkmark } from "#/components/icons/Check";

export type ItemState = {
	name: string;
	selected: boolean;
	disabled: boolean;
	isInvalid: boolean;
	hovered: boolean;
	pressed: boolean;
	focused: boolean;
};

const ItemContext = React.createContext<ItemState>({
	name: "",
	selected: false,
	disabled: false,
	isInvalid: false,
	hovered: false,
	pressed: false,
	focused: false,
});

const GroupContext = React.createContext<{
	values: string[];
	disabled: boolean;
	type: "radio" | "checkbox";
	maxSelectionsReached: boolean;
	setFieldValue: (props: { name: string; value: boolean }) => void;
}>({
	type: "checkbox",
	values: [],
	disabled: false,
	maxSelectionsReached: false,
	setFieldValue: () => {},
});

export type GroupProps = React.PropsWithChildren<{
	type?: "radio" | "checkbox";
	values: string[];
	maxSelections?: number;
	disabled?: boolean;
	onChange: (value: string[]) => void;
	label: string;
}>;

export type ItemProps = Omit<JSX.IntrinsicElements["input"], "value" | "onChange" | "ref"> & {
	type?: "radio" | "checkbox";
	name: string;
	label: string;
	value?: boolean;
	disabled?: boolean;
	onChange?: (selected: boolean) => void;
	isInvalid?: boolean;
	children: ((props: ItemState) => React.ReactNode) | React.ReactNode;
};

export function useItemContext() {
	return React.useContext(ItemContext);
}

export function Group({
	children,
	values: providedValues,
	onChange,
	disabled = false,
	type = "checkbox",
	maxSelections,
	label,
}: GroupProps) {
	const groupRole = type === "radio" ? "radiogroup" : undefined;
	const values = type === "radio" ? providedValues.slice(0, 1) : providedValues;
	const [maxReached, setMaxReached] = React.useState(false);

	const setFieldValue = React.useCallback<(props: { name: string; value: boolean }) => void>(
		({ name, value }) => {
			if (type === "checkbox") {
				const pruned = values.filter((v) => v !== name);
				const next = value ? pruned.concat(name) : pruned;
				onChange(next);
			} else {
				onChange([name]);
			}
		},
		[type, onChange, values],
	);

	React.useEffect(() => {
		if (type === "checkbox") {
			if (maxSelections && values.length >= maxSelections && maxReached === false) {
				setMaxReached(true);
			} else if (maxSelections && values.length < maxSelections && maxReached === true) {
				setMaxReached(false);
			}
		}
	}, [type, values.length, maxSelections, maxReached]);

	const context = React.useMemo(
		() => ({
			values,
			type,
			disabled,
			maxSelectionsReached: maxReached,
			setFieldValue,
		}),
		[values, disabled, type, maxReached, setFieldValue],
	);

	return (
		<GroupContext.Provider value={context}>
			<div
				style={{ width: "100%" }}
				role={groupRole}
				{...(groupRole === "radiogroup"
					? {
							"aria-label": label,
							accessibilityLabel: label,
							accessibilityRole: groupRole,
						}
					: {})}
			>
				{children}
			</div>
		</GroupContext.Provider>
	);
}

export function Item({
	children,
	name,
	value,
	disabled: itemDisabled = false,
	onChange,
	isInvalid,
	style,
	type = "checkbox",
	label,
	...rest
}: ItemProps) {
	const {
		values: selectedValues,
		type: groupType,
		disabled: groupDisabled,
		setFieldValue,
		maxSelectionsReached,
	} = React.useContext(GroupContext);
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	const { state: pressed, onIn: onPressIn, onOut: onPressOut } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();

	const role = groupType === "radio" ? "radio" : type;
	const selected = selectedValues.includes(name) || !!(value ?? false);
	const disabled = groupDisabled || itemDisabled || (!selected && maxSelectionsReached);

	const onPress = React.useCallback(() => {
		const next = !selected;
		setFieldValue({ name, value: next });
		onChange?.(next);
	}, [name, selected, onChange, setFieldValue]);

	const state = React.useMemo(
		() => ({
			name,
			selected,
			disabled: disabled ?? false,
			isInvalid: isInvalid ?? false,
			hovered,
			pressed,
			focused,
		}),
		[name, selected, disabled, hovered, pressed, focused, isInvalid],
	);

	return (
		<ItemContext.Provider value={state}>
			<label>
				<input
					// hitSlop={HITSLOP_10}
					{...rest}
					disabled={disabled}
					aria-disabled={disabled ?? false}
					aria-checked={selected}
					aria-invalid={isInvalid}
					aria-label={label}
					role={role}
					onClick={onPress}
					onMouseEnter={onHoverIn}
					onMouseLeave={onHoverOut}
					onMouseDown={onPressIn}
					onMouseUp={onPressOut}
					onFocus={onFocus}
					onBlur={onBlur}
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
						...style,
					}}
				/>
				{typeof children === "function" ? children(state) : children}
			</label>
		</ItemContext.Provider>
	);
}

export function LabelText({ children, style }: React.PropsWithChildren<TextStyleProp>) {
	const t = useTheme();
	const { disabled } = useItemContext();
	return (
		<Text
			style={{
				fontWeight: "600",
				lineHeight: 1.15,

				...{
					userSelect: "none",
					color: disabled ? t.atoms.text_contrast_low.color : t.atoms.text_contrast_high.color,
				},

				...style,
			}}
		>
			{children}
		</Text>
	);
}

// TODO(eric) refactor to memoize styles without knowledge of state
export function createSharedToggleStyles({
	theme: t,
	hovered,
	selected,
	disabled,
	isInvalid,
}: {
	theme: ReturnType<typeof useTheme>;
	selected: boolean;
	hovered: boolean;
	focused: boolean;
	disabled: boolean;
	isInvalid: boolean;
}) {
	const base: React.CSSProperties[] = [];
	const baseHover: React.CSSProperties[] = [];
	const indicator: React.CSSProperties[] = [];

	if (selected) {
		base.push({
			backgroundColor: t.palette.primary_25,
			borderColor: t.palette.primary_500,
		});

		if (hovered) {
			baseHover.push({
				backgroundColor: t.palette.primary_100,
				borderColor: t.palette.primary_600,
			});
		}
	} else {
		if (hovered) {
			baseHover.push({
				backgroundColor: t.palette.contrast_50,
				borderColor: t.palette.contrast_500,
			});
		}
	}

	if (isInvalid) {
		base.push({
			backgroundColor: t.palette.negative_25,
			borderColor: t.palette.negative_300,
		});

		if (hovered) {
			baseHover.push({
				backgroundColor: t.palette.negative_25,
				borderColor: t.palette.negative_600,
			});
		}
	}

	if (disabled) {
		base.push({
			backgroundColor: t.palette.contrast_100,
			borderColor: t.palette.contrast_400,
		});
	}

	return {
		baseStyles: flatten(base),
		baseHoverStyles: disabled ? {} : flatten(baseHover),
		indicatorStyles: flatten(indicator),
	};
}

export function Checkbox() {
	const t = useTheme();
	const { selected, hovered, focused, disabled, isInvalid } = useItemContext();
	const { baseStyles, baseHoverStyles } = createSharedToggleStyles({
		theme: t,
		hovered,
		focused,
		selected,
		disabled,
		isInvalid,
	});
	return (
		<div
			style={{
				justifyContent: "center",
				alignItems: "center",
				borderRadius: 4,
				...t.atoms.border_contrast_high,

				borderWidth: 1,
				height: 24,
				width: 24,

				...baseStyles,
				...(hovered ? baseHoverStyles : {}),
			}}
		>
			{selected ? <Checkmark size="xs" fill={t.palette.primary_500} /> : null}
		</div>
	);
}

export function Switch() {
	const t = useTheme();
	const { selected, hovered, focused, disabled, isInvalid } = useItemContext();
	const { baseStyles, baseHoverStyles, indicatorStyles } = createSharedToggleStyles({
		theme: t,
		hovered,
		focused,
		selected,
		disabled,
		isInvalid,
	});
	return (
		<div
			style={{
				position: "relative",
				borderRadius: 999,
				...t.atoms.bg,
				...t.atoms.border_contrast_high,

				...{
					borderWidth: 1,
					height: 24,
					width: 36,
					padding: 3,
				},

				...baseStyles,
				...(hovered ? baseHoverStyles : {}),
			}}
		>
			<div
				// Animated.View
				// layout={LinearTransition.duration(100)}
				style={{
					borderRadius: 999,
					height: 16,
					width: 16,
					...(selected
						? { backgroundColor: t.palette.primary_500, alignSelf: "flex-end" }
						: { backgroundColor: t.palette.contrast_400, alignSelf: "flex-start" }),
					...indicatorStyles,
				}}
			/>
		</div>
	);
}

export function Radio() {
	const t = useTheme();
	const { selected, hovered, focused, disabled, isInvalid } = React.useContext(ItemContext);
	const { baseStyles, baseHoverStyles, indicatorStyles } = createSharedToggleStyles({
		theme: t,
		hovered,
		focused,
		selected,
		disabled,
		isInvalid,
	});
	return (
		<div
			style={{
				justifyContent: "center",
				alignItems: "center",
				borderRadius: 999,
				...t.atoms.border_contrast_high,

				...{
					borderWidth: 1,
					height: 24,
					width: 24,
				},

				...baseStyles,
				...(hovered ? baseHoverStyles : {}),
			}}
		>
			{selected ? (
				<div
					style={{
						position: "absolute",
						borderRadius: 999,
						...{ height: 16, width: 16 },

						...(selected
							? {
									backgroundColor: t.palette.primary_500,
								}
							: {}),

						...indicatorStyles,
					}}
				/>
			) : null}
		</div>
	);
}

export const Platform = Checkbox;
