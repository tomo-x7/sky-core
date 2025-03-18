import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import lande from "lande";
import { useEffect, useState } from "react";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";
import { code3ToCode2Strict, codeToLanguageName } from "#/locale/helpers";
import { toPostLanguages, useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences/languages";
import { Button } from "../../util/forms/Button";

// fallbacks for safari
const onIdle = globalThis.requestIdleCallback || ((cb) => setTimeout(cb, 1));
const cancelIdle = globalThis.cancelIdleCallback || clearTimeout;

export function SuggestedLanguage({ text }: { text: string }) {
	const [suggestedLanguage, setSuggestedLanguage] = useState<string | undefined>();
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();
	const pal = usePalette("default");

	useEffect(() => {
		const textTrimmed = text.trim();

		// Don't run the language model on small posts, the results are likely
		// to be inaccurate anyway.
		if (textTrimmed.length < 40) {
			setSuggestedLanguage(undefined);
			return;
		}

		const idle = onIdle(() => {
			setSuggestedLanguage(guessLanguage(textTrimmed));
		});

		return () => cancelIdle(idle);
	}, [text]);

	if (suggestedLanguage && !toPostLanguages(langPrefs.postLanguage).includes(suggestedLanguage)) {
		const suggestedLanguageName = codeToLanguageName(suggestedLanguage, langPrefs.appLanguage);

		return (
			<div
				style={{
					...pal.border,
					...styles.infoBar,
				}}
			>
				{/* @ts-expect-error */}
				<FontAwesomeIcon icon="language" style={pal.text} size={24} />
				<Text
					style={{
						...pal.text,
						...s.flex1,
					}}
				>
					<>
						Are you writing in{" "}
						<Text type="sm-bold" style={pal.text}>
							{suggestedLanguageName}
						</Text>
						?
					</>
				</Text>
				<Button
					type="default"
					onPress={() => setLangPrefs.setPostLanguage(suggestedLanguage)}
					accessibilityLabel={`Change post language to ${suggestedLanguageName}`}
					accessibilityHint=""
				>
					<Text
						type="button"
						style={{
							...pal.link,
							...s.fw600,
						}}
					>
						Yes
					</Text>
				</Button>
			</div>
		);
	} else {
		return null;
	}
}

const styles = {
	infoBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		borderWidth: 1,
		borderRadius: 6,
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
		padding: "12px 16px",
	},
} satisfies Record<string, React.CSSProperties>;

/**
 * This function is using the lande language model to attempt to detect the language
 * We want to only make suggestions when we feel a high degree of certainty
 * The magic numbers are based on debugging sessions against some test strings
 */
function guessLanguage(text: string): string | undefined {
	const scores = lande(text).filter(([_lang, value]) => value >= 0.0002);
	// if the model has multiple items with a score higher than 0.0002, it isn't certain enough
	if (scores.length !== 1) {
		return undefined;
	}
	const [lang, value] = scores[0];
	// if the model doesn't give a score of 0.97 or above, it isn't certain enough
	if (value < 0.97) {
		return undefined;
	}
	return code3ToCode2Strict(lang);
}
