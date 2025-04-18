export async function getInitialURL(): Promise<string | undefined> {
	if (window.location.pathname !== "/") {
		return window.location.pathname;
	}
	return undefined;
}

export function clearHash() {
	window.location.hash = "";
}
