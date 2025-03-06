export function niceDate(date: number | string | Date) {
	const d = new Date(date);
	return d.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
}

export function getAge(birthDate: Date): number {
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

/**
 * Get a Date object that is N years ago from now
 * @param years number of years
 * @returns Date object
 */
export function getDateAgo(years: number): Date {
	const date = new Date();
	date.setFullYear(date.getFullYear() - years);
	return date;
}

/**
 * Compares two dates by year, month, and day only
 */
export function simpleAreDatesEqual(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
