import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";

import { LANG_DROPDOWN_HITSLOP } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { useModalControls } from "#/state/modals";
import { hasPostLanguage, toPostLanguages, useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences/languages";
import { DropdownButton, type DropdownItem, type DropdownItemButton } from "#/view/com/util/forms/DropdownButton";
import { Text } from "#/view/com/util/text/Text";
import { codeToLanguageName } from "../../../../locale/helpers";

export function SelectLangBtn() {
	const pal = usePalette("default");
	const { openModal } = useModalControls();
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();

	const onPressMore = useCallback(async () => {
		openModal({ name: "post-languages-settings" });
	}, [openModal]);

	const postLanguagesPref = toPostLanguages(langPrefs.postLanguage);
	const items: DropdownItem[] = useMemo(() => {
		const arr: DropdownItemButton[] = [];

		function add(commaSeparatedLangCodes: string) {
			const langCodes = commaSeparatedLangCodes.split(",");
			const langName = langCodes.map((code) => codeToLanguageName(code, langPrefs.appLanguage)).join(" + ");

			/*
			 * Filter out any duplicates
			 */
			if (arr.find((item: DropdownItemButton) => item.label === langName)) {
				return;
			}

			arr.push({
				icon:
					langCodes.every((code) => hasPostLanguage(langPrefs.postLanguage, code)) &&
					langCodes.length === postLanguagesPref.length
						? ["fas", "circle-dot"]
						: ["far", "circle"],
				label: langName,
				onPress() {
					setLangPrefs.setPostLanguage(commaSeparatedLangCodes);
				},
			});
		}

		if (postLanguagesPref.length) {
			/*
			 * Re-join here after sanitization bc postLanguageHistory is an array of
			 * comma-separated strings too
			 */
			add(langPrefs.postLanguage);
		}

		// comma-separted strings of lang codes that have been used in the past
		for (const lang of langPrefs.postLanguageHistory) {
			add(lang);
		}

		return [
			{ heading: true, label: "Post language" },
			...arr.slice(0, 6),
			{ sep: true },
			{
				label: "Other...",
				onPress: onPressMore,
			},
		];
	}, [onPressMore, langPrefs, setLangPrefs, postLanguagesPref]);

	return (
		<DropdownButton
			type="bare"
			testID="selectLangBtn"
			items={items}
			openUpwards
			style={styles.button}
			hitSlop={LANG_DROPDOWN_HITSLOP}
			accessibilityLabel={"Language selection"}
			accessibilityHint=""
		>
			{postLanguagesPref.length > 0 ? (
				<Text type="lg-bold" style={[pal.link, styles.label]} numberOfLines={1}>
					{postLanguagesPref.map((lang) => codeToLanguageName(lang, langPrefs.appLanguage)).join(", ")}
				</Text>
			) : (
				// @ts-ignore
				<FontAwesomeIcon icon="language" style={pal.link} size={26} />
			)}
		</DropdownButton>
	);
}

const styles = StyleSheet.create({
	button: {
		marginHorizontal: 15,
	},
	label: {
		maxWidth: 100,
	},
});
