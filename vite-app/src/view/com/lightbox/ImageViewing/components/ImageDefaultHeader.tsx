import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SafeAreaView } from "#/lib/safe-area-context";

type Props = {
	onRequestClose: () => void;
};

// const HIT_SLOP = createHitslop(16);

const ImageDefaultHeader = ({ onRequestClose }: Props) => {
	return (
		<SafeAreaView style={{ ...styles.root, pointerEvents: "none" }}>
			<button
				style={{
					...styles.closeButton,
					...styles.blurredBackground,
					pointerEvents: "auto",
				}}
				onClick={onRequestClose}
				// TODO
				// hitSlop={HIT_SLOP}
				type="button"
				// TODO
				// onAccessibilityEscape={onRequestClose}
			>
				<FontAwesomeIcon icon="close" color={"#fff"} /*size={22}*/ size="xl" />
			</button>
		</SafeAreaView>
	);
};

const styles = {
	root: {
		alignItems: "flex-end",
	},
	closeButton: {
		marginRight: 10,
		marginTop: 10,
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 22,
		backgroundColor: "#00000077",
	},
	blurredBackground: {
		backdropFilter: "blur(10px)",
		WebkitBackdropFilter: "blur(10px)",
	},
} satisfies Record<string, React.CSSProperties>;

export default ImageDefaultHeader;
