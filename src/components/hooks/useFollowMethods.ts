import React from "react";

import type { Shadow } from "#/state/cache/types";
import { useProfileFollowMutationQueue } from "#/state/queries/profile";
import { useRequireAuth } from "#/state/session";
import type * as bsky from "#/types/bsky";
import * as Toast from "#/view/com/util/Toast";

export function useFollowMethods({
	profile,
}: {
	profile: Shadow<bsky.profile.AnyProfileView>;
}) {
	const requireAuth = useRequireAuth();
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile);

	const follow = React.useCallback(() => {
		requireAuth(async () => {
			try {
				await queueFollow();
			} catch (e: unknown) {
				console.error("useFollowMethods: failed to follow", { message: String(e) });
				if ((e as { name: unknown }).name !== "AbortError") {
					Toast.show("An issue occurred, please try again.", "xmark");
				}
			}
		});
	}, [queueFollow, requireAuth]);

	const unfollow = React.useCallback(() => {
		requireAuth(async () => {
			try {
				await queueUnfollow();
			} catch (e: unknown) {
				console.error("useFollowMethods: failed to unfollow", {
					message: String(e),
				});
				if ((e as { name: unknown })?.name !== "AbortError") {
					Toast.show("An issue occurred, please try again.", "xmark");
				}
			}
		});
	}, [queueUnfollow, requireAuth]);

	return {
		follow,
		unfollow,
	};
}
