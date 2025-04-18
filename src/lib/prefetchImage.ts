export function prefetch(src: string) {
	return new Promise<void>((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve();
		img.onerror = (e) => reject(e);
	});
}
