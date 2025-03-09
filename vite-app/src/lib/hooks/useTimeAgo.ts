import { differenceInSeconds } from "date-fns";
import { useCallback } from "react";

export type DateDiffFormat = "long" | "short";

type DateDiff = {
	value: number;
	unit: "now" | "second" | "minute" | "hour" | "day" | "month";
	earlier: Date;
	later: Date;
};

const NOW = 5;
const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH_30 = DAY * 30;

export function useGetTimeAgo({ future = false }: { future?: boolean } = {}) {
	return useCallback(
		(earlier: number | string | Date, later: number | string | Date, options?: { format: DateDiffFormat }) => {
			const diff = dateDiff(earlier, later, future ? "up" : "down");
			return formatDateDiff({ diff, format: options?.format });
		},
		[future],
	);
}

/**
 * Returns the difference between `earlier` and `later` dates, based on
 * opinionated rules.
 *
 * - All month are considered exactly 30 days.
 * - Dates assume `earlier` <= `later`, and will otherwise return 'now'.
 * - All values round down
 */
export function dateDiff(
	earlier: number | string | Date,
	later: number | string | Date,
	rounding: "up" | "down" = "down",
): DateDiff {
	let diff = {
		value: 0,
		unit: "now" as DateDiff["unit"],
	};
	const e = new Date(earlier);
	const l = new Date(later);
	const diffSeconds = differenceInSeconds(l, e);

	if (diffSeconds < NOW) {
		diff = {
			value: 0,
			unit: "now" as DateDiff["unit"],
		};
	} else if (diffSeconds < MINUTE) {
		diff = {
			value: diffSeconds,
			unit: "second" as DateDiff["unit"],
		};
	} else if (diffSeconds < HOUR) {
		const value = rounding === "up" ? Math.ceil(diffSeconds / MINUTE) : Math.floor(diffSeconds / MINUTE);
		diff = {
			value,
			unit: "minute" as DateDiff["unit"],
		};
	} else if (diffSeconds < DAY) {
		const value = rounding === "up" ? Math.ceil(diffSeconds / HOUR) : Math.floor(diffSeconds / HOUR);
		diff = {
			value,
			unit: "hour" as DateDiff["unit"],
		};
	} else if (diffSeconds < MONTH_30) {
		const value = rounding === "up" ? Math.ceil(diffSeconds / DAY) : Math.floor(diffSeconds / DAY);
		diff = {
			value,
			unit: "day" as DateDiff["unit"],
		};
	} else {
		const value = rounding === "up" ? Math.ceil(diffSeconds / MONTH_30) : Math.floor(diffSeconds / MONTH_30);
		diff = {
			value,
			unit: "month" as DateDiff["unit"],
		};
	}

	return {
		...diff,
		earlier: e,
		later: l,
	};
}

/**
 * Accepts a `DateDiff` and teturns the difference between `earlier` and
 * `later` dates, formatted as a natural language string.
 *
 * - All month are considered exactly 30 days.
 * - Dates assume `earlier` <= `later`, and will otherwise return 'now'.
 * - Differences >= 360 days are returned as the "M/D/YYYY" string
 * - All values round down
 */
export function formatDateDiff({
	diff,
	format = "short",
}: {
	diff: DateDiff;
	format?: DateDiffFormat;
}): string {
	const long = format === "long";

	switch (diff.unit) {
		case "now": {
			return "now";
		}
		case "second": {
			return long ? `${diff.value} ${diff.value === 1 ? "second" : "seconds"}` : `${diff.value}s`;
		}
		case "minute": {
			return long ? `${diff.value} ${diff.value === 1 ? "minute" : "minutes"}` : `${diff.value}m`;
		}
		case "hour": {
			return long ? `${diff.value} ${diff.value === 1 ? "hour" : "hours"}` : `${diff.value}h`;
		}
		case "day": {
			return long ? `${diff.value} ${diff.value === 1 ? "day" : "days"}` : `${diff.value}d`;
		}
		case "month": {
			if (diff.value < 12) {
				return long ? `${diff.value} ${diff.value === 1 ? "month" : "months"}` : `${diff.value}mo`;
			}
			return new Date(diff.earlier).toLocaleDateString();
		}
	}
}
