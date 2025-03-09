import { useWindowDimensions } from "react-native";

import { useBottomBarOffset } from "#/lib/hooks/useBottomBarOffset";

const MIN_POST_HEIGHT = 100;

export function useInitialNumToRender({
	minItemHeight = MIN_POST_HEIGHT,
	screenHeightOffset = 0,
}: { minItemHeight?: number; screenHeightOffset?: number } = {}) {
	const { height: screenHeight } = useWindowDimensions();
	const bottomBarHeight = useBottomBarOffset();

	const finalHeight = screenHeight - screenHeightOffset - bottomBarHeight;

	const minItems = Math.floor(finalHeight / minItemHeight);
	if (minItems < 1) {
		return 1;
	}
	return minItems;
}
