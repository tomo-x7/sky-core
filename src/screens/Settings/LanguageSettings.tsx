import { useCallback, useMemo } from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { Check_Stroke2_Corner0_Rounded as CheckIcon } from "#/components/icons/Check";
import { ChevronBottom_Stroke2_Corner0_Rounded as ChevronDownIcon } from "#/components/icons/Chevron";
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import { APP_LANGUAGES, LANGUAGES } from "#/lib/../locale/languages";
import { languageName, sanitizeAppLanguageSetting } from "#/locale/helpers";
import { useModalControls } from "#/state/modals";
import { useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences";
import * as SettingsList from "./components/SettingsList";

export function LanguageSettingsScreen() {
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();
	const t = useTheme();

	const { openModal } = useModalControls();

	const onPressContentLanguages = useCallback(() => {
		openModal({ name: "content-languages-settings" });
	}, [openModal]);

	const onChangePrimaryLanguage = useCallback(
		(value: string) => {
			if (!value) return;
			if (langPrefs.primaryLanguage !== value) {
				setLangPrefs.setPrimaryLanguage(value);
			}
		},
		[langPrefs, setLangPrefs],
	);

	const onChangeAppLanguage = useCallback(
		(value: string) => {
			if (!value) return;
			if (langPrefs.appLanguage !== value) {
				setLangPrefs.setAppLanguage(sanitizeAppLanguageSetting(value));
			}
		},
		[langPrefs, setLangPrefs],
	);

	const myLanguages = useMemo(() => {
		return langPrefs.contentLanguages
			.map((lang) => LANGUAGES.find((l) => l.code2 === lang))
			.filter(Boolean)
			.map((l) => languageName(l!, langPrefs.appLanguage))
			.join(", ");
	}, [langPrefs.appLanguage, langPrefs.contentLanguages]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Languages</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Group iconInset={false}>
						<SettingsList.ItemText>App Language</SettingsList.ItemText>
						<div
							style={{
								gap: 12,
								width: "100%",
							}}
						>
							<Text style={{ lineHeight: 1.3 }}>
								Select which language to use for the app's user interface.
							</Text>
							<div
								style={{
									position: "relative",
									width: "100%",
									maxWidth: 400,
								}}
							>
								{/* <RNPickerSelect
									darkTheme={t.scheme === "dark"}
									placeholder={{}}
									value={sanitizeAppLanguageSetting(langPrefs.appLanguage)}
									onValueChange={onChangeAppLanguage}
									items={APP_LANGUAGES.filter((l) => Boolean(l.code2)).map((l) => ({
										label: l.name,
										value: l.code2,
										key: l.code2,
									}))}
									style={{
										inputAndroid: {
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
										inputIOS: {
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
										inputWeb: {
											flex: 1,
											width: "100%",
											cursor: "pointer",
											// @ ts-expect-error web only
											"-moz-appearance": "none",
											"-webkit-appearance": "none",
											appearance: "none",
											outline: 0,
											borderWidth: 0,
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											fontFamily: "inherit",
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
									}}
								/> */}
								<select
									onChange={(ev) => onChangeAppLanguage(ev.target.value)}
									style={{
										flex: 1,
										width: "100%",
										cursor: "pointer",
										// @ts-expect-error web only
										"-moz-appearance": "none",
										"-webkit-appearance": "none",
										appearance: "none",
										outline: 0,
										borderWidth: 0,
										backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
										color: t.atoms.text.color,
										fontSize: 14,
										fontFamily: "inherit",
										letterSpacing: 0.5,
										fontWeight: "600",
										paddingLeft: 14,
										paddingRight: 14,
										paddingTop: 8,
										paddingBottom: 8,
										borderRadius: 4,
									}}
								>
									{APP_LANGUAGES.filter((l) => Boolean(l.code2)).map((l) => (
										<option
											key={l.code2}
											value={l.code2}
											selected={l.code2 === sanitizeAppLanguageSetting(langPrefs.appLanguage)}
										>
											{l.name}
										</option>
									))}
								</select>

								<div
									style={{
										position: "absolute",
										...t.atoms.bg_contrast_25,
										borderRadius: 4,
										pointerEvents: "none",
										alignItems: "center",
										justifyContent: "center",

										...{
											top: 1,
											right: 1,
											bottom: 1,
											width: 40,
										},
									}}
								>
									<ChevronDownIcon style={t.atoms.text} />
								</div>
							</div>
						</div>
					</SettingsList.Group>
					<SettingsList.Divider />
					<SettingsList.Group iconInset={false}>
						<SettingsList.ItemText>Primary Language</SettingsList.ItemText>
						<div
							style={{
								gap: 12,
								width: "100%",
							}}
						>
							<Text style={{ lineHeight: 1.3 }}>
								Select your preferred language for translations in your feed.
							</Text>
							<div
								style={{
									position: "relative",
									width: "100%",
									maxWidth: 400,
								}}
							>
								{/* <RNPickerSelect
									darkTheme={t.scheme === "dark"}
									placeholder={{}}
									value={langPrefs.primaryLanguage}
									onValueChange={onChangePrimaryLanguage}
									items={LANGUAGES.filter((l) => Boolean(l.code2)).map((l) => ({
										label: languageName(l, langPrefs.appLanguage),
										value: l.code2,
										key: l.code2 + l.code3,
									}))}
									style={{
										inputAndroid: {
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
										inputIOS: {
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
										inputWeb: {
											flex: 1,
											width: "100%",
											cursor: "pointer",
											// @ ts-expect-error web only
											"-moz-appearance": "none",
											"-webkit-appearance": "none",
											appearance: "none",
											outline: 0,
											borderWidth: 0,
											backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
											color: t.atoms.text.color,
											fontSize: 14,
											fontFamily: "inherit",
											letterSpacing: 0.5,
											fontWeight: atoms.font_bold.fontWeight,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 8,
											paddingBottom: 8,
											borderRadius: atoms.rounded_xs.borderRadius,
										},
									}}
								/> */}
								<select
									onChange={(ev) => onChangePrimaryLanguage(ev.target.value)}
									style={{
										flex: 1,
										width: "100%",
										cursor: "pointer",
										// @ts-expect-error web only
										"-moz-appearance": "none",
										"-webkit-appearance": "none",
										appearance: "none",
										outline: 0,
										borderWidth: 0,
										backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
										color: t.atoms.text.color,
										fontSize: 14,
										fontFamily: "inherit",
										letterSpacing: 0.5,
										fontWeight: "600",
										paddingLeft: 14,
										paddingRight: 14,
										paddingTop: 8,
										paddingBottom: 8,
										borderRadius: 4,
									}}
								>
									{LANGUAGES.filter((l) => Boolean(l.code2)).map((l) => (
										<option
											key={l.code2 + l.code3}
											value={l.code2}
											selected={l.code2 === langPrefs.primaryLanguage}
										>
											{languageName(l, langPrefs.appLanguage)}
										</option>
									))}
								</select>

								<div
									style={{
										position: "absolute",
										top: 1,
										right: 1,
										bottom: 1,
										width: 40,
										backgroundColor: t.atoms.bg_contrast_25.backgroundColor,
										borderRadius: 4,
										pointerEvents: "none",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<ChevronDownIcon style={t.atoms.text} />
								</div>
							</div>
						</div>
					</SettingsList.Group>
					<SettingsList.Divider />
					<SettingsList.Group iconInset={false}>
						<SettingsList.ItemText>Content Languages</SettingsList.ItemText>
						<div style={{ gap: 12 }}>
							<Text style={{ lineHeight: 1.3 }}>
								Select which languages you want your subscribed feeds to include. If none are selected,
								all languages will be shown.
							</Text>

							<Button
								label={"Select content languages"}
								size="small"
								color="secondary"
								variant="solid"
								onPress={onPressContentLanguages}
								style={{
									justifyContent: "flex-start",
									...{ maxWidth: 400 },
								}}
							>
								<ButtonIcon icon={myLanguages.length > 0 ? CheckIcon : PlusIcon} />
								<ButtonText
									style={{
										...t.atoms.text,
										fontSize: 16,
										letterSpacing: 0,
										flex: 1,
										textAlign: "left",
									}}
									// TODO
									// numberOfLines={1}
								>
									{myLanguages.length > 0 ? myLanguages : "Select languages"}
								</ButtonText>
							</Button>
						</div>
					</SettingsList.Group>
				</SettingsList.Container>
			</Layout.Content>
		</Layout.Screen>
	);
}
