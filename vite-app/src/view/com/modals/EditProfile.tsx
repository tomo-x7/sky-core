import type { AppBskyActorDefs } from "@atproto/api";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import type { Image as RNImage } from "react-native-image-crop-picker";

import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { useTheme } from "#/lib/ThemeContext";
import { MAX_DESCRIPTION, MAX_DISPLAY_NAME } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { compressIfNeeded } from "#/lib/media/manip";
import { cleanError } from "#/lib/strings/errors";
import { enforceLen } from "#/lib/strings/helpers";
import { colors, gradients, s } from "#/lib/styles";
import { usePlaceholderStyle } from "#/placeholderStyle";
import { useModalControls } from "#/state/modals";
import { useProfileUpdateMutation } from "#/state/queries/profile";
import * as Toast from "#/view/com/util/Toast";
import { EditableUserAvatar } from "#/view/com/util/UserAvatar";
import { UserBanner } from "#/view/com/util/UserBanner";
import { ErrorMessage } from "../util/error/ErrorMessage";

export const snapPoints = ["fullscreen"];

export function Component({
	profile,
	onUpdate,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	onUpdate?: () => void;
}) {
	const pal = usePalette("default");
	const theme = useTheme();
	const { closeModal } = useModalControls();
	const updateMutation = useProfileUpdateMutation();
	const [imageError, setImageError] = useState<string>("");
	const [displayName, setDisplayName] = useState<string>(profile.displayName || "");
	const [description, setDescription] = useState<string>(profile.description || "");
	const [userBanner, setUserBanner] = useState<string | undefined | null>(profile.banner);
	const [userAvatar, setUserAvatar] = useState<string | undefined | null>(profile.avatar);
	const [newUserBanner, setNewUserBanner] = useState<RNImage | undefined | null>();
	const [newUserAvatar, setNewUserAvatar] = useState<RNImage | undefined | null>();
	const phStyleCName = usePlaceholderStyle(colors.gray4);
	const onPressCancel = () => {
		closeModal();
	};
	const onSelectNewAvatar = useCallback(async (img: RNImage | null) => {
		setImageError("");
		if (img === null) {
			setNewUserAvatar(null);
			setUserAvatar(null);
			return;
		}
		try {
			const finalImg = await compressIfNeeded(img, 1000000);
			setNewUserAvatar(finalImg);
			setUserAvatar(finalImg.path);
		} catch (e: any) {
			setImageError(cleanError(e));
		}
	}, []);

	const onSelectNewBanner = useCallback(async (img: RNImage | null) => {
		setImageError("");
		if (!img) {
			setNewUserBanner(null);
			setUserBanner(null);
			return;
		}
		try {
			const finalImg = await compressIfNeeded(img, 1000000);
			setNewUserBanner(finalImg);
			setUserBanner(finalImg.path);
		} catch (e: any) {
			setImageError(cleanError(e));
		}
	}, []);

	const onPressSave = useCallback(async () => {
		setImageError("");
		try {
			await updateMutation.mutateAsync({
				profile,
				updates: {
					displayName,
					description,
				},
				newUserAvatar,
				newUserBanner,
			});
			Toast.show("Profile updated");
			onUpdate?.();
			closeModal();
		} catch (e: any) {
			console.error("Failed to update user profile", { message: String(e) });
		}
	}, [updateMutation, profile, onUpdate, closeModal, displayName, description, newUserAvatar, newUserBanner]);

	return (
		<KeyboardAvoidingView style={s.flex1} behavior="height">
			{/* TODO 元ScrollView */}
			<div style={pal.view}>
				<Text
					style={{
						...styles.title,
						...pal.text,
					}}
				>
					Edit my profile
				</Text>
				<div style={styles.photos}>
					<UserBanner banner={userBanner} onSelectNewBanner={onSelectNewBanner} />
					<div
						style={{
							...styles.avi,
							...{ borderColor: pal.colors.background },
						}}
					>
						<EditableUserAvatar size={80} avatar={userAvatar} onSelectNewAvatar={onSelectNewAvatar} />
					</div>
				</div>
				{updateMutation.isError && (
					<div style={styles.errorContainer}>
						<ErrorMessage message={cleanError(updateMutation.error)} />
					</div>
				)}
				{imageError !== "" && (
					<div style={styles.errorContainer}>
						<ErrorMessage message={imageError} />
					</div>
				)}
				<div style={styles.form}>
					<div>
						<Text
							style={{
								...styles.label,
								...pal.text,
							}}
						>
							Display Name
						</Text>
						<input
							type="text"
							style={{
								...styles.textInput,
								...pal.border,
								...pal.text,
							}}
							placeholder={"e.g. Alice Roberts"}
							className={phStyleCName}
							value={displayName}
							onChange={(v) => setDisplayName(enforceLen(v.target.value, MAX_DISPLAY_NAME))}
						/>
					</div>
					<div style={s.pb10}>
						<Text
							style={{
								...styles.label,
								...pal.text,
							}}
						>
							Description
						</Text>
						<textarea
							style={{
								...styles.textArea,
								...pal.border,
								...pal.text,
							}}
							placeholder={"e.g. Artist, dog-lover, and avid reader."}
							className={phStyleCName}
							value={description}
							onChange={(v) => setDescription(enforceLen(v.target.value, MAX_DESCRIPTION))}
						/>
					</div>
					{updateMutation.isPending ? (
						<div
							style={{
								...styles.btn,
								...s.mt10,
								...{ backgroundColor: colors.gray2 },
							}}
						>
							<ActivityIndicator />
						</div>
					) : (
						<button type="button" style={s.mt10} onClick={onPressSave}>
							<LinearGradient
								colors={[gradients.blueLight.start, gradients.blueLight.end]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								// @ts-expect-error
								style={styles.btn}
							>
								<Text
									style={{
										...s.white,
										...s.bold,
									}}
								>
									Save Changes
								</Text>
							</LinearGradient>
						</button>
					)}
					{!updateMutation.isPending && (
						<button
							type="button"
							// exiting={undefined}
							style={s.mt5}
							onClick={onPressCancel}
							// onAccessibilityEscape={onPressCancel}
						>
							<div style={styles.btn}>
								<Text
									style={{
										...s.black,
										...s.bold,
										...pal.text,
									}}
								>
									Cancel
								</Text>
							</div>
						</button>
					)}
				</div>
			</div>
		</KeyboardAvoidingView>
	);
}

const styles = {
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 18,
	},
	label: {
		fontWeight: "600",
		paddingLeft: 4,
		paddingRight: 4,
		paddingBottom: 4,
		marginTop: 20,
	},
	form: {
		paddingLeft: 14,
		paddingRight: 14,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		padding: "10px 14px",
		fontSize: 16,
	},
	textArea: {
		borderWidth: 1,
		borderRadius: 6,
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 10,
		fontSize: 16,
		height: 120,
		// TODO
		// textAlignVertical: "top",
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		borderRadius: 32,
		padding: 10,
		marginBottom: 10,
	},
	avi: {
		position: "absolute",
		top: 80,
		left: 24,
		width: 84,
		height: 84,
		borderWidth: 2,
		borderRadius: 42,
	},
	photos: {
		marginBottom: 36,
		marginLeft: -14,
		marginRight: -14,
	},
	errorContainer: { marginTop: 20 },
} satisfies Record<string, React.CSSProperties>;
