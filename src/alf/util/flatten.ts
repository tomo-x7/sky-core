export function flatten(
	stylesArr: (React.CSSProperties | undefined | false)[] | undefined | false,
): React.CSSProperties {
	if (stylesArr == null || typeof stylesArr !== "object") return {};
	const result: React.CSSProperties = {};
	for (const style of stylesArr) {
		if (style == null) continue;
		for (const [key, value] of Object.entries(style)) {
			result[key as keyof React.CSSProperties] = value;
		}
	}
	return result;
}
