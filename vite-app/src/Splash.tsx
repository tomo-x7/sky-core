import React, { useCallback, useEffect } from "react";
import Animated, {
	Easing,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "#/lib/useColorScheme";

import darkSplashImage from "./assets/splash-dark.png";
import splashImage from "./assets/splash.png";
import { useOnLayout } from "./components/hooks/useOnLayout";
import { useReduceMotion } from "./lib/useReduceMotion";
import { Logotype } from "./view/icons/Logotype";

export const Logo = React.forwardRef(function LogoImpl(props: React.SVGProps<SVGSVGElement>, ref) {
	const width = 1000;
	const height = width * (67 / 64);
	return (
		<svg
			fill="none"
			// @ts-expect-error it's fiiiiine
			ref={ref}
			viewBox="0 0 64 66"
			style={{ width, height, ...props.style }}
		>
			<path
				fill={props.fill || "#fff"}
				d="M13.873 3.77C21.21 9.243 29.103 20.342 32 26.3v15.732c0-.335-.13.043-.41.858-1.512 4.414-7.418 21.642-20.923 7.87-7.111-7.252-3.819-14.503 9.125-16.692-7.405 1.252-15.73-.817-18.014-8.93C1.12 22.804 0 8.431 0 6.488 0-3.237 8.579-.18 13.873 3.77ZM50.127 3.77C42.79 9.243 34.897 20.342 32 26.3v15.732c0-.335.13.043.41.858 1.512 4.414 7.418 21.642 20.923 7.87 7.111-7.252 3.819-14.503-9.125-16.692 7.405 1.252 15.73-.817 18.014-8.93C62.88 22.804 64 8.431 64 6.488 64-3.237 55.422-.18 50.127 3.77Z"
			/>
			<title>a</title>
		</svg>
	);
});

type Props = {
	isReady: boolean;
};

export function Splash(props: React.PropsWithChildren<Props>) {
	"use no memo";
	const intro = useSharedValue(0);
	const outroLogo = useSharedValue(0);
	const outroApp = useSharedValue(0);
	const outroAppOpacity = useSharedValue(0);
	const [isAnimationComplete, setIsAnimationComplete] = React.useState(false);
	const [isImageLoaded, setIsImageLoaded] = React.useState(false);
	const [isLayoutReady, setIsLayoutReady] = React.useState(false);
	const reduceMotion = useReduceMotion();
	const isReady = props.isReady && isImageLoaded && isLayoutReady && reduceMotion !== undefined;

	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	const logoAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: interpolate(intro.get(), [0, 1], [0.8, 1], "clamp"),
				},
				{
					scale: interpolate(outroLogo.get(), [0, 0.08, 1], [1, 0.8, 500], "clamp"),
				},
			],
			opacity: interpolate(intro.get(), [0, 1], [0, 1], "clamp"),
		};
	});
	const bottomLogoAnimation = useAnimatedStyle(() => {
		return {
			opacity: interpolate(intro.get(), [0, 1], [0, 1], "clamp"),
		};
	});
	const reducedLogoAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: interpolate(intro.get(), [0, 1], [0.8, 1], "clamp"),
				},
			],
			opacity: interpolate(intro.get(), [0, 1], [0, 1], "clamp"),
		};
	});

	const logoWrapperAnimation = useAnimatedStyle(() => {
		return {
			opacity: interpolate(outroAppOpacity.get(), [0, 0.1, 0.2, 1], [1, 1, 0, 0], "clamp"),
		};
	});

	const appAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: interpolate(outroApp.get(), [0, 1], [1.1, 1], "clamp"),
				},
			],
			opacity: interpolate(outroAppOpacity.get(), [0, 0.1, 0.2, 1], [0, 0, 1, 1], "clamp"),
		};
	});

	const onFinish = useCallback(() => setIsAnimationComplete(true), []);
	const onLayout = useCallback(() => setIsLayoutReady(true), []);
	const onLoadEnd = useCallback(() => setIsImageLoaded(true), []);

	useEffect(() => {
		if (isReady) {
			intro.set(() =>
				withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }, async () => {
					// set these values to check animation at specific point
					outroLogo.set(() =>
						withTiming(1, { duration: 1200, easing: Easing.in(Easing.cubic) }, () => {
							runOnJS(onFinish)();
						}),
					);
					outroApp.set(() =>
						withTiming(1, {
							duration: 1200,
							easing: Easing.inOut(Easing.cubic),
						}),
					);
					outroAppOpacity.set(() =>
						withTiming(1, {
							duration: 1200,
							easing: Easing.in(Easing.cubic),
						}),
					);
				}),
			);
		}
	}, [onFinish, intro, outroLogo, outroApp, outroAppOpacity, isReady]);

	const logoAnimations = reduceMotion === true ? reducedLogoAnimation : logoAnimation;
	// special off-spec color for dark mode
	const logoBg = isDarkMode ? "#0F1824" : "#fff";

	return (
		<div style={{ flex: 1 }} ref={useOnLayout(onLayout)}>
			{!isAnimationComplete && (
				<div style={absoluteFillObject}>
					<img
						onLoad={onLoadEnd}
						src={isDarkMode ? darkSplashImage : splashImage}
						style={absoluteFillObject}
					/>

					<Animated.View
						style={{
							...bottomLogoAnimation,

							position: "absolute",
							bottom: 40,
							left: 0,
							right: 0,
							alignItems: "center",
							justifyContent: "center",
							opacity: 0,
						}}
					>
						<Logotype fill="#fff" width={90} />
					</Animated.View>
				</div>
			)}
			{isReady && (
				<>
					<Animated.View style={{ flex: 1, ...appAnimation }}>{props.children}</Animated.View>

					{!isAnimationComplete && (
						<Animated.View
							style={{
								...absoluteFillObject,
								...logoWrapperAnimation,

								flex: 1,
								justifyContent: "center",
								alignItems: "center",
								transform: [{ translateY: 0 }, { scale: 0.1 }], // scale from 1000px to 100px
							}}
						>
							<Animated.View style={logoAnimations}>
								<Logo fill={logoBg} />
							</Animated.View>
						</Animated.View>
					)}
				</>
			)}
		</div>
	);
}

const absoluteFillObject = {
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: "100%",
	height: "100%",
} as const;
