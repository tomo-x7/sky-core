export async function getInitialURL(): Promise<string | undefined> {
	// @ts-expect-error window exists -prf
	if (window.location.pathname !== "/") {
		return window.location.pathname;
	}
	return undefined;
}

export function clearHash() {
	// @ts-expect-error window exists -prf
	window.location.hash = "";
}
