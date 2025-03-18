import React from "react";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { deviceLanguageCodes } from "#/locale/deviceLocales";
import { languageName } from "#/locale/helpers";
import { useModalControls } from "#/state/modals";
import { hasPostLanguage, useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences/languages";
import { ToggleButton } from "#/view/com/util/forms/ToggleButton";
import { LANGUAGES, LANGUAGES_MAP_CODE2 } from "../../../../locale/languages";
import { ScrollView } from "../util";
import { ConfirmLanguagesButton } from "./ConfirmLanguagesButton";

export const snapPoints = ["100%"];

export function Component() {
	const { closeModal } = useModalControls();
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();
	const pal = usePalette("default");
	const { isMobile } = useWebMediaQueries();
	const onPressDone = React.useCallback(() => {
		closeModal();
	}, [closeModal]);

	const languages = React.useMemo(() => {
		const langs = LANGUAGES.filter(
			(lang) => !!lang.code2.trim() && LANGUAGES_MAP_CODE2[lang.code2].code3 === lang.code3,
		);
		// sort so that device & selected languages are on top, then alphabetically
		langs.sort((a, b) => {
			//@ts-expect-error
			const hasA = hasPostLanguage(langPrefs.postLanguage, a.code2) || deviceLanguageCodes.includes(a.code2);
			//@ts-expect-error
			const hasB = hasPostLanguage(langPrefs.postLanguage, b.code2) || deviceLanguageCodes.includes(b.code2);
			if (hasA === hasB) return a.name.localeCompare(b.name);
			if (hasA) return -1;
			return 1;
		});
		return langs;
	}, [langPrefs]);

	const onPress = React.useCallback(
		(code2: string) => {
			setLangPrefs.togglePostLanguage(code2);
		},
		[setLangPrefs],
	);

	return (
		<div
			style={{
				...pal.view,
				...styles.container,

				...(isMobile
					? {
							paddingTop: 20,
						}
					: {
							maxHeight: "90vh",
						}),
			}}
		>
			<Text
				style={{
					...pal.text,
					...styles.title,
				}}
			>
				Post Languages
			</Text>
			<Text
				style={{
					...pal.text,
					...styles.description,
				}}
			>
				Which languages are used in this post?
			</Text>
			<ScrollView style={styles.scrollContainer}>
				{languages.map((lang) => {
					const isSelected = hasPostLanguage(langPrefs.postLanguage, lang.code2);

					// enforce a max of 3 selections for post languages
					let isDisabled = false;
					if (langPrefs.postLanguage.split(",").length >= 3 && !isSelected) {
						isDisabled = true;
					}

					return (
						<ToggleButton
							key={lang.code2}
							label={languageName(lang, langPrefs.appLanguage)}
							isSelected={isSelected}
							onPress={() => (isDisabled ? undefined : onPress(lang.code2))}
							style={{
								...pal.border,
								...styles.languageToggle,
								...(isDisabled && styles.dimmed),
							}}
						/>
					);
				})}
				<div
					style={{
						height: isMobile ? 60 : 0,
					}}
				/>
			</ScrollView>
			<ConfirmLanguagesButton onPress={onPressDone} />
		</div>
	);
}

const styles = {
	container: {
		flex: 1,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 10,
	},
	scrollContainer: {
		flex: 1,
		paddingLeft: 10,
		paddingRight: 10,
	},
	languageToggle: {
		borderTopWidth: 1,
		borderRadius: 0,
		padding: "12px 6px",
	},
	dimmed: {
		opacity: 0.5,
	},
} satisfies Record<string, React.CSSProperties>;
