import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import type { Image as RNImage } from "react-native-image-crop-picker";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { getDataUriSize } from "#/lib/media/util";
import { gradients, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";

export const snapPoints = ["0%"];

export function Component({
	uri,
	aspect,
	circular,
	onSelect,
}: {
	uri: string;
	aspect?: number;
	circular?: boolean;
	onSelect: (img?: RNImage) => void;
}) {
	const pal = usePalette("default");

	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();

	const imageRef = React.useRef<HTMLImageElement>(null);
	const [crop, setCrop] = React.useState<PercentCrop>();

	const isEmpty = !crop || (crop.width || crop.height) === 0;

	const onPressCancel = () => {
		onSelect(undefined);
		closeModal();
	};
	const onPressDone = async () => {
		const img = imageRef.current!;

		const result = await manipulateAsync(
			uri,
			isEmpty
				? []
				: [
						{
							crop: {
								originX: (crop.x * img.naturalWidth) / 100,
								originY: (crop.y * img.naturalHeight) / 100,
								width: (crop.width * img.naturalWidth) / 100,
								height: (crop.height * img.naturalHeight) / 100,
							},
						},
					],
			{
				base64: true,
				format: SaveFormat.JPEG,
			},
		);

		onSelect({
			path: result.uri,
			mime: "image/jpeg",
			size: result.base64 !== undefined ? getDataUriSize(result.base64) : 0,
			width: result.width,
			height: result.height,
		});

		closeModal();
	};

	return (
		<div>
			<div
				style={{
					...styles.cropper,
					...pal.borderDark,
				}}
			>
				<ReactCrop
					aspect={aspect}
					crop={crop}
					onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
					circularCrop={circular}
				>
					<img ref={imageRef} src={uri} style={{ maxHeight: "75vh" }} alt="" />
				</ReactCrop>
			</div>
			<div
				style={{
					...styles.btns,
					...(isMobile && { paddingLeft: 16, paddingRight: 16 }),
				}}
			>
				<button onClick={onPressCancel} type="button">
					<Text type="xl" style={pal.link}>
						Cancel
					</Text>
				</button>
				<div style={s.flex1} />
				<button onClick={onPressDone} type="button">
					<LinearGradient
						colors={[gradients.blueLight.start, gradients.blueLight.end]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						// @ts-expect-error
						style={styles.btn}
					>
						<Text type="xl-medium" style={s.white}>
							Done
						</Text>
					</LinearGradient>
				</button>
			</div>
		</div>
	);
}

const styles = {
	cropper: {
		marginLeft: "auto",
		marginRight: "auto",
		borderWidth: 1,
		borderRadius: 4,
		overflow: "hidden",
		alignItems: "center",
	},
	ctrls: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	btns: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	btn: {
		borderRadius: 4,
		padding: "8px 24px",
	},
} satisfies Record<string, React.CSSProperties>;
