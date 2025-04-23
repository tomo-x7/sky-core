import { useCallback, useState } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import { CC_Stroke2_Corner0_Rounded as CCIcon } from "#/components/icons/CC";
import { PageText_Stroke2_Corner0_Rounded as PageTextIcon } from "#/components/icons/PageText";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Warning_Stroke2_Corner0_Rounded as WarningIcon } from "#/components/icons/Warning";
import { Keyboard } from "#/lib/Keyboard";
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
				flexDirection: "row",
				marginTop: 4,
				marginBottom: 4,
			}}
		>
			<Button
				label={"Captions & alt text"}
				size="small"
				color="secondary"
				variant="ghost"
				onPress={() => {
					Keyboard.dismiss();
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
			<div style={{ gap: 12 }}>
				<Text
					style={{
						fontSize: 20,
						letterSpacing: 0,
						fontWeight: "600",
						lineHeight: 1.15,
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
						borderTop: "1px solid black",
						borderTopWidth: 1,
						width: "100%",
						...t.atoms.border_contrast_medium,
						marginTop: 12,
						marginBottom: 12,
					}}
				/>
				<Text
					style={{
						fontSize: 20,
						letterSpacing: 0,
						fontWeight: "600",
						lineHeight: 1.15,
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
							fontSize: 14,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
						}}
					>
						Ensure you have selected a language for each subtitle file.
					</Text>
				)}

				<div
					style={{
						flexDirection: "row",
						justifyContent: "flex-end",
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
						style={{ marginTop: 16 }}
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
				flexDirection: "row",
				justifyContent: "space-between",
				paddingTop: 12,
				paddingBottom: 12,
				paddingLeft: 16,
				paddingRight: 16,
				borderRadius: 12,
				gap: 12,
				...style,
			}}
		>
			<div
				style={{
					flex: 1,
					gap: 4,
					justifyContent: "center",
				}}
			>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					{language === "" ? (
						<WarningIcon style={{ flexShrink:0 }} fill={t.palette.negative_500} size="sm" />
					) : (
						<PageTextIcon
							style={{
								...t.atoms.text,
								flexShrink:0,
							}}
							size="sm"
						/>
					)}
					<Text
						style={{
							flex: 1,
							lineHeight: 1.3,
							fontWeight: "600",
							marginBottom: 2,
						}}
						numberOfLines={1}
					>
						{file.name}
					</Text>
					{/* <RNPickerSelect
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
					/> */}
					<select onChange={(ev) => handleValueChange(ev.target.value)} style={{ maxWidth: 200, flex: 1 }}>
						<option value="">Select language...</option>
						{otherLanguages.map((lang) => (
							<option key={langCode(lang)} value={langCode(lang)} selected={langCode(lang) === language}>
								{`${lang.name} (${langCode(lang)})`}
							</option>
						))}
					</select>
				</div>
			</div>
			<Button
				label={"Remove subtitle file"}
				size="tiny"
				shape="round"
				variant="outline"
				color="secondary"
				onPress={() => setCaptions((subs) => subs.filter((s) => s.lang !== language))}
				style={{ marginLeft: 8 }}
			>
				<ButtonIcon icon={X} />
			</Button>
		</div>
	);
}

function langCode(lang: { code2: string; code3: string }) {
	return lang.code2 || lang.code3;
}
