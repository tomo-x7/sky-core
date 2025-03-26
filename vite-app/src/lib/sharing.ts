import * as Toast from "#/view/com/util/Toast";

/**
 * This function shares a URL using the native Share API if available, or copies it to the clipboard
 * and displays a toast message if not (mostly on web)
 * @param {string} url - A string representing the URL that needs to be shared or copied to the
 * clipboard.
 */
export async function shareUrl(url: string) {
	//TODO: Web Share APIに対応している場合はそれを使う
	// React Native Share is not supported by web. Web Share API
	// has increasing but not full support, so default to clipboard
	await navigator.clipboard.writeText(url);
	Toast.show("Copied to clipboard", "clipboard-check");
}

/**
 * This function shares a text using the native Share API if available, or copies it to the clipboard
 * and displays a toast message if not (mostly on web)
 *
 * @param {string} text - A string representing the text that needs to be shared or copied to the
 * clipboard.
 */
export async function shareText(text: string) {
	//TODO: Web Share APIに対応している場合はそれを使う
	await navigator.clipboard.writeText(text);
	Toast.show("Copied to clipboard", "clipboard-check");
}
