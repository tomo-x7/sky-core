import type Animated from "react-native-reanimated";
import ReText from "./ReText";
import { styles } from "./styles";

interface BottomSheetDebugViewProps {
	values: Record<string, Animated.SharedValue<number | boolean> | number>;
}

const BottomSheetDebugView = ({ values }: BottomSheetDebugViewProps) => {
	return (
		<div style={{ ...styles.container, pointerEvents: "none" }}>
			{Object.keys(values).map((key) => (
				<ReText key={`item-${key}`} value={values[key]} style={styles.text} text={key} />
			))}
		</div>
	);
};

export default BottomSheetDebugView;
