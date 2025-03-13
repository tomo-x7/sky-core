export async function getInitialURL(): Promise<string | undefined> {
	// @ts-ignore window exists -prf
	if (window.location.pathname !== "/") {
		return window.location.pathname;
	}
	return undefined;
}

export function clearHash() {
	// @ts-ignore window exists -prf
	window.location.hash = "";
}
