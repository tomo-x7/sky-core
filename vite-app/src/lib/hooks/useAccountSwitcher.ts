import { useCallback, useState } from "react";
import { type SessionAccount, useSessionApi } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import * as Toast from "#/view/com/util/Toast";

export function useAccountSwitcher() {
	const [pendingDid, setPendingDid] = useState<string | null>(null);
	const { resumeSession } = useSessionApi();
	const { requestSwitchToAccount } = useLoggedOutViewControls();

	const onPressSwitchAccount = useCallback(
		async (account: SessionAccount) => {
			if (pendingDid) {
				// The session API isn't resilient to race conditions so let's just ignore this.
				return;
			}
			try {
				setPendingDid(account.did);
				if (account.accessJwt) {
					// We're switching accounts, which remounts the entire app.
					// On mobile, this gets us Home, but on the web we also need reset the URL.
					// We can't change the URL via a navigate() call because the navigator
					// itself is about to unmount, and it calls pushState() too late.
					// So we change the URL ourselves. The navigator will pick it up on remount.
					history.pushState(null, "", "/");

					await resumeSession(account);
					Toast.show(`Signed in as @${account.handle}`);
				} else {
					requestSwitchToAccount({ requestedAccount: account.did });
					Toast.show(`Please sign in as @${account.handle}`, "circle-exclamation");
				}
			} catch (e) {
				console.error("switch account: selectAccount failed", {
					//@ts-ignore
					message: e.message,
				});
				requestSwitchToAccount({ requestedAccount: account.did });
				Toast.show(`Please sign in as @${account.handle}`, "circle-exclamation");
			} finally {
				setPendingDid(null);
			}
		},
		[resumeSession, requestSwitchToAccount, pendingDid],
	);

	return { onPressSwitchAccount, pendingDid };
}
