export function flatten(stylesArr: (React.CSSProperties | undefined)[] | undefined | false): React.CSSProperties {
	if (stylesArr == null || typeof stylesArr !== "object") return {};
	const result: React.CSSProperties = {};
	for (const style of stylesArr) {
		if (style == null) continue;
		for (const [key, value] of Object.entries(style)) {
			//@ts-ignore
			result[key] = value;
		}
	}
	return result;
}
