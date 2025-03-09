import { useCallback } from "react";
import { Linking } from "react-native";

import {
	createBskyAppAbsoluteUrl,
	createProxiedUrl,
	isBskyAppUrl,
	isBskyRSSUrl,
	isRelativeUrl,
} from "#/lib/strings/url-helpers";

export function useOpenLink() {
	const openLink = useCallback(async (url: string, override?: boolean, shouldProxy?: boolean) => {
		if (isBskyRSSUrl(url) && isRelativeUrl(url)) {
			//biome-ignore lint/style/noParameterAssign:
			url = createBskyAppAbsoluteUrl(url);
		}

		if (!isBskyAppUrl(url)) {
			if (shouldProxy) {
				//biome-ignore lint/style/noParameterAssign:
				url = createProxiedUrl(url);
			}
		}

		Linking.openURL(url);
	}, []);

	return openLink;
}
