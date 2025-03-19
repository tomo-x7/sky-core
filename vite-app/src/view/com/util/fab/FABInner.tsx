import { LinearGradient } from "expo-linear-gradient";
import type { JSX } from "react";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useMinimalShellFabTransform } from "#/lib/hooks/useMinimalShellTransform";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { clamp } from "#/lib/numbers";
import { gradients } from "#/lib/styles";

export type FABProps = {
	icon: JSX.Element;
	onPress: React.MouseEventHandler;
};

export function FABInner({ icon, onPress, ...props }: FABProps) {
	const { isMobile, isTablet } = useWebMediaQueries();
	const fabMinimalShellTransform = useMinimalShellFabTransform();

	const size = isTablet ? styles.sizeLarge : styles.sizeRegular;

	const tabletSpacing = isTablet ? { right: 50, bottom: 50 } : { right: 24, bottom: clamp(0, 15, 60) + 15 };

	return (
		<div
			style={{
				...styles.outer,
				...size,
				...tabletSpacing,
				...(isMobile && fabMinimalShellTransform),
			}}
		>
			<PressableScale
				onClick={(evt) => {
					onPress?.(evt);
				}}
				targetScale={0.9}
				{...props}
			>
				<LinearGradient
					colors={[gradients.blueLight.start, gradients.blueLight.end]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{
						...styles.inner,
						...size,
					}}
				>
					{icon}
				</LinearGradient>
			</PressableScale>
		</div>
	);
}

const styles = {
	sizeRegular: {
		width: 60,
		height: 60,
		borderRadius: 30,
	},
	sizeLarge: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	outer: {
		position: "fixed",
		zIndex: 1,
		cursor: "pointer",
	},
	inner: {
		justifyContent: "center",
		alignItems: "center",
	},
} satisfies Record<string, React.CSSProperties>;
