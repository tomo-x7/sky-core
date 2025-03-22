import type { AppBskyActorDefs } from "@atproto/api";
import { useCallback, useEffect, useState } from "react";
// import type { Image as RNImage } from "react-native-image-crop-picker";
type RNImage = any;

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import * as Prompt from "#/components/Prompt";
import * as TextField from "#/components/forms/TextField";
import { compressIfNeeded } from "#/lib/media/manip";
import { cleanError } from "#/lib/strings/errors";
import { useWarnMaxGraphemeCount } from "#/lib/strings/helpers";
import { useProfileUpdateMutation } from "#/state/queries/profile";
import * as Toast from "#/view/com/util/Toast";
import { EditableUserAvatar } from "#/view/com/util/UserAvatar";
import { UserBanner } from "#/view/com/util/UserBanner";
import { ErrorMessage } from "#/view/com/util/error/ErrorMessage";

const DISPLAY_NAME_MAX_GRAPHEMES = 64;
const DESCRIPTION_MAX_GRAPHEMES = 256;

const SCREEN_HEIGHT = window.innerHeight;

export function EditProfileDialog({
	profile,
	control,
	onUpdate,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	control: Dialog.DialogControlProps;
	onUpdate?: () => void;
}) {
	const cancelControl = Dialog.useDialogControl();
	const [dirty, setDirty] = useState(false);

	// 'You might lose unsaved changes' warning
	useEffect(() => {
		if (dirty) {
			const abortController = new AbortController();
			const { signal } = abortController;
			window.addEventListener("beforeunload", (evt) => evt.preventDefault(), {
				signal,
			});
			return () => {
				abortController.abort();
			};
		}
	}, [dirty]);

	const onPressCancel = useCallback(() => {
		if (dirty) {
			cancelControl.open();
		} else {
			control.close();
		}
	}, [dirty, control, cancelControl]);

	return (
		<Dialog.Outer control={control}>
			<DialogInner profile={profile} onUpdate={onUpdate} setDirty={setDirty} onPressCancel={onPressCancel} />

			<Prompt.Basic
				control={cancelControl}
				title={"Discard changes?"}
				description={"Are you sure you want to discard your changes?"}
				onConfirm={() => control.close()}
				confirmButtonCta={"Discard"}
				confirmButtonColor="negative"
			/>
		</Dialog.Outer>
	);
}

