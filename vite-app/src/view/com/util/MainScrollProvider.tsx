import EventEmitter from "eventemitter3";
import React, { useCallback, useEffect } from "react";
import type { NativeScrollEvent } from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

import { ScrollProvider } from "#/lib/ScrollContext";
import { isWeb } from "#/platform/detection";
import { useMinimalShellMode } from "#/state/shell";
import { useShellLayout } from "#/state/shell/shell-layout";

const WEB_HIDE_SHELL_THRESHOLD = 200;

function clamp(num: number, min: number, max: number) {
	"worklet";
	return Math.min(Math.max(num, min), max);
}

export function MainScrollProvider({ children }: { children: React.ReactNode }) {
	const { headerHeight } = useShellLayout();
	const { headerMode } = useMinimalShellMode();
	const startDragOffset = useSharedValue<number | null>(null);
	const startMode = useSharedValue<number | null>(null);
	const didJustRestoreScroll = useSharedValue<boolean>(false);

	const setMode = React.useCallback(
		(v: boolean) => {
			"worklet";
			headerMode.set(() =>
				withSpring(v ? 1 : 0, {
					overshootClamping: true,
				}),
			);
		},
		[headerMode],
	);

	useEffect(() => {
		if (isWeb) {
			return listenToForcedWindowScroll(() => {
				startDragOffset.set(null);
				startMode.set(null);
				didJustRestoreScroll.set(true);
			});
		}
	});

	const onScroll = useCallback(
		(e: NativeScrollEvent) => {
			"worklet";
			const offsetY = Math.max(0, e.contentOffset.y);

			if (didJustRestoreScroll.get()) {
				didJustRestoreScroll.set(false);
				// Don't hide/show navbar based on scroll restoratoin.
				return;
			}
			// On the web, we don't try to follow the drag because we don't know when it ends.
			// Instead, show/hide immediately based on whether we're scrolling up or down.
			const dy = offsetY - (startDragOffset.get() ?? 0);
			startDragOffset.set(offsetY);

			if (dy < 0 || offsetY < WEB_HIDE_SHELL_THRESHOLD) {
				setMode(false);
			} else if (dy > 0) {
				setMode(true);
			}
		},
		[setMode, startDragOffset, didJustRestoreScroll],
	);

	return <ScrollProvider onScroll={onScroll}>{children}</ScrollProvider>;
}

const emitter = new EventEmitter();

if (isWeb) {
	const originalScroll = window.scroll;
	window.scroll = function () {
		emitter.emit("forced-scroll");
		// biome-ignore lint/style/noArguments: <explanation>
		return originalScroll.apply(this, arguments as any);
	};

	const originalScrollTo = window.scrollTo;
	window.scrollTo = function () {
		emitter.emit("forced-scroll");
		// biome-ignore lint/style/noArguments: <explanation>
		return originalScrollTo.apply(this, arguments as any);
	};
}

function listenToForcedWindowScroll(listener: () => void) {
	emitter.addListener("forced-scroll", listener);
	return () => {
		emitter.removeListener("forced-scroll", listener);
	};
}
