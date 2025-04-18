import { useEffect } from "react";
import { bskyTitle } from "#/lib/strings/headings";
import { useUnreadNotifications } from "#/state/queries/notifications/unread";

export function useSetTitle(title?: string) {
	const numUnread = useUnreadNotifications();
	useEffect(() => {
		if (title) {
			document.title = bskyTitle(title, numUnread);
		}
	}, [title, numUnread]);
}
