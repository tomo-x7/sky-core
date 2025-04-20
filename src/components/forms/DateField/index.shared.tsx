import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { CalendarDays_Stroke2_Corner0_Rounded as CalendarDays } from "#/components/icons/CalendarDays";

// looks like a TextField.Input, but is just a button. It'll do something different on each platform on press
// iOS: open a dialog with an inline date picker
// Android: open the date picker modal

export function DateFieldButton({
	label,
	value,
	onPress,
	isInvalid,
	accessibilityHint,
}: {
	label: string;
	value: string | Date;
	onPress: () => void;
	isInvalid?: boolean;
	accessibilityHint?: string;
}) {
	const t = useTheme();

	const { state: pressed, onIn: onPressIn, onOut: onPressOut } = useInteractionState();
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();

	const { chromeHover, chromeFocus, chromeError, chromeErrorHover } = TextField.useSharedInputStyles();

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
			}}
			{...{
				onMouseOver: onHoverIn,
				onMouseOut: onHoverOut,
			}}
		>
			<button
				type="button"
				aria-label={label}
				onClick={onPress}
				onMouseEnter={onPressIn}
				onMouseLeave={onPressOut}
				onFocus={onFocus}
				onBlur={onBlur}
				style={{
					paddingLeft: 14,
					paddingRight: 14,
					borderColor: "transparent",
					borderWidth: 2,

					paddingTop: 12,
					paddingBottom: 12,
					flexDirection: "row",
					flex: 1,
					width: "100%",
					borderRadius: 8,
					...t.atoms.bg_contrast_25,
					alignItems: "center",
					...(hovered ? chromeHover : {}),
					...(focused || pressed ? chromeFocus : {}),
					...(isInvalid || isInvalid ? chromeError : {}),
					...((isInvalid || isInvalid) && (hovered || focused) ? chromeErrorHover : {}),
				}}
			>
				<TextField.Icon icon={CalendarDays} />
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						paddingLeft: 4,
						...t.atoms.text,
						...{ lineHeight: 16 * 1.1875 },
					}}
				>
					{new Date(value).toUTCString()}
				</Text>
			</button>
		</div>
	);
}
