import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { useSheetWrapper } from "#/components/Dialog/sheet-wrapper";
import { IconCircle } from "#/components/IconCircle";
import { Text } from "#/components/Typography";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "#/components/icons/Chevron";
import { CircleInfo_Stroke2_Corner0_Rounded } from "#/components/icons/CircleInfo";
import { StreamingLive_Stroke2_Corner0_Rounded as StreamingLive } from "#/components/icons/StreamingLive";
import { usePhotoLibraryPermission } from "#/lib/hooks/usePermissions";
import { DescriptionText, OnboardingControls, TitleText } from "#/screens/Onboarding/Layout";
import { AvatarCircle } from "#/screens/Onboarding/StepProfile/AvatarCircle";
import { AvatarCreatorCircle } from "#/screens/Onboarding/StepProfile/AvatarCreatorCircle";
import { AvatarCreatorItems } from "#/screens/Onboarding/StepProfile/AvatarCreatorItems";
import { PlaceholderCanvas, type PlaceholderCanvasRef } from "#/screens/Onboarding/StepProfile/PlaceholderCanvas";
import { Context } from "#/screens/Onboarding/state";
import type { ImagePickerOptions } from "#/temp";
import { type AvatarColor, type Emoji, avatarColors, emojiItems } from "./types";

export interface Avatar {
	image?: {
		path: string;
		mime: string;
		size: number;
		width: number;
		height: number;
	};
	backgroundColor: AvatarColor;
	placeholder: Emoji;
	useCreatedAvatar: boolean;
}

interface IAvatarContext {
	avatar: Avatar;
	setAvatar: React.Dispatch<React.SetStateAction<Avatar>>;
}

const AvatarContext = React.createContext<IAvatarContext>({} as IAvatarContext);
export const useAvatar = () => React.useContext(AvatarContext);

const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

