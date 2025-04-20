import { type TextStyleProp, type ViewStyleProp, useTheme } from "#/alf";
import type { Growth_Stroke2_Corner0_Rounded as Growth } from "#/components/icons/Growth";
import type { Props } from "#/components/icons/common";

export function IconCircle({
	icon: Icon,
	size = "xl",
	style,
	iconStyle,
}: ViewStyleProp & {
	icon: typeof Growth;
	size?: Props["size"];
	iconStyle?: TextStyleProp["style"];
}) {
	const t = useTheme();

	return (
		<div
			style={{
				justifyContent: "center",
				alignItems: "center",
				borderRadius: 999,

				...{
					width: size === "lg" ? 52 : 64,
					height: size === "lg" ? 52 : 64,
					backgroundColor: t.palette.primary_50,
				},

				...style,
			}}
		>
			<Icon
				size={size}
				style={{
					...{
						color: t.palette.primary_500,
					},

					...iconStyle,
				}}
			/>
		</div>
	);
}
