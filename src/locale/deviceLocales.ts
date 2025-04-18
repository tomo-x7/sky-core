import { dedupArray } from "#/lib/functions";

export function getLocales() {
	return [
		{
			languageTag: "ja-JP",
			languageCode: "ja",
			regionCode: "JP",
			languageRegionCode: "JP",
			currencyCode: "JPY",
			currencySymbol: "¥",
			langageCurrencyCode: "JPY",
			langageCurrencySymbol: "¥",
			decimalSeparator: ".",
			digitGroupingSeparator: ",",
			textDirection: "ltr",
			measurementSystem: "metric",
			temperatureUnit: "celsius",
		},
	] as const;
}

export const deviceLocales = getLocales();

/**
 * BCP-47 language tag without region e.g. array of 2-char lang codes
 *
 * {@link https://docs.expo.dev/versions/latest/sdk/localization/#locale}
 */
export const deviceLanguageCodes = dedupArray(deviceLocales.map((l) => l.languageCode));
