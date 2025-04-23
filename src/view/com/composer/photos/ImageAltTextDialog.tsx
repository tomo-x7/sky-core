import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { MAX_ALT_TEXT } from "#/lib/constants";
import { enforceLen } from "#/lib/strings/helpers";
import type { ComposerImage } from "#/state/gallery";
import { AltTextCounterWrapper } from "#/view/com/composer/AltTextCounterWrapper";

type Props = {
	control: Dialog.DialogOuterProps["control"];
	image: ComposerImage;
	onChange: (next: ComposerImage) => void;
};

export const ImageAltTextDialog = ({ control, image, onChange }: Props): React.ReactNode => {
	const [altText, setAltText] = React.useState(image.alt);

	return (
		<Dialog.Outer
			control={control}
			onClose={() => {
				onChange({
					...image,
					alt: enforceLen(altText, MAX_ALT_TEXT, true),
				});
			}}
		>
			<Dialog.Handle />
			<ImageAltTextInner control={control} image={image} altText={altText} setAltText={setAltText} />
		</Dialog.Outer>
	);
};

const ImageAltTextInner = ({
	altText,
	setAltText,
	control,
	image,
}: {
	altText: string;
	setAltText: (text: string) => void;
	control: DialogControlProps;
	image: Props["image"];
}): React.ReactNode => {
	const t = useTheme();

	const imageStyle = React.useMemo<React.CSSProperties>(() => {
		const maxWidth = 450;
		const source = image.transformed ?? image.source;

		if (source.height > source.width) {
			return {
				resizeMode: "contain",
				width: "100%",
				aspectRatio: 1,
				borderRadius: 8,
			};
		}
		return {
			width: "100%",
			height: (maxWidth / source.width) * source.height,
			borderRadius: 8,
		};
	}, [image]);

	return (
		<Dialog.ScrollableInner label={"Add alt text"}>
			<Dialog.Close />
			<div>
				<Text
					style={{
						fontSize: 22,
						letterSpacing: 0,
						fontWeight: "600",
						lineHeight: 1.15,
						paddingBottom: 8,
					}}
				>
					Add alt text
				</Text>

				<div
					style={{
						...t.atoms.bg_contrast_50,
						borderRadius: 8,
						overflow: "hidden",
					}}
				>
					<img
						style={{ ...imageStyle, objectFit: "contain", userSelect: "text" }}
						src={(image.transformed ?? image.source).path}
					/>
				</div>
			</div>
			<div
				style={{
					marginTop: 12,
					gap: 12,
				}}
			>
				<div style={{ gap: 8 }}>
					<div
						style={{
							position: "relative",
							...{ width: "100%" },
						}}
					>
						<TextField.LabelText>Descriptive alt text</TextField.LabelText>
						<TextField.Root>
							<Dialog.Input
								label={"Alt text"}
								onChangeText={(text) => {
									setAltText(text);
								}}
								defaultValue={altText}
								multiline
								// TODO
								// numberOfLines={3}
								autoFocus
							/>
						</TextField.Root>
					</div>

					{altText.length > MAX_ALT_TEXT && (
						<div
							style={{
								paddingBottom: 8,
								flexDirection: "row",
								gap: 4,
							}}
						>
							<CircleInfo fill={t.palette.negative_500} />
							<Text
								style={{
									fontStyle: "italic",
									lineHeight: 1.3,
									...t.atoms.text_contrast_medium,
								}}
							>
								<>Alt text will be truncated. Limit: {MAX_ALT_TEXT.toLocaleString()} characters.</>
							</Text>
						</div>
					)}
				</div>

				<AltTextCounterWrapper altText={altText}>
					<Button
						label={"Save"}
						disabled={altText === image.alt}
						size="large"
						color="primary"
						variant="solid"
						onPress={() => {
							control.close();
						}}
						style={{ flexGrow: 1 }}
					>
						<ButtonText>Save</ButtonText>
					</Button>
				</AltTextCounterWrapper>
			</div>
		</Dialog.ScrollableInner>
	);
};
