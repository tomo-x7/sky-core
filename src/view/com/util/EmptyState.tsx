import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Text } from "#/components/Typography";
import { Growth_Stroke2_Corner0_Rounded as Growth } from "#/components/icons/Growth";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { UserGroupIcon } from "#/lib/icons";

export function EmptyState({
	icon,
	message,
	style,
}: {
	icon: IconProp | "user-group" | "growth";
	message: string;
	style?: React.CSSProperties;
}) {
	const pal = usePalette("default");
	const { isTabletOrDesktop } = useWebMediaQueries();
	const iconSize = isTabletOrDesktop ? 64 : 48;
	return (
		<div style={style}>
			<div
				style={{
					...styles.iconContainer,
					...(isTabletOrDesktop && styles.iconContainerBig),
					...pal.viewLight,
				}}
			>
				{icon === "user-group" ? (
					<UserGroupIcon size={iconSize} />
				) : icon === "growth" ? (
					<Growth width={iconSize} fill={pal.colors.emptyStateIcon} />
				) : (
					// @ts-expect-error
					<FontAwesomeIcon icon={icon} size={iconSize} style={{ color: pal.colors.emptyStateIcon }} />
				)}
			</div>
			<Text
				type="xl"
				style={{
					...{ color: pal.colors.textLight },
					...styles.text,
				}}
			>
				{message}
			</Text>
		</div>
	);
}

const styles = {
	iconContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 80,
		width: 80,
		marginLeft: "auto",
		marginRight: "auto",
		borderRadius: 80,
		marginTop: 30,
	},
	iconContainerBig: {
		width: 100,
		height: 100,
		marginTop: 50,
	},
	text: {
		textAlign: "center",
		paddingTop: 20,
	},
} satisfies Record<string, React.CSSProperties>;
