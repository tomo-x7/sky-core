import React from "react";
import { Image } from "react-native";
import { type ImageStyle, View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
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

	const imageStyle = React.useMemo<ImageStyle>(() => {
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

			<View>
				<Text style={[a.text_2xl, a.font_bold, a.leading_tight, a.pb_sm]}>Add alt text</Text>

				<View style={[t.atoms.bg_contrast_50, a.rounded_sm, a.overflow_hidden]}>
					<Image
						style={imageStyle}
						source={{
							uri: (image.transformed ?? image.source).path,
						}}
						//@ts-ignore
						contentFit="contain"
						accessible={true}
						accessibilityIgnoresInvertColors
						enableLiveTextInteraction
					/>
				</View>
			</View>

			<View style={[a.mt_md, a.gap_md]}>
				<View style={[a.gap_sm]}>
					<View style={[a.relative, { width: "100%" }]}>
						<TextField.LabelText>Descriptive alt text</TextField.LabelText>
						<TextField.Root>
							<Dialog.Input
								label={"Alt text"}
								onChangeText={(text) => {
									setAltText(text);
								}}
								defaultValue={altText}
								multiline
								numberOfLines={3}
								autoFocus
							/>
						</TextField.Root>
					</View>

					{altText.length > MAX_ALT_TEXT && (
						<View style={[a.pb_sm, a.flex_row, a.gap_xs]}>
							<CircleInfo fill={t.palette.negative_500} />
							<Text style={[a.italic, a.leading_snug, t.atoms.text_contrast_medium]}>
								<>Alt text will be truncated. Limit: {MAX_ALT_TEXT.toLocaleString()} characters.</>
							</Text>
						</View>
					)}
				</View>

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
						style={[a.flex_grow]}
					>
						<ButtonText>Save</ButtonText>
					</Button>
				</AltTextCounterWrapper>
			</View>
		</Dialog.ScrollableInner>
	);
};
