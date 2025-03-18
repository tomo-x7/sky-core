import { useIsFetching } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import type React from "react";
import { useEffect, useState } from "react";
import Animated, { runOnJS, type SharedValue, useAnimatedReaction } from "react-native-reanimated";

import { atoms as a } from "#/alf";
import { RQKEY_ROOT as STARTERPACK_RQKEY_ROOT } from "#/state/queries/actor-starter-packs";
import { RQKEY_ROOT as FEED_RQKEY_ROOT } from "#/state/queries/post-feed";
import { RQKEY_ROOT as FEEDGEN_RQKEY_ROOT } from "#/state/queries/profile-feedgens";
import { RQKEY_ROOT as LIST_RQKEY_ROOT } from "#/state/queries/profile-lists";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function GrowableBanner({
	backButton,
	children,
}: {
	backButton?: React.ReactNode;
	children: React.ReactNode;
}) {
	// plain non-growable mode for Android/Web

	return (
		<div
			style={{
				...a.w_full,
				...a.h_full,
			}}
		>
			{children}
			{backButton}
		</div>
	);
}

function useIsProfileFetching() {
	// are any of the profile-related queries fetching?
	return [
		useIsFetching({ queryKey: [FEED_RQKEY_ROOT] }),
		useIsFetching({ queryKey: [FEEDGEN_RQKEY_ROOT] }),
		useIsFetching({ queryKey: [LIST_RQKEY_ROOT] }),
		useIsFetching({ queryKey: [STARTERPACK_RQKEY_ROOT] }),
	].some((isFetching) => isFetching);
}

function useShouldAnimateSpinner({
	isFetching,
	scrollY,
}: {
	isFetching: boolean;
	scrollY: SharedValue<number>;
}) {
	const [isOverscrolled, setIsOverscrolled] = useState(false);
	// HACK: it reports a scroll pos of 0 for a tick when fetching finishes
	// so paper over that by keeping it true for a bit -sfn
	const stickyIsOverscrolled = useStickyToggle(isOverscrolled, 10);

	useAnimatedReaction(
		() => scrollY.get() < -5,
		(value, prevValue) => {
			if (value !== prevValue) {
				runOnJS(setIsOverscrolled)(value);
			}
		},
		[scrollY],
	);

	const [isAnimating, setIsAnimating] = useState(isFetching);

	if (isFetching && !isAnimating) {
		setIsAnimating(true);
	}

	if (!isFetching && isAnimating && !stickyIsOverscrolled) {
		setIsAnimating(false);
	}

	return isAnimating;
}

// stayed true for at least `delay` ms before returning to false
function useStickyToggle(value: boolean, delay: number) {
	const [prevValue, setPrevValue] = useState(value);
	const [isSticking, setIsSticking] = useState(false);

	useEffect(() => {
		if (isSticking) {
			const timeout = setTimeout(() => setIsSticking(false), delay);
			return () => clearTimeout(timeout);
		}
	}, [isSticking, delay]);

	if (value !== prevValue) {
		setIsSticking(prevValue); // Going true -> false should stick.
		setPrevValue(value);
		return prevValue ? true : value;
	}

	return isSticking ? true : value;
}
