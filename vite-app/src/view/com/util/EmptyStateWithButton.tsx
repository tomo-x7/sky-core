import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";
import { Button } from "./forms/Button";

interface Props {
	icon: IconProp;
	message: string;
	buttonLabel: string;
	onPress: () => void;
}

export function EmptyStateWithButton(props: Props) {
	const pal = usePalette("default");
	const palInverted = usePalette("inverted");

	return (
		<div style={styles.container}>
			<div style={styles.iconContainer}>
				<FontAwesomeIcon
					icon={props.icon}
					style={{
						...styles.icon,
						...pal.text,
					}}
					// @ts-expect-error
					size={62}
				/>
			</div>
			<Text
				type="xl-medium"
				style={{
					...s.textCenter,
					...pal.text,
				}}
			>
				{props.message}
			</Text>
			<div style={styles.btns}>
				<Button type="inverted" style={styles.btn} onPress={props.onPress}>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon="plus" style={palInverted.text} size={14} />
					<Text type="lg-medium" style={palInverted.text}>
						{props.buttonLabel}
					</Text>
				</Button>
			</div>
		</div>
	);
}
const styles = {
	container: {
		height: "100%",
		padding: "40px 30px",
	},
	iconContainer: {
		marginBottom: 16,
	},
	icon: {
		marginLeft: "auto",
		marginRight: "auto",
	},
	btns: {
		flexDirection: "row",
		justifyContent: "center",
	},
	btn: {
		gap: 10,
		marginTop: 20,
		marginBottom: 20,
		flexDirection: "row",
		alignItems: "center",
		padding: "14px 24px",
		borderRadius: 30,
	},
	notice: {
		borderRadius: 12,
		padding: "10px 12px",
		marginLeft: 30,
		marginRight: 30,
	},
} satisfies Record<string, React.CSSProperties>;
