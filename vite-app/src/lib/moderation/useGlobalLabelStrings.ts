import { useMemo } from "react";

export type GlobalLabelStrings = Record<
	string,
	{
		name: string;
		description: string;
	}
>;

export function useGlobalLabelStrings(): GlobalLabelStrings {
	return useMemo(
		() => ({
			"!hide": {
				name: "Content Blocked",
				description: "This content has been hidden by the moderators.",
			},
			"!warn": {
				name: "Content Warning",
				description: "This content has received a general warning from moderators.",
			},
			"!no-unauthenticated": {
				name: "Sign-in Required",
				description: "This user has requested that their content only be shown to signed-in users.",
			},
			porn: {
				name: "Adult Content",
				description: "Explicit sexual images.",
			},
			sexual: {
				name: "Sexually Suggestive",
				description: "Does not include nudity.",
			},
			nudity: {
				name: "Non-sexual Nudity",
				description: "E.g. artistic nudes.",
			},
			"graphic-media": {
				name: "Graphic Media",
				description: "Explicit or potentially disturbing media.",
			},
			gore: {
				name: "Graphic Media",
				description: "Explicit or potentially disturbing media.",
			},
		}),
		[],
	);
}