function DialogInner({
	profile,
	onUpdate,
	setDirty,
	onPressCancel,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	onUpdate?: () => void;
	setDirty: (dirty: boolean) => void;
	onPressCancel: () => void;
}) {
	const t = useTheme();
	const control = Dialog.useDialogContext();
	const {
		mutateAsync: updateProfileMutation,
		error: updateProfileError,
		isError: isUpdateProfileError,
		isPending: isUpdatingProfile,
	} = useProfileUpdateMutation();
	const [imageError, setImageError] = useState("");
	const initialDisplayName = profile.displayName || "";
	const [displayName, setDisplayName] = useState(initialDisplayName);
	const initialDescription = profile.description || "";
	const [description, setDescription] = useState(initialDescription);
	const [userBanner, setUserBanner] = useState<string | undefined | null>(profile.banner);
	const [userAvatar, setUserAvatar] = useState<string | undefined | null>(profile.avatar);
	const [newUserBanner, setNewUserBanner] = useState<RNImage | undefined | null>();
	const [newUserAvatar, setNewUserAvatar] = useState<RNImage | undefined | null>();

	const dirty =
		displayName !== initialDisplayName ||
		description !== initialDescription ||
		userAvatar !== profile.avatar ||
		userBanner !== profile.banner;

	useEffect(() => {
		setDirty(dirty);
	}, [dirty, setDirty]);

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
			await updateProfileMutation({
				profile,
				updates: {
					displayName: displayName.trimEnd(),
					description: description.trimEnd(),
				},
				newUserAvatar,
				newUserBanner,
			});
			onUpdate?.();
			control.close();
			Toast.show("Profile updated");
		} catch (e: any) {
			console.error("Failed to update user profile", { message: String(e) });
		}
	}, [updateProfileMutation, profile, onUpdate, control, displayName, description, newUserAvatar, newUserBanner]);

	const displayNameTooLong = useWarnMaxGraphemeCount({
		text: displayName,
		maxCount: DISPLAY_NAME_MAX_GRAPHEMES,
	});
	const descriptionTooLong = useWarnMaxGraphemeCount({
		text: description,
		maxCount: DESCRIPTION_MAX_GRAPHEMES,
	});

	const cancelButton = useCallback(
		() => (
			<Button
				label={"Cancel"}
				onPress={onPressCancel}
				size="small"
				color="primary"
				variant="ghost"
				style={a.rounded_full}
			>
				<ButtonText style={a.text_md}>Cancel</ButtonText>
			</Button>
		),
		[onPressCancel],
	);

	const saveButton = useCallback(
		() => (
			<Button
				label={"Save"}
				onPress={onPressSave}
				disabled={!dirty || isUpdatingProfile || displayNameTooLong || descriptionTooLong}
				size="small"
				color="primary"
				variant="ghost"
				style={a.rounded_full}
			>
				<ButtonText
					style={{
						...a.text_md,
						...(!dirty && t.atoms.text_contrast_low),
					}}
				>
					Save
				</ButtonText>
			</Button>
		),
		[t, dirty, onPressSave, isUpdatingProfile, displayNameTooLong, descriptionTooLong],
	);

	return (
		<Dialog.ScrollableInner
			label={"Edit profile"}
			style={a.overflow_hidden}
			contentContainerStyle={{ ...a.px_0, ...a.pt_0 }}
			header={
				<Dialog.Header renderLeft={cancelButton} renderRight={saveButton}>
					<Dialog.HeaderText>Edit profile</Dialog.HeaderText>
				</Dialog.Header>
			}
		>
			<div style={a.relative}>
				<UserBanner banner={userBanner} onSelectNewBanner={onSelectNewBanner} />
				<div
					style={{
						...a.absolute,

						...{
							top: 80,
							left: 20,
							width: 84,
							height: 84,
							borderWidth: 2,
							borderRadius: 42,
							borderColor: t.atoms.bg.backgroundColor,
						},
					}}
				>
					<EditableUserAvatar size={80} avatar={userAvatar} onSelectNewAvatar={onSelectNewAvatar} />
				</div>
			</div>
			{isUpdateProfileError && (
				<div style={a.mt_xl}>
					<ErrorMessage message={cleanError(updateProfileError)} />
				</div>
			)}
			{imageError !== "" && (
				<div style={a.mt_xl}>
					<ErrorMessage message={imageError} />
				</div>
			)}
			<div
				style={{
					...a.mt_4xl,
					...a.px_xl,
					...a.gap_xl,
				}}
			>
				<div>
					<TextField.LabelText>Display name</TextField.LabelText>
					<TextField.Root isInvalid={displayNameTooLong}>
						<Dialog.Input
							defaultValue={displayName}
							onChangeText={setDisplayName}
							label={"Display name"}
							placeholder={"e.g. Alice Lastname"}
						/>
					</TextField.Root>
					{displayNameTooLong && (
						<TextField.SuffixText
							style={{
								...a.text_sm,
								...a.mt_xs,
								...a.font_bold,
								...{ color: t.palette.negative_400 },
							}}
						>
							<>
								Display name is too long. The maximum number of characters is{" "}
								{DISPLAY_NAME_MAX_GRAPHEMES}.
							</>
						</TextField.SuffixText>
					)}
				</div>

				<div>
					<TextField.LabelText>Description</TextField.LabelText>
					<TextField.Root isInvalid={descriptionTooLong}>
						<Dialog.Input
							defaultValue={description}
							onChangeText={setDescription}
							multiline
							label={"Display name"}
							placeholder={"Tell us a bit about yourself"}
						/>
					</TextField.Root>
					{descriptionTooLong && (
						<TextField.SuffixText
							style={{
								...a.text_sm,
								...a.mt_xs,
								...a.font_bold,
								...{ color: t.palette.negative_400 },
							}}
						>
							<>
								Description is too long. The maximum number of characters is {DESCRIPTION_MAX_GRAPHEMES}
								.
							</>
						</TextField.SuffixText>
					)}
				</div>
			</div>
		</Dialog.ScrollableInner>
	);
}
