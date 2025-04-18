import { useCallback } from "react";

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
			url = createBskyAppAbsoluteUrl(url);
		}

		if (!isBskyAppUrl(url)) {
			if (shouldProxy) {
				url = createProxiedUrl(url);
			}
		}
		window.open(url);
		// Linking.openURL(url);
	}, []);

	return openLink;
}
