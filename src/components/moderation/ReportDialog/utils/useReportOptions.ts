import { ComAtprotoModerationDefs } from "@atproto/api";
import { useMemo } from "react";

export interface ReportOption {
	reason: string;
	title: string;
	description: string;
}

interface ReportOptions {
	account: ReportOption[];
	post: ReportOption[];
	list: ReportOption[];
	starterPack: ReportOption[];
	feed: ReportOption[];
	chatMessage: ReportOption[];
}

export function useReportOptions(): ReportOptions {
	return useMemo(() => {
		const other = {
			reason: ComAtprotoModerationDefs.REASONOTHER,
			title: "Other",
			description: "An issue not included in these options",
		};
		const common = [
			{
				reason: ComAtprotoModerationDefs.REASONRUDE,
				title: "Anti-Social Behavior",
				description: "Harassment, trolling, or intolerance",
			},
			{
				reason: ComAtprotoModerationDefs.REASONVIOLATION,
				title: "Illegal and Urgent",
				description: "Glaring violations of law or terms of service",
			},
			other,
		];
		return {
			account: [
				{
					reason: ComAtprotoModerationDefs.REASONMISLEADING,
					title: "Misleading Account",
					description: "Impersonation or false claims about identity or affiliation",
				},
				{
					reason: ComAtprotoModerationDefs.REASONSPAM,
					title: "Frequently Posts Unwanted Content",
					description: "Spam; excessive mentions or replies",
				},
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				other,
			],
			post: [
				{
					reason: ComAtprotoModerationDefs.REASONMISLEADING,
					title: "Misleading Post",
					description: "Impersonation, misinformation, or false claims",
				},
				{
					reason: ComAtprotoModerationDefs.REASONSPAM,
					title: "Spam",
					description: "Excessive mentions or replies",
				},
				{
					reason: ComAtprotoModerationDefs.REASONSEXUAL,
					title: "Unwanted Sexual Content",
					description: "Nudity or adult content not labeled as such",
				},
				...common,
			],
			chatMessage: [
				{
					reason: ComAtprotoModerationDefs.REASONSPAM,
					title: "Spam",
					description: "Excessive or unwanted messages",
				},
				{
					reason: ComAtprotoModerationDefs.REASONSEXUAL,
					title: "Unwanted Sexual Content",
					description: "Inappropriate messages or explicit links",
				},
				...common,
			],
			list: [
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				...common,
			],
			starterPack: [
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				...common,
			],
			feed: [
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				...common,
			],
		};
	}, []);
}
