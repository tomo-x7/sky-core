import { memo } from "react";
import { View } from "react-native";
import { styles } from "./styles";
import type { BottomSheetBackgroundProps } from "./types";

const BottomSheetBackgroundComponent = ({ pointerEvents, style }: BottomSheetBackgroundProps) => (
	<div
		pointerEvents={pointerEvents}
		accessible={true}
		accessibilityRole="adjustable"
		accessibilityLabel="Bottom Sheet"
		style={{
			...styles.container,
			...style,
		}}
	/>
);

const BottomSheetBackground = memo(BottomSheetBackgroundComponent);
BottomSheetBackground.displayName = "BottomSheetBackground";

export default BottomSheetBackground;
