import { requireNativeModule, requireNativeViewManager } from "expo-modules-core";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { VisibilityViewProps } from "./types";
const NativeView: React.ComponentType<{
	onChangeStatus: (e: { nativeEvent: { isActive: boolean } }) => void;
	children: React.ReactNode;
	enabled: boolean;
	style: StyleProp<ViewStyle>;
}> = requireNativeViewManager("ExpoBlueskyVisibilityView");

const NativeModule = requireNativeModule("ExpoBlueskyVisibilityView");

export async function updateActiveViewAsync() {
	await NativeModule.updateActiveViewAsync();
}

export default function VisibilityView({
	children,
	onChangeStatus: onChangeStatusOuter,
	enabled,
}: VisibilityViewProps) {
	const onChangeStatus = React.useCallback(
		(e: { nativeEvent: { isActive: boolean } }) => {
			onChangeStatusOuter(e.nativeEvent.isActive);
		},
		[onChangeStatusOuter],
	);

	return (
		<NativeView onChangeStatus={onChangeStatus} enabled={enabled} style={{ flex: 1 }}>
			{children}
		</NativeView>
	);
}
