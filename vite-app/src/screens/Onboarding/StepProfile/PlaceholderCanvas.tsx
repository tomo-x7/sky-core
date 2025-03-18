import React from "react";
// import ViewShot from "react-native-view-shot";

import { atoms as a } from "#/alf";
import { useAvatar } from "#/screens/Onboarding/StepProfile/index";

const SIZE_MULTIPLIER = 5;

export interface PlaceholderCanvasRef {
	capture: () => Promise<string | undefined>;
}

// This component is supposed to be invisible to the user. We only need this for ViewShot to have something to
// "screenshot".
// biome-ignore lint/complexity/noBannedTypes lint/correctness/noEmptyPattern: <explanation>
export const PlaceholderCanvas = React.forwardRef<PlaceholderCanvasRef, {}>(function PlaceholderCanvas({}, ref) {
	const { avatar } = useAvatar();
	// const viewshotRef = React.useRef<ViewShot>(null);
	const Icon = avatar.placeholder.component;

	const styles = React.useMemo(
		() => ({
			container: { ...a.absolute, top: -2000 },
			imageContainer: {
				...a.align_center,
				...a.justify_center,
				height: 150 * SIZE_MULTIPLIER,
				width: 150 * SIZE_MULTIPLIER,
			},
		}),
		[],
	);

	React.useImperativeHandle(ref, () => ({
		capture: async () => {
			// if (viewshotRef.current?.capture) {
			// 	return await viewshotRef.current.capture();
			// }
			return "";
		},
	}));

	return (
		<div style={styles.container}>
			<React.Suspense fallback={null}>
				{/* <ViewShot
					// @ts-expect-error this library doesn't have types
					ref={viewshotRef}
					options={{
						fileName: "placeholderAvatar",
						format: "jpg",
						quality: 0.8,
						height: 150 * SIZE_MULTIPLIER,
						width: 150 * SIZE_MULTIPLIER,
					}}
				> */}
				<div
					style={{
						...styles.imageContainer,
						...{ backgroundColor: avatar.backgroundColor },
					}}
				>
					<Icon height={85 * SIZE_MULTIPLIER} width={85 * SIZE_MULTIPLIER} style={{ color: "white" }} />
				</div>
				{/* </ViewShot> */}
			</React.Suspense>
		</div>
	);
});
