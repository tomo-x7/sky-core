import { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { CC_Stroke2_Corner0_Rounded as CCIcon } from "#/components/icons/CC";
import { PageText_Stroke2_Corner0_Rounded as PageTextIcon } from "#/components/icons/PageText";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Warning_Stroke2_Corner0_Rounded as WarningIcon } from "#/components/icons/Warning";
import { MAX_ALT_TEXT } from "#/lib/constants";
import { useEnforceMaxGraphemeCount } from "#/lib/strings/helpers";
import { LANGUAGES } from "#/locale/languages";
import { useLanguagePrefs } from "#/state/preferences";
import { SubtitleFilePicker } from "./SubtitleFilePicker";

const MAX_NUM_CAPTIONS = 1;

type CaptionsTrack = { lang: string; file: File };

interface Props {
	defaultAltText: string;
	captions: CaptionsTrack[];
	saveAltText: (altText: string) => void;
	setCaptions: (updater: (prev: CaptionsTrack[]) => CaptionsTrack[]) => void;
}

export function SubtitleDialogBtn(props: Props) {
	const control = Dialog.useDialogControl();

	return (
		<div
			style={{
				...a.flex_row,
				...a.my_xs,
			}}
		>
			<Button
				label={"Captions & alt text"}
				accessibilityHint={"Opens captions and alt text dialog"}
				size="small"
				color="secondary"
				variant="ghost"
				onPress={() => {
					if (Keyboard.isVisible()) Keyboard.dismiss();
					control.open();
				}}
			>
				<ButtonIcon icon={CCIcon} />
				<ButtonText>Captions & alt text</ButtonText>
			</Button>
			<Dialog.Outer control={control}>
				<Dialog.Handle />
				<SubtitleDialogInner {...props} />
			</Dialog.Outer>
		</div>
	);
}

function SubtitleDialogInner({ defaultAltText, saveAltText, captions, setCaptions }: Props) {
	const control = Dialog.useDialogContext();
	const t = useTheme();
	const enforceLen = useEnforceMaxGraphemeCount();
	const { primaryLanguage } = useLanguagePrefs();

	const [altText, setAltText] = useState(defaultAltText);

	const handleSelectFile = useCallback(
		(file: File) => {
			setCaptions((subs) => [
				...subs,
				{
					lang: subs.some((s) => s.lang === primaryLanguage) ? "" : primaryLanguage,
					file,
				},
			]);
		},
		[setCaptions, primaryLanguage],
	);

	const subtitleMissingLanguage = captions.some((sub) => sub.lang === "");

	return (
		<Dialog.ScrollableInner label={"Video settings"}>
			<div style={a.gap_md}>
				<Text
					style={{
						...a.text_xl,
						...a.font_bold,
						...a.leading_tight,
					}}
				>
					Alt text
				</Text>
				<TextField.Root>
					<Dialog.Input
						label={"Alt text"}
						placeholder={"Add alt text (optional)"}
						value={altText}
						onChangeText={(evt) => setAltText(enforceLen(evt, MAX_ALT_TEXT))}
						maxLength={MAX_ALT_TEXT * 10}
						multiline
						style={{ maxHeight: 300 }}
						// TODO
						// numberOfLines={3}
						onKeyPress={({ nativeEvent }) => {
							if (nativeEvent.key === "Escape") {
								control.close();
							}
						}}
					/>
				</TextField.Root>

				<div
					style={{
						...a.border_t,
						...a.w_full,
						...t.atoms.border_contrast_medium,
						...a.my_md,
					}}
				/>
				<Text
					style={{
						...a.text_xl,
						...a.font_bold,
						...a.leading_tight,
					}}
				>
					Captions (.vtt)
				</Text>
				<SubtitleFilePicker
					onSelectFile={handleSelectFile}
					disabled={subtitleMissingLanguage || captions.length >= MAX_NUM_CAPTIONS}
				/>
				<div>
					{captions.map((subtitle, i) => (
						<SubtitleFileRow
							key={subtitle.lang}
							language={subtitle.lang}
							file={subtitle.file}
							setCaptions={setCaptions}
							otherLanguages={LANGUAGES.filter(
								(lang) =>
									langCode(lang) === subtitle.lang ||
									!captions.some((s) => s.lang === langCode(lang)),
							)}
							style={i % 2 === 0 ? t.atoms.bg_contrast_25 : {}}
						/>
					))}
				</div>
				{subtitleMissingLanguage && (
					<Text
						style={{
							...a.text_sm,
							...t.atoms.text_contrast_medium,
						}}
					>
						Ensure you have selected a language for each subtitle file.
					</Text>
				)}

				<div
					style={{
						...a.flex_row,
						...a.justify_end,
					}}
				>
					<Button
						label={"Done"}
						size={"small"}
						color="primary"
						variant="solid"
						onPress={() => {
							saveAltText(altText);
							control.close();
						}}
						style={a.mt_lg}
					>
						<ButtonText>Done</ButtonText>
					</Button>
				</div>
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}

function SubtitleFileRow({
	language,
	file,
	otherLanguages,
	setCaptions,
	style,
}: {
	language: string;
	file: File;
	otherLanguages: { code2: string; code3: string; name: string }[];
	setCaptions: (updater: (prev: CaptionsTrack[]) => CaptionsTrack[]) => void;
	style: React.CSSProperties;
}) {
	const t = useTheme();

	const handleValueChange = useCallback(
		(lang: string) => {
			if (lang) {
				setCaptions((subs) => subs.map((s) => (s.lang === language ? { lang, file: s.file } : s)));
			}
		},
		[setCaptions, language],
	);

	return (
		<div
			style={{
				...a.flex_row,
				...a.justify_between,
				...a.py_md,
				...a.px_lg,
				...a.rounded_md,
				...a.gap_md,
				...style,
			}}
		>
			<div
				style={{
					...a.flex_1,
					...a.gap_xs,
					...a.justify_center,
				}}
			>
				<div
					style={{
						...a.flex_row,
						...a.align_center,
						...a.gap_sm,
					}}
				>
					{language === "" ? (
						<WarningIcon style={a.flex_shrink_0} fill={t.palette.negative_500} size="sm" />
					) : (
						<PageTextIcon
							style={{
								...t.atoms.text,
								...a.flex_shrink_0,
							}}
							size="sm"
						/>
					)}
					<Text
						style={{
							...a.flex_1,
							...a.leading_snug,
							...a.font_bold,
							...a.mb_2xs,
						}}
						numberOfLines={1}
					>
						{file.name}
					</Text>
					<RNPickerSelect
						placeholder={{
							label: "Select language...",
							value: "",
						}}
						value={language}
						onValueChange={handleValueChange}
						items={otherLanguages.map((lang) => ({
							label: `${lang.name} (${langCode(lang)})`,
							value: langCode(lang),
						}))}
						style={{ viewContainer: { maxWidth: 200, flex: 1 } }}
					/>
				</div>
			</div>
			<Button
				label={"Remove subtitle file"}
				size="tiny"
				shape="round"
				variant="outline"
				color="secondary"
				onPress={() => setCaptions((subs) => subs.filter((s) => s.lang !== language))}
				style={a.ml_sm}
			>
				<ButtonIcon icon={X} />
			</Button>
		</div>
	);
}

function langCode(lang: { code2: string; code3: string }) {
	return lang.code2 || lang.code3;
}