export function StepProfile() {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();

	const creatorControl = Dialog.useDialogControl();
	const [error, setError] = React.useState("");

	const { state, dispatch } = React.useContext(Context);
	const [avatar, setAvatar] = React.useState<Avatar>({
		image: state.profileStepResults?.image,
		placeholder: state.profileStepResults.creatorState?.emoji || emojiItems.at,
		backgroundColor: state.profileStepResults.creatorState?.backgroundColor || randomColor,
		useCreatedAvatar: state.profileStepResults.isCreatedAvatar,
	});

	const canvasRef = React.useRef<PlaceholderCanvasRef>(null);

	const sheetWrapper = useSheetWrapper();
	const openPicker = React.useCallback(
		async (opts?: ImagePickerOptions) => {
			// const response = await sheetWrapper(
			// 	launchImageLibraryAsync({
			// 		exif: false,
			// 		mediaTypes: MediaTypeOptions.Images,
			// 		quality: 1,
			// 		...opts,
			// 		legacy: true,
			// 	}),
			// );
			// return (response.assets ?? [])
			// 	.slice(0, 1)
			// 	.filter((asset) => {
			// 		if (
			// 			!asset.mimeType?.startsWith("image/") ||
			// 			(!asset.mimeType?.endsWith("jpeg") &&
			// 				!asset.mimeType?.endsWith("jpg") &&
			// 				!asset.mimeType?.endsWith("png"))
			// 		) {
			// 			setError("Only .jpg and .png files are supported");
			// 			return false;
			// 		}
			// 		return true;
			// 	})
			// 	.map((image) => ({
			// 		mime: "image/jpeg",
			// 		height: image.height,
			// 		width: image.width,
			// 		path: image.uri,
			// 		size: getDataUriSize(image.uri),
			// 	}));
		},
		[
			/*sheetWrapper*/
		],
	);

	const onContinue = React.useCallback(async () => {
		let imageUri = avatar?.image?.path;

		// In the event that view-shot didn't load in time and the user pressed continue, this will just be undefined
		// and the default avatar will be used. We don't want to block getting through create if this fails for some
		// reason
		if (!imageUri || avatar.useCreatedAvatar) {
			imageUri = await canvasRef.current?.capture();
		}

		if (imageUri) {
			dispatch({
				type: "setProfileStepResults",
				image: avatar.image,
				imageUri,
				imageMime: avatar.image?.mime ?? "image/jpeg",
				isCreatedAvatar: avatar.useCreatedAvatar,
				creatorState: {
					emoji: avatar.placeholder,
					backgroundColor: avatar.backgroundColor,
				},
			});
		}

		dispatch({ type: "next" });
	}, [avatar, dispatch]);

	const onDoneCreating = React.useCallback(() => {
		setAvatar((prev) => ({
			...prev,
			image: undefined,
			useCreatedAvatar: true,
		}));
		creatorControl.close();
	}, [creatorControl]);

	const openLibrary = React.useCallback(
		async () => {
			// if (!(await requestPhotoAccessIfNeeded())) {
			// 	return;
			// }
			// setError("");
			// const items = await sheetWrapper(
			// 	openPicker({
			// 		aspect: [1, 1],
			// 	}),
			// );
			// let image = items[0];
			// if (!image) return;
			// image = await compressIfNeeded(image, 1000000);
			// setAvatar((prev) => ({
			// 	...prev,
			// 	image,
			// 	useCreatedAvatar: false,
			// }));
		},
		[
			/*requestPhotoAccessIfNeeded, openPicker, sheetWrapper*/
		],
	);

	const onSecondaryPress = React.useCallback(() => {
		if (avatar.useCreatedAvatar) {
			openLibrary();
		} else {
			creatorControl.open();
		}
	}, [avatar.useCreatedAvatar, creatorControl, openLibrary]);

	const value = React.useMemo(
		() => ({
			avatar,
			setAvatar,
		}),
		[avatar],
	);

	return (
		<AvatarContext.Provider value={value}>
			<div
				style={{
					alignItems: "flex-start",
					...t.atoms.bg,
					justifyContent: "space-between",
				}}
			>
				<IconCircle icon={StreamingLive} style={{ marginBottom: 24 }} />
				<TitleText>Give your profile a face</TitleText>
				<DescriptionText>
					Help people know you're not a bot by uploading a picture or creating an avatar.
				</DescriptionText>
				<div
					style={{
						width: "100%",
						alignItems: "center",
						...{ paddingTop: gtMobile ? 80 : 40 },
					}}
				>
					<AvatarCircle openLibrary={openLibrary} openCreator={creatorControl.open} />

					{error && (
						<div
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
								marginTop: 20,
								paddingTop: 12,
								paddingBottom: 12,
								paddingLeft: 16,
								paddingRight: 16,
								border: "1px solid black",
								borderWidth: 1,
								borderRadius: 12,
								...t.atoms.bg_contrast_25,
								...t.atoms.border_contrast_low,
							}}
						>
							<CircleInfo_Stroke2_Corner0_Rounded size="sm" />
							<Text style={{ lineHeight: 1.3 }}>{error}</Text>
						</div>
					)}
				</div>

				<OnboardingControls.Portal>
					<div
						style={{
							gap: 12,
							...(gtMobile && { flexDirection: "row-reverse" }),
						}}
					>
						<Button
							variant="gradient"
							color="gradient_sky"
							size="large"
							label={"Continue to next step"}
							onPress={onContinue}
						>
							<ButtonText>Continue</ButtonText>
							<ButtonIcon icon={ChevronRight} position="right" />
						</Button>
						<Button
							variant="ghost"
							color="primary"
							size="large"
							label={"Open avatar creator"}
							onPress={onSecondaryPress}
						>
							<ButtonText>
								{avatar.useCreatedAvatar ? <>Upload a photo instead</> : <>Create an avatar instead</>}
							</ButtonText>
						</Button>
					</div>
				</OnboardingControls.Portal>
			</div>
			<Dialog.Outer control={creatorControl}>
				<Dialog.Inner
					label="Avatar creator"
					style={{
						width: "auto",
						maxWidth: 410,
					}}
				>
					<div
						style={{
							alignItems: "center",
							...{ paddingTop: 20 },
						}}
					>
						<AvatarCreatorCircle avatar={avatar} />
					</div>

					<div
						style={{
							paddingTop: 28,
							gap: 16,
						}}
					>
						<AvatarCreatorItems type="emojis" avatar={avatar} setAvatar={setAvatar} />
						<AvatarCreatorItems type="colors" avatar={avatar} setAvatar={setAvatar} />
					</div>
					<div style={{ paddingTop: 32 }}>
						<Button variant="solid" color="primary" size="large" label={"Done"} onPress={onDoneCreating}>
							<ButtonText>Done</ButtonText>
						</Button>
					</div>
				</Dialog.Inner>
			</Dialog.Outer>
			<PlaceholderCanvas ref={canvasRef} />
		</AvatarContext.Provider>
	);
}
