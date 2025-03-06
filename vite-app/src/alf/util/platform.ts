import { Platform } from "react-native";

import { isAndroid, isIOS, isNative, isWeb } from "../../platform/detection";

/**
 * Identity function on web. Returns nothing on other platforms.
 *
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export function web<T>(value: T) {
	if (isWeb) {
		return value;
	}
}

/**
 * Identity function on iOS. Returns nothing on other platforms.
 *
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export function ios<T>(value: T) {
	if (isIOS) {
		return value;
	}
}

/**
 * Identity function on Android. Returns nothing on other platforms..
 *
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export function android<T>(value: T) {
	if (isAndroid) {
		return value;
	}
}

/**
 * Identity function on iOS and Android. Returns nothing on web.
 *
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export function native<T>(value: T) {
	if (isNative) {
		return value;
	}
}

/**
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export const platform = Platform.select;
