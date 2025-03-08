import type {
	TouchableHighlight as RNTouchableHighlight,
	TouchableOpacity as RNTouchableOpacity,
	TouchableWithoutFeedback as RNTouchableWithoutFeedback,
} from "react-native";

import {
	TouchableHighlight,
	TouchableOpacity,
	TouchableWithoutFeedback,
	// @ts-ignore
} from "./Touchables";

export default {
	TouchableOpacity: TouchableOpacity as any as typeof RNTouchableOpacity,
	TouchableHighlight: TouchableHighlight as any as typeof RNTouchableHighlight,
	TouchableWithoutFeedback: TouchableWithoutFeedback as any as typeof RNTouchableWithoutFeedback,
};
