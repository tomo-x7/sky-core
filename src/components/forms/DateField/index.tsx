import React from "react";

import type { DateFieldProps } from "#/components/forms/DateField/types";
import { toSimpleDateString } from "#/components/forms/DateField/utils";
import * as TextField from "#/components/forms/TextField";
import { CalendarDays_Stroke2_Corner0_Rounded as CalendarDays } from "#/components/icons/CalendarDays";

export * as utils from "#/components/forms/DateField/utils";
export const LabelText = TextField.LabelText;

const InputBase = React.forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(({ style, ...props }, ref) => {
	return <input type="date" ref={ref} style={{ ...style, background: "transparent", border: 0 }} {...props} />;
});

export function DateField({ value, inputRef, onChangeDate, label, isInvalid, maximumDate }: DateFieldProps) {
	const handleOnChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const date = e.target.valueAsDate || e.target.value;

			if (date) {
				const formatted = toSimpleDateString(date);
				onChangeDate(formatted);
			}
		},
		[onChangeDate],
	);

	return (
		<TextField.Root isInvalid={isInvalid}>
			<TextField.Icon icon={CalendarDays} />
			<TextField.Input
				value={toSimpleDateString(value)}
				inputRef={inputRef}
				label={label}
				onChange={handleOnChange}
				max={maximumDate ? toSimpleDateString(maximumDate) : undefined}
				style={{ background: "transparent", border: 0 }}
				type="date"
			/>
		</TextField.Root>
	);
}
