import { useMemo } from "react";

import type { ParsedReportSubject } from "./types";

export function useCopyForSubject(subject: ParsedReportSubject) {
	return useMemo(() => {
		switch (subject.type) {
			case "account": {
				return {
					title: "Report this user",
					subtitle: "Why should this user be reviewed?",
				};
			}
			case "post": {
				return {
					title: "Report this post",
					subtitle: "Why should this post be reviewed?",
				};
			}
			case "list": {
				return {
					title: "Report this list",
					subtitle: "Why should this list be reviewed?",
				};
			}
			case "feed": {
				return {
					title: "Report this feed",
					subtitle: "Why should this feed be reviewed?",
				};
			}
			case "starterPack": {
				return {
					title: "Report this starter pack",
					subtitle: "Why should this starter pack be reviewed?",
				};
			}
			case "chatMessage": {
				return {
					title: "Report this message",
					subtitle: "Why should this message be reviewed?",
				};
			}
		}
	}, [subject]);
}
