import React from "react";

import { atoms as a, flatten, useTheme } from "#/alf";
import type { Avatar } from "#/screens/Onboarding/StepProfile/index";

export function AvatarCreatorCircle({
	avatar,
	size = 125,
}: {
	avatar: Avatar;
	size?: number;
}) {
	const t = useTheme();
	const Icon = avatar.placeholder.component;

	const styles = React.useMemo(
		() => ({
			imageContainer: flatten([
				a.rounded_full,
				a.overflow_hidden,
				a.align_center,
				a.justify_center,
				a.border,
				t.atoms.border_contrast_high,
				{
					height: size,
					width: size,
					backgroundColor: avatar.backgroundColor,
				},
			]),
		}),
		[avatar.backgroundColor, size, t.atoms.border_contrast_high],
	);

	return (
		<div>
			<div style={styles.imageContainer}>
				<Icon height={85} width={85} style={{ color: t.palette.white }} />
			</div>
		</div>
	);
}
