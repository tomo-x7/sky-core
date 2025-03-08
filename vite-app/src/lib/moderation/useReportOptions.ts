import { ComAtprotoModerationDefs } from "@atproto/api";
import { useLingui } from "@lingui/react";
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
	starterpack: ReportOption[];
	feedgen: ReportOption[];
	other: ReportOption[];
	convoMessage: ReportOption[];
}

export function useReportOptions(): ReportOptions {
	const { _ } = useLingui();
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
			convoMessage: [
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
			starterpack: [
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				...common,
			],
			feedgen: [
				{
					reason: ComAtprotoModerationDefs.REASONVIOLATION,
					title: "Name or Description Violates Community Standards",
					description: "Terms used violate community standards",
				},
				...common,
			],
			other: common,
		};
	}, [_]);
}
