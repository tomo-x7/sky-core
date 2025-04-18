const formatter = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
export const formatCount = (num: number) => {
	return formatter.format(Math.trunc(num * 10) / 10);
};
