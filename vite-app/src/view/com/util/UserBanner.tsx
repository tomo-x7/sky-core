import type { ModerationUI } from "@atproto/api";
import React from "react";
import type { Image as RNImage } from "react-native-image-crop-picker";

import { tokens, useTheme as useAlfTheme } from "#/alf";
import { useSheetWrapper } from "#/components/Dialog/sheet-wrapper";
import * as Menu from "#/components/Menu";
import { Camera_Filled_Stroke2_Corner0_Rounded as CameraFilled } from "#/components/icons/Camera";
import { StreamingLive_Stroke2_Corner0_Rounded as Library } from "#/components/icons/StreamingLive";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";
import { useCameraPermission, usePhotoLibraryPermission } from "#/lib/hooks/usePermissions";
import { colors } from "#/lib/styles";
import { EventStopper } from "#/view/com/util/EventStopper";
import { openCropper, openPicker } from "../../../lib/media/picker";

export function UserBanner({
	type,
	banner,
	moderation,
	onSelectNewBanner,
}: {
	type?: "labeler" | "default";
	banner?: string | null;
	moderation?: ModerationUI;
	onSelectNewBanner?: (img: RNImage | null) => void;
}) {
	const pal = usePalette("default");
	const theme = useTheme();
	const t = useAlfTheme();
	const { requestCameraAccessIfNeeded } = useCameraPermission();
	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();
	const sheetWrapper = useSheetWrapper();

	// const onOpenCamera = React.useCallback(async () => {
	// 	if (!(await requestCameraAccessIfNeeded())) {
	// 		return;
	// 	}
	// 	onSelectNewBanner?.(
	// 		await openCamera({
	// 			width: 3000,
	// 			height: 1000,
	// 		}),
	// 	);
	// }, [onSelectNewBanner, requestCameraAccessIfNeeded]);

	const onOpenLibrary = React.useCallback(async () => {
		if (!(await requestPhotoAccessIfNeeded())) {
			return;
		}
		const items = await sheetWrapper(openPicker());
		if (!items[0]) {
			return;
		}

		try {
			onSelectNewBanner?.(
				await openCropper({
					mediaType: "photo",
					path: items[0].path,
					width: 3000,
					height: 1000,
					webAspectRatio: 3,
				}),
			);
		} catch (e: any) {
			if (!String(e).includes("Canceled")) {
				console.error("Failed to crop banner", { error: e });
			}
		}
	}, [onSelectNewBanner, requestPhotoAccessIfNeeded, sheetWrapper]);

	const onRemoveBanner = React.useCallback(() => {
		onSelectNewBanner?.(null);
	}, [onSelectNewBanner]);

	// setUserBanner is only passed as prop on the EditProfile component
	return onSelectNewBanner ? (
		<EventStopper onKeyDown={true}>
			<Menu.Root>
				<Menu.Trigger label={"Edit avatar"}>
					{({ props }) => (
						<button type="button" {...props}>
							{banner ? (
								<img style={styles.bannerImage} src={banner} />
							) : (
								<div
									style={{
										...styles.bannerImage,
										...t.atoms.bg_contrast_25,
									}}
								/>
							)}
							<div
								style={{
									...styles.editButtonContainer,
									...pal.btn,
								}}
							>
								<CameraFilled height={14} width={14} style={t.atoms.text} />
							</div>
						</button>
					)}
				</Menu.Trigger>
				<Menu.Outer showCancel>
					<Menu.Group>
						<Menu.Item label={"Upload from Library"} onPress={onOpenLibrary}>
							<Menu.ItemText>{"Upload from Files"}</Menu.ItemText>
							<Menu.ItemIcon icon={Library} />
						</Menu.Item>
					</Menu.Group>
					{!!banner && (
						<>
							<Menu.Divider />
							<Menu.Group>
								<Menu.Item label={"Remove Banner"} onPress={onRemoveBanner}>
									<Menu.ItemText>Remove Banner</Menu.ItemText>
									<Menu.ItemIcon icon={Trash} />
								</Menu.Item>
							</Menu.Group>
						</>
					)}
				</Menu.Outer>
			</Menu.Root>
		</EventStopper>
	) : banner ? (
		<img
			style={{
				...styles.bannerImage,
				...{ backgroundColor: theme.palette.default.backgroundLight },
				objectFit: "cover",
				filter: moderation?.blur ? "blur(100)" : undefined,
			}}
			src={banner}
		/>
	) : (
		<div
			style={{
				...styles.bannerImage,
				...(type === "labeler" ? styles.labelerBanner : t.atoms.bg_contrast_25),
			}}
		/>
	);
}

const styles = {
	editButtonContainer: {
		position: "absolute",
		width: 24,
		height: 24,
		bottom: 8,
		right: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.gray5,
	},
	bannerImage: {
		width: "100%",
		height: 150,
	},
	labelerBanner: {
		backgroundColor: tokens.color.temp_purple,
	},
} satisfies Record<string, React.CSSProperties>;
