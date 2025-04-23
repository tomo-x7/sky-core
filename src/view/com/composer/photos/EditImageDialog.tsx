import "react-image-crop/dist/ReactCrop.css";
import React from "react";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import { type ImageSource, type ImageTransformation, manipulateImage } from "#/state/gallery";
import type { ComposerImage } from "#/state/gallery";

export type EditImageDialogProps = {
	control: Dialog.DialogOuterProps["control"];
	image: ComposerImage;
	onChange: (next: ComposerImage) => void;
};

export const EditImageDialog = (props: EditImageDialogProps) => {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<EditImageInner key={props.image.source.id} {...props} />
		</Dialog.Outer>
	);
};

const EditImageInner = ({ control, image, onChange }: EditImageDialogProps) => {
	const source = image.source;

	const initialCrop = getInitialCrop(source, image.manips);
	const [crop, setCrop] = React.useState(initialCrop);

	const isEmpty = !crop || (crop.width || crop.height) === 0;
	const isNew = initialCrop ? true : !isEmpty;

	const onPressSubmit = React.useCallback(async () => {
		const result = await manipulateImage(image, {
			crop:
				crop && (crop.width || crop.height) !== 0
					? {
							originX: (crop.x * source.width) / 100,
							originY: (crop.y * source.height) / 100,
							width: (crop.width * source.width) / 100,
							height: (crop.height * source.height) / 100,
						}
					: undefined,
		});

		onChange(result);
		control.close();
	}, [crop, image, source, control, onChange]);

	return (
		<Dialog.Inner label={"Edit image"}>
			<Dialog.Close />
			<Text
				style={{
					fontSize: 22,
					letterSpacing: 0,
					fontWeight: "600",
					lineHeight: 1.15,
					paddingBottom: 8,
				}}
			>
				Edit image
			</Text>
			<div style={{ alignItems: "center" }}>
				<ReactCrop
					crop={crop}
					onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
					className="ReactCrop--no-animate"
				>
					<img src={source.path} style={{ maxHeight: "50vh" }} alt="" />
				</ReactCrop>
			</div>
			<div
				style={{
					marginTop: 12,
					gap: 12,
				}}
			>
				<Button
					disabled={!isNew}
					label={"Save"}
					size="large"
					color="primary"
					variant="solid"
					onPress={onPressSubmit}
				>
					<ButtonText>Save</ButtonText>
				</Button>
			</div>
		</Dialog.Inner>
	);
};

const getInitialCrop = (source: ImageSource, manips: ImageTransformation | undefined): PercentCrop | undefined => {
	const initialArea = manips?.crop;

	if (initialArea) {
		return {
			unit: "%",
			x: (initialArea.originX / source.width) * 100,
			y: (initialArea.originY / source.height) * 100,
			width: (initialArea.width / source.width) * 100,
			height: (initialArea.height / source.height) * 100,
		};
	}
};
