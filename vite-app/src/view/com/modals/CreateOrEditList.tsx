import { type AppBskyGraphDefs, RichText as RichTextAPI } from "@atproto/api";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import type { Image as RNImage } from "react-native-image-crop-picker";

import { useTheme } from "#/lib/ThemeContext";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { compressIfNeeded } from "#/lib/media/manip";
import { cleanError, isNetworkError } from "#/lib/strings/errors";
import { enforceLen } from "#/lib/strings/helpers";
import { richTextToString } from "#/lib/strings/rich-text-helpers";
import { shortenLinks, stripInvalidMentions } from "#/lib/strings/rich-text-manip";
import { colors, gradients, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { useListCreateMutation, useListMetadataMutation } from "#/state/queries/list";
import { useAgent } from "#/state/session";
import * as Toast from "../util/Toast";
import { EditableUserAvatar } from "../util/UserAvatar";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Text } from "../util/text/Text";

const MAX_NAME = 64; // todo
const MAX_DESCRIPTION = 300; // todo

export const snapPoints = ["fullscreen"];

export function Component({
	purpose,
	onSave,
	list,
}: {
	purpose?: string;
	onSave?: (uri: string) => void;
	list?: AppBskyGraphDefs.ListView;
}) {
	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();
	const [error, setError] = useState<string>("");
	const pal = usePalette("default");
	const theme = useTheme();
	const listCreateMutation = useListCreateMutation();
	const listMetadataMutation = useListMetadataMutation();
	const agent = useAgent();

	const activePurpose = useMemo(() => {
		if (list?.purpose) {
			return list.purpose;
		}
		if (purpose) {
			return purpose;
		}
		return "app.bsky.graph.defs#curatelist";
	}, [list, purpose]);
	const isCurateList = activePurpose === "app.bsky.graph.defs#curatelist";

	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [name, setName] = useState<string>(list?.name || "");

	const [descriptionRt, setDescriptionRt] = useState<RichTextAPI>(() => {
		const text = list?.description;
		const facets = list?.descriptionFacets;

		if (!text || !facets) {
			return new RichTextAPI({ text: text || "" });
		}

		// We want to be working with a blank state here, so let's get the
		// serialized version and turn it back into a RichText
		const serialized = richTextToString(new RichTextAPI({ text, facets }), false);

		const richText = new RichTextAPI({ text: serialized });
		richText.detectFacetsWithoutResolution();

		return richText;
	});
	const graphemeLength = useMemo(() => {
		return shortenLinks(descriptionRt).graphemeLength;
	}, [descriptionRt]);
	const isDescriptionOver = graphemeLength > MAX_DESCRIPTION;

	const [avatar, setAvatar] = useState<string | undefined>(list?.avatar);
	const [newAvatar, setNewAvatar] = useState<RNImage | undefined | null>();

	const onDescriptionChange = useCallback((newText: string) => {
		const richText = new RichTextAPI({ text: newText });
		richText.detectFacetsWithoutResolution();

		setDescriptionRt(richText);
	}, []);

	const onPressCancel = useCallback(() => {
		closeModal();
	}, [closeModal]);

	const onSelectNewAvatar = useCallback(async (img: RNImage | null) => {
		if (!img) {
			setNewAvatar(null);
			setAvatar(undefined);
			return;
		}
		try {
			const finalImg = await compressIfNeeded(img, 1000000);
			setNewAvatar(finalImg);
			setAvatar(finalImg.path);
		} catch (e: any) {
			setError(cleanError(e));
		}
	}, []);

	const onPressSave = useCallback(async () => {
		const nameTrimmed = name.trim();
		if (!nameTrimmed) {
			setError("Name is required");
			return;
		}
		setProcessing(true);
		if (error) {
			setError("");
		}
		try {
			let richText = new RichTextAPI({ text: descriptionRt.text.trimEnd() }, { cleanNewlines: true });

			await richText.detectFacets(agent);
			richText = shortenLinks(richText);
			richText = stripInvalidMentions(richText);

			if (list) {
				await listMetadataMutation.mutateAsync({
					uri: list.uri,
					name: nameTrimmed,
					description: richText.text,
					descriptionFacets: richText.facets,
					avatar: newAvatar,
				});
				Toast.show(isCurateList ? "User list updated" : "Moderation list updated");
				onSave?.(list.uri);
			} else {
				const res = await listCreateMutation.mutateAsync({
					purpose: activePurpose,
					name,
					description: richText.text,
					descriptionFacets: richText.facets,
					avatar: newAvatar,
				});
				Toast.show(isCurateList ? "User list created" : "Moderation list created");
				onSave?.(res.uri);
			}
			closeModal();
		} catch (e: any) {
			if (isNetworkError(e)) {
				setError("Failed to create the list. Check your internet connection and try again.");
			} else {
				setError(cleanError(e));
			}
		}
		setProcessing(false);
	}, [
		error,
		onSave,
		closeModal,
		activePurpose,
		isCurateList,
		name,
		descriptionRt,
		newAvatar,
		list,
		listMetadataMutation,
		listCreateMutation,

		agent,
	]);

	return (
		<KeyboardAvoidingView behavior="height">
			<ScrollView
				style={{
					...pal.view,

					...{
						paddingHorizontal: isMobile ? 16 : 0,
					},
				}}
			>
				<Text
					style={{
						...styles.title,
						...pal.text,
					}}
				>
					{isCurateList ? (
						list ? (
							<>Edit User List</>
						) : (
							<>New User List</>
						)
					) : list ? (
						<>Edit Moderation List</>
					) : (
						<>New Moderation List</>
					)}
				</Text>
				{error !== "" && (
					<View style={styles.errorContainer}>
						<ErrorMessage message={error} />
					</View>
				)}
				<Text
					style={{
						...styles.label,
						...pal.text,
					}}
				>
					List Avatar
				</Text>
				<View
					style={{
						...styles.avi,
						...{ borderColor: pal.colors.background },
					}}
				>
					<EditableUserAvatar type="list" size={80} avatar={avatar} onSelectNewAvatar={onSelectNewAvatar} />
				</View>
				<View style={styles.form}>
					<View>
						<View style={styles.labelWrapper}>
							<Text
								style={{
									...styles.label,
									...pal.text,
								}}
								nativeID="list-name"
							>
								List Name
							</Text>
						</View>
						<TextInput
							style={{
								...styles.textInput,
								...pal.border,
								...pal.text,
							}}
							placeholder={isCurateList ? "e.g. Great Posters" : "e.g. Spammers"}
							placeholderTextColor={colors.gray4}
							value={name}
							onChangeText={(v) => setName(enforceLen(v, MAX_NAME))}
							accessible={true}
							accessibilityLabel={"Name"}
							accessibilityHint=""
							accessibilityLabelledBy="list-name"
						/>
					</View>
					<View style={s.pb10}>
						<View style={styles.labelWrapper}>
							<Text
								style={{
									...styles.label,
									...pal.text,
								}}
								nativeID="list-description"
							>
								Description
							</Text>
							<Text
								style={{
									...(!isDescriptionOver ? pal.textLight : s.red3),
									...s.f13,
								}}
							>
								{graphemeLength}/{MAX_DESCRIPTION}
							</Text>
						</View>
						<TextInput
							style={{
								...styles.textArea,
								...pal.border,
								...pal.text,
							}}
							placeholder={
								isCurateList
									? "e.g. The posters who never miss."
									: "e.g. Users that repeatedly reply with ads."
							}
							placeholderTextColor={colors.gray4}
							keyboardAppearance={theme.colorScheme}
							multiline
							value={descriptionRt.text}
							onChangeText={onDescriptionChange}
							accessible={true}
							accessibilityLabel={"Description"}
							accessibilityHint=""
							accessibilityLabelledBy="list-description"
						/>
					</View>
					{isProcessing ? (
						<View
							style={{
								...styles.btn,
								...s.mt10,
								...{ backgroundColor: colors.gray2 },
							}}
						>
							<ActivityIndicator />
						</View>
					) : (
						<TouchableOpacity
							style={{
								...s.mt10,
								...(isDescriptionOver && s.dimmed),
							}}
							disabled={isDescriptionOver}
							onPress={onPressSave}
							accessibilityRole="button"
							accessibilityLabel={"Save"}
							accessibilityHint=""
						>
							<LinearGradient
								colors={[gradients.blueLight.start, gradients.blueLight.end]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.btn}
							>
								<Text
									style={{
										...s.white,
										...s.bold,
									}}
								>
									Save
								</Text>
							</LinearGradient>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={s.mt5}
						onPress={onPressCancel}
						accessibilityRole="button"
						accessibilityLabel={"Cancel"}
						accessibilityHint=""
						onAccessibilityEscape={onPressCancel}
					>
						<View style={styles.btn}>
							<Text
								style={{
									...s.black,
									...s.bold,
									...pal.text,
								}}
							>
								Cancel
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 18,
	},
	labelWrapper: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 4,
		paddingBottom: 4,
		marginTop: 20,
	},
	label: {
		fontWeight: "600",
	},
	form: {
		paddingHorizontal: 6,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 14,
		paddingVertical: 10,
		fontSize: 16,
	},
	textArea: {
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingTop: 10,
		fontSize: 16,
		height: 100,
		textAlignVertical: "top",
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
		width: 84,
		height: 84,
		borderWidth: 2,
		borderRadius: 42,
		marginTop: 4,
	},
	errorContainer: { marginTop: 20 },
});
