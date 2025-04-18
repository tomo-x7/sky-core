import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RQKEY as FEED_RQKEY } from "#/state/queries/post-feed";
import * as Toast from "#/view/com/util/Toast";
import { updatePostShadow } from "../cache/post-shadow";
import { useAgent, useSession } from "../session";
import { useProfileUpdateMutation } from "./profile";

export function usePinnedPostMutation() {
	const { currentAccount } = useSession();
	const agent = useAgent();
	const queryClient = useQueryClient();
	const { mutateAsync: profileUpdateMutate } = useProfileUpdateMutation();

	return useMutation({
		mutationFn: async ({
			postUri,
			postCid,
			action,
		}: {
			postUri: string;
			postCid: string;
			action: "pin" | "unpin";
		}) => {
			const pinCurrentPost = action === "pin";
			let prevPinnedPost: string | undefined;
			try {
				updatePostShadow(queryClient, postUri, { pinned: pinCurrentPost });

				// get the currently pinned post so we can optimistically remove the pin from it
				if (!currentAccount) throw new Error("Not signed in");
				const { data: profile } = await agent.getProfile({
					actor: currentAccount.did,
				});
				prevPinnedPost = profile.pinnedPost?.uri;
				if (prevPinnedPost && prevPinnedPost !== postUri) {
					updatePostShadow(queryClient, prevPinnedPost, { pinned: false });
				}

				await profileUpdateMutate({
					profile,
					updates: (existing) => {
						existing.pinnedPost = pinCurrentPost ? { uri: postUri, cid: postCid } : undefined;
						return existing;
					},
					checkCommitted: (res) =>
						pinCurrentPost ? res.data.pinnedPost?.uri === postUri : !res.data.pinnedPost,
				});

				if (pinCurrentPost) {
					Toast.show("Post pinned");
				} else {
					Toast.show("Post unpinned");
				}

				queryClient.invalidateQueries({
					queryKey: FEED_RQKEY(`author|${currentAccount.did}|posts_and_author_threads`),
				});
				queryClient.invalidateQueries({
					queryKey: FEED_RQKEY(`author|${currentAccount.did}|posts_with_replies`),
				});
			} catch (e: any) {
				Toast.show("Failed to pin post");
				console.error("Failed to pin post", { message: String(e) });
				// revert optimistic update
				updatePostShadow(queryClient, postUri, {
					pinned: !pinCurrentPost,
				});
				if (prevPinnedPost && prevPinnedPost !== postUri) {
					updatePostShadow(queryClient, prevPinnedPost, { pinned: true });
				}
			}
		},
	});
}
