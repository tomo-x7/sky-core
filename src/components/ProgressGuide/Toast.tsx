import React, { useImperativeHandle } from "react";

import { useTheme } from "#/alf";
import { Portal } from "#/components/Portal";
import { useWindowDimensions } from "#/components/hooks/useWindowDimensions";
import { Text } from "../Typography";
import { AnimatedCheck, type AnimatedCheckRef } from "../anim/AnimatedCheck";

export interface ProgressGuideToastRef {
	open(): void;
	close(): void;
}

export interface ProgressGuideToastProps {
	title: string;
	subtitle?: string;
	visibleDuration?: number; // default 5s
}

export const ProgressGuideToast = React.forwardRef<ProgressGuideToastRef, ProgressGuideToastProps>(
	function ProgressGuideToast({ title, subtitle, visibleDuration }, ref) {
		const t = useTheme();
		const [isOpen, setIsOpen] = React.useState(false);
		// const translateY = useSharedValue(0);
		// const opacity = useSharedValue(0);
		const animatedCheckRef = React.useRef<AnimatedCheckRef | null>(null);
		const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
		const winDim = useWindowDimensions();

		/**
		 * Methods
		 */

		const close = React.useCallback(() => {
			// clear the timeout, in case this was called imperatively
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}

			// animate the opacity then set isOpen to false when done
			// const setIsntOpen = () => setIsOpen(false);
			// opacity.set(() =>
			// 	withTiming(
			// 		0,
			// 		{
			// 			duration: 400,
			// 			easing: Easing.out(Easing.cubic),
			// 		},
			// 		() => runOnJS(setIsntOpen)(),
			// 	),
			// );
		}, []);

		const open = React.useCallback(() => {
			// set isOpen=true to render
			setIsOpen(true);

			// animate the vertical translation, the opacity, and the checkmark
			// const playCheckmark = () => animatedCheckRef.current?.play();
			// opacity.set(0);
			// opacity.set(() =>
			// 	withTiming(
			// 		1,
			// 		{
			// 			duration: 100,
			// 			easing: Easing.out(Easing.cubic),
			// 		},
			// 		() => runOnJS(playCheckmark)(),
			// 	),
			// );
			// translateY.set(0);
			// translateY.set(() =>
			// 	withTiming(10, {
			// 		duration: 500,
			// 		easing: Easing.out(Easing.cubic),
			// 	}),
			// );

			// start the countdown timer to autoclose
			timeoutRef.current = setTimeout(close, visibleDuration || 5e3);
		}, [close, visibleDuration]);

		useImperativeHandle(
			ref,
			() => ({
				open,
				close,
			}),
			[open, close],
		);

		const containerStyle = React.useMemo(() => {
			let left = 10;
			let right = 10;
			if (winDim.width > 400) {
				left = right = (winDim.width - 380) / 2;
			}
			return {
				position: "fixed",
				top: 0,
				left,
				right,
			} satisfies React.CSSProperties;
		}, [winDim.width]);

		// const animatedStyle = useAnimatedStyle(() => ({
		// 	transform: `translateY(${translateY.get()}px)`,
		// 	opacity: opacity.get(),
		// }));

		return (
			isOpen && (
				<Portal>
					<div
						// Animated.View
						style={{
							...containerStyle,
							// ...animatedStyle,
						}}
					>
						<button
							type="button"
							style={{
								...t.atoms.bg,
								flexDirection: "row",
								alignItems: "center",
								gap: 12,
								border: "1px solid black",
								borderWidth: 1,
								...t.atoms.border_contrast_high,
								borderRadius: 12,
								paddingLeft: 16,
								paddingRight: 16,
								paddingTop: 12,
								paddingBottom: 12,
								boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
							}}
							onClick={close}
						>
							<AnimatedCheck fill={t.palette.primary_500} ref={animatedCheckRef} />
							<div>
								<Text
									style={{
										fontSize: 16,
										letterSpacing: 0,
										fontWeight: "600",
									}}
								>
									{title}
								</Text>
								{subtitle && (
									<Text
										style={{
											fontSize: 14,
											letterSpacing: 0,
											...t.atoms.text_contrast_medium,
										}}
									>
										{subtitle}
									</Text>
								)}
							</div>
						</button>
					</div>
				</Portal>
			)
		);
	},
);
