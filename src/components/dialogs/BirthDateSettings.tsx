import React from "react";

import { atoms as a, useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { DateField } from "#/components/forms/DateField";
import { cleanError } from "#/lib/strings/errors";
import { getDateAgo } from "#/lib/strings/time";
import {
	type UsePreferencesQueryResponse,
	usePreferencesQuery,
	usePreferencesSetBirthDateMutation,
} from "#/state/queries/preferences";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";
import { Button, ButtonIcon, ButtonText } from "../Button";

export function BirthDateSettingsDialog({
	control,
}: {
	control: Dialog.DialogControlProps;
}) {
	const t = useTheme();
	const { isLoading, error, data: preferences } = usePreferencesQuery();

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner label={"My Birthday"}>
				<div
					style={{
						gap: 8,
						paddingBottom: 16,
					}}
				>
					<Text
						style={{
							fontSize: 22,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						My Birthday
					</Text>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
						}}
					>
						This information is not shared with other users.
					</Text>
				</div>

				{isLoading ? (
					<Loader size="xl" />
				) : error || !preferences ? (
					<ErrorMessage
						message={
							error?.toString() || "We were unable to load your birth date preferences. Please try again."
						}
						style={{ ...a.rounded_sm }}
					/>
				) : (
					<BirthdayInner control={control} preferences={preferences} />
				)}

				<Dialog.Close />
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}

function BirthdayInner({
	control,
	preferences,
}: {
	control: Dialog.DialogControlProps;
	preferences: UsePreferencesQueryResponse;
}) {
	const [date, setDate] = React.useState(preferences.birthDate || new Date());
	const { isPending, isError, error, mutateAsync: setBirthDate } = usePreferencesSetBirthDateMutation();
	const hasChanged = date !== preferences.birthDate;

	const onSave = React.useCallback(async () => {
		try {
			// skip if date is the same
			if (hasChanged) {
				await setBirthDate({ birthDate: date });
			}
			control.close();
		} catch (e: unknown) {
			console.error("setBirthDate failed", { message: (e as { message: unknown }).message });
		}
	}, [date, setBirthDate, control, hasChanged]);

	return (
		<div style={{ gap: 16 }}>
			<div>
				<DateField
					value={date}
					onChangeDate={(newDate) => setDate(new Date(newDate))}
					label={"Birthday"}
					maximumDate={getDateAgo(13)}
				/>
			</div>
			{isError ? <ErrorMessage message={cleanError(error)} style={{ ...a.rounded_sm }} /> : undefined}
			<div
				style={{
					flexDirection: "row",
					justifyContent: "flex-end",
				}}
			>
				<Button
					label={hasChanged ? "Save birthday" : "Done"}
					size="large"
					onPress={onSave}
					variant="solid"
					color="primary"
				>
					<ButtonText>{hasChanged ? <>Save</> : <>Done</>}</ButtonText>
					{isPending && <ButtonIcon icon={Loader} />}
				</Button>
			</div>
		</div>
	);
}
