import { isNetworkError } from "#/lib/strings/errors";

export async function retry<P>(retries: number, cond: (err: any) => boolean, fn: () => Promise<P>): Promise<P> {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let lastErr;
	while (retries > 0) {
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			if (cond(e)) {
				//biome-ignore lint/style/noParameterAssign:
				retries--;
				continue;
			}
			throw e;
		}
	}
	throw lastErr;
}

export async function networkRetry<P>(retries: number, fn: () => Promise<P>): Promise<P> {
	return retry(retries, isNetworkError, fn);
}
