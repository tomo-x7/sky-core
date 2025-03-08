import { type FlashListProps, FlashList as ShopifyFlashList } from "@shopify/flash-list";
import * as React from "react";
import Animated from "react-native-reanimated";
import { SCROLLABLE_TYPE } from "../../constants";
import BottomSheetScrollView from "./BottomSheetScrollView";
import { createBottomSheetScrollableComponent } from "./createBottomSheetScrollableComponent";
import type { BottomSheetFlashListMethods, BottomSheetFlashListProps } from "./types";

const AnimatedShopifyFlashList = Animated.createAnimatedComponent(ShopifyFlashList);
const AnimatedFlashList = React.forwardRef<any, FlashListProps<any>>((props, ref) => (
	<AnimatedShopifyFlashList
		ref={ref}
		// @ts-ignore
		renderScrollComponent={BottomSheetScrollView}
		{...props}
	/>
));

const BottomSheetFlashListComponent = createBottomSheetScrollableComponent<
	BottomSheetFlashListMethods,
	BottomSheetFlashListProps<any>
>(SCROLLABLE_TYPE.FLASHLIST, AnimatedFlashList);

const BottomSheetFlashList = React.memo(BottomSheetFlashListComponent);
BottomSheetFlashList.displayName = "BottomSheetFlashList";

export default BottomSheetFlashList as <T>(
	props: BottomSheetFlashListProps<T>,
) => ReturnType<typeof BottomSheetFlashList>;
