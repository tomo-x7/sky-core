const PREFIX = "agent-labelers";

export async function saveLabelers(did: string, value: string[]) {
	localStorage.setItem(`${PREFIX}:${did}`, JSON.stringify(value));
}

export async function readLabelers(did: string): Promise<string[] | undefined> {
	const rawData = localStorage.getItem(`${PREFIX}:${did}`);
	return rawData ? JSON.parse(rawData) : undefined;
}
