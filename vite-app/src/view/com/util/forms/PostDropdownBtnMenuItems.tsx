import {
	type AppBskyFeedDefs,
	type AppBskyFeedPost,
	type AppBskyFeedThreadgate,
	AtUri,
	type RichText as RichTextAPI,
} from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React, { memo, useCallback } from "react";
import { Platform, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { useBreakpoints } from "#/alf";
import { useDialogControl } from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { useGlobalDialogsControlContext } from "#/components/dialogs/Context";
import { EmbedDialog } from "#/components/dialogs/Embed";
import {
	PostInteractionSettingsDialog,
	usePrefetchPostInteractionSettings,
} from "#/components/dialogs/PostInteractionSettingsDialog";
import { SendViaChatDialog } from "#/components/dms/dialogs/ShareViaChatDialog";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as Share } from "#/components/icons/ArrowOutOfBox";
import { BubbleQuestion_Stroke2_Corner0_Rounded as Translate } from "#/components/icons/Bubble";
import { Clipboard_Stroke2_Corner2_Rounded as ClipboardIcon } from "#/components/icons/Clipboard";
import { CodeBrackets_Stroke2_Corner0_Rounded as CodeBrackets } from "#/components/icons/CodeBrackets";
import {
	EmojiSad_Stroke2_Corner0_Rounded as EmojiSad,
	EmojiSmile_Stroke2_Corner0_Rounded as EmojiSmile,
} from "#/components/icons/Emoji";
import { Eye_Stroke2_Corner0_Rounded as Eye } from "#/components/icons/Eye";
import { EyeSlash_Stroke2_Corner0_Rounded as EyeSlash } from "#/components/icons/EyeSlash";
import { Filter_Stroke2_Corner0_Rounded as Filter } from "#/components/icons/Filter";
import { Mute_Stroke2_Corner0_Rounded as MuteIcon } from "#/components/icons/Mute";
import { Mute_Stroke2_Corner0_Rounded as Mute } from "#/components/icons/Mute";
import { PaperPlane_Stroke2_Corner0_Rounded as Send } from "#/components/icons/PaperPlane";
import { PersonX_Stroke2_Corner0_Rounded as PersonX } from "#/components/icons/Person";
import { Pin_Stroke2_Corner0_Rounded as PinIcon } from "#/components/icons/Pin";
import { SettingsGear2_Stroke2_Corner0_Rounded as Gear } from "#/components/icons/SettingsGear2";
import { SpeakerVolumeFull_Stroke2_Corner0_Rounded as UnmuteIcon } from "#/components/icons/Speaker";
import { SpeakerVolumeFull_Stroke2_Corner0_Rounded as Unmute } from "#/components/icons/Speaker";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { Warning_Stroke2_Corner0_Rounded as Warning } from "#/components/icons/Warning";
import { ReportDialog, useReportDialogControl } from "#/components/moderation/ReportDialog";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { getCurrentRoute } from "#/lib/routes/helpers";
import { makeProfileLink } from "#/lib/routes/links";
import type { CommonNavigatorParams, NavigationProp } from "#/lib/routes/types";
import { shareText, shareUrl } from "#/lib/sharing";
import { richTextToString } from "#/lib/strings/rich-text-helpers";
import { toShareUrl } from "#/lib/strings/url-helpers";
import { getTranslatorLink } from "#/locale/helpers";
import { isWeb } from "#/platform/detection";
import type { Shadow } from "#/state/cache/post-shadow";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useFeedFeedbackContext } from "#/state/feed-feedback";
import { useLanguagePrefs } from "#/state/preferences";
import { useHiddenPosts, useHiddenPostsApi } from "#/state/preferences";
import { useDevModeEnabled } from "#/state/preferences/dev-mode";
import { usePinnedPostMutation } from "#/state/queries/pinned-post";
import { usePostDeleteMutation, useThreadMuteMutationQueue } from "#/state/queries/post";
import { useToggleQuoteDetachmentMutation } from "#/state/queries/postgate";
import { getMaybeDetachedQuoteEmbed } from "#/state/queries/postgate/util";
import { useProfileBlockMutationQueue, useProfileMuteMutationQueue } from "#/state/queries/profile";
import { useToggleReplyVisibilityMutation } from "#/state/queries/threadgate";
import { useSession } from "#/state/session";
import { useMergedThreadgateHiddenReplies } from "#/state/threadgate-hidden-replies";
import * as Toast from "../Toast";

let PostDropdownMenuItems = ({
	post,
	postFeedContext,
	record,
	richText,
	timestamp,
	threadgateRecord,
}: {
	testID: string;
	post: Shadow<AppBskyFeedDefs.PostView>;
	postFeedContext: string | undefined;
	record: AppBskyFeedPost.Record;
	richText: RichTextAPI;
	style?: StyleProp<ViewStyle>;
	hitSlop?: PressableProps["hitSlop"];
	size?: "lg" | "md" | "sm";
	timestamp: string;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}): React.ReactNode => {
	const { hasSession, currentAccount } = useSession();
	const { gtMobile } = useBreakpoints();
	const langPrefs = useLanguagePrefs();
	const { mutateAsync: deletePostMutate } = usePostDeleteMutation();
	const { mutateAsync: pinPostMutate, isPending: isPinPending } = usePinnedPostMutation();
	const hiddenPosts = useHiddenPosts();
	const { hidePost } = useHiddenPostsApi();
	const feedFeedback = useFeedFeedbackContext();
	const openLink = useOpenLink();
	const navigation = useNavigation<NavigationProp>();
	const { mutedWordsDialogControl } = useGlobalDialogsControlContext();
	const blockPromptControl = useDialogControl();
	const reportDialogControl = useReportDialogControl();
	const deletePromptControl = useDialogControl();
	const hidePromptControl = useDialogControl();
	const loggedOutWarningPromptControl = useDialogControl();
	const embedPostControl = useDialogControl();
	const sendViaChatControl = useDialogControl();
	const postInteractionSettingsDialogControl = useDialogControl();
	const quotePostDetachConfirmControl = useDialogControl();
	const hideReplyConfirmControl = useDialogControl();
	const { mutateAsync: toggleReplyVisibility } = useToggleReplyVisibilityMutation();
	const [devModeEnabled] = useDevModeEnabled();

	const postUri = post.uri;
	const postCid = post.cid;
	const postAuthor = useProfileShadow(post.author);
	const quoteEmbed = React.useMemo(() => {
		if (!currentAccount || !post.embed) return;
		return getMaybeDetachedQuoteEmbed({
			viewerDid: currentAccount.did,
			post,
		});
	}, [post, currentAccount]);

	const rootUri = record.reply?.root?.uri || postUri;
	const isReply = Boolean(record.reply);
	const [isThreadMuted, muteThread, unmuteThread] = useThreadMuteMutationQueue(post, rootUri);
	const isPostHidden = hiddenPosts?.includes(postUri);
	const isAuthor = postAuthor.did === currentAccount?.did;
	const isRootPostAuthor = new AtUri(rootUri).host === currentAccount?.did;
	const threadgateHiddenReplies = useMergedThreadgateHiddenReplies({
		threadgateRecord,
	});
	const isReplyHiddenByThreadgate = threadgateHiddenReplies.has(postUri);
	const isPinned = post.viewer?.pinned;

	const { mutateAsync: toggleQuoteDetachment, isPending: isDetachPending } = useToggleQuoteDetachmentMutation();

	const [queueBlock] = useProfileBlockMutationQueue(postAuthor);
	const [queueMute, queueUnmute] = useProfileMuteMutationQueue(postAuthor);

	const prefetchPostInteractionSettings = usePrefetchPostInteractionSettings({
		postUri: post.uri,
		rootPostUri: rootUri,
	});

	const href = React.useMemo(() => {
		const urip = new AtUri(postUri);
		return makeProfileLink(postAuthor, "post", urip.rkey);
	}, [postUri, postAuthor]);

	const translatorUrl = getTranslatorLink(record.text, langPrefs.primaryLanguage);

	const onDeletePost = React.useCallback(() => {
		deletePostMutate({ uri: postUri }).then(
			() => {
				Toast.show("Post deleted");

				const route = getCurrentRoute(navigation.getState());
				if (route.name === "PostThread") {
					const params = route.params as CommonNavigatorParams["PostThread"];
					if (
						currentAccount &&
						isAuthor &&
						(params.name === currentAccount.handle || params.name === currentAccount.did)
					) {
						const currentHref = makeProfileLink(postAuthor, "post", params.rkey);
						if (currentHref === href && navigation.canGoBack()) {
							navigation.goBack();
						}
					}
				}
			},
			(e) => {
				console.error("Failed to delete post", { message: e });
				Toast.show("Failed to delete post, please try again", "xmark");
			},
		);
	}, [navigation, postUri, deletePostMutate, postAuthor, currentAccount, isAuthor, href]);

	const onToggleThreadMute = React.useCallback(() => {
		try {
			if (isThreadMuted) {
				unmuteThread();
				Toast.show("You will now receive notifications for this thread");
			} else {
				muteThread();
				Toast.show("You will no longer receive notifications for this thread");
			}
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				console.error("Failed to toggle thread mute", { message: e });
				Toast.show("Failed to toggle thread mute, please try again", "xmark");
			}
		}
	}, [isThreadMuted, unmuteThread, muteThread]);

	const onCopyPostText = React.useCallback(() => {
		const str = richTextToString(richText, true);
		new Clipboard().writeText(str);
		Toast.show("Copied to clipboard", "clipboard-check");
	}, [richText]);

	const onPressTranslate = React.useCallback(async () => {
		await openLink(translatorUrl, true);
	}, [openLink, translatorUrl]);

	const onHidePost = React.useCallback(() => {
		hidePost({ uri: postUri });
	}, [postUri, hidePost]);

	const hideInPWI = React.useMemo(() => {
		return !!postAuthor.labels?.find((label) => label.val === "!no-unauthenticated");
	}, [postAuthor]);

	const showLoggedOutWarning = postAuthor.did !== currentAccount?.did && hideInPWI;

	const onSharePost = React.useCallback(() => {
		const url = toShareUrl(href);
		shareUrl(url);
	}, [href]);

	const onPressShowMore = React.useCallback(() => {
		feedFeedback.sendInteraction({
			event: "app.bsky.feed.defs#requestMore",
			item: postUri,
			feedContext: postFeedContext,
		});
		Toast.show("Feedback sent!");
	}, [feedFeedback, postUri, postFeedContext]);

	const onPressShowLess = React.useCallback(() => {
		feedFeedback.sendInteraction({
			event: "app.bsky.feed.defs#requestLess",
			item: postUri,
			feedContext: postFeedContext,
		});
		Toast.show("Feedback sent!");
	}, [feedFeedback, postUri, postFeedContext]);

	const onSelectChatToShareTo = React.useCallback(
		(conversation: string) => {
			navigation.navigate("MessagesConversation", {
				conversation,
				embed: postUri,
			});
		},
		[navigation, postUri],
	);

	const onToggleQuotePostAttachment = React.useCallback(async () => {
		if (!quoteEmbed) return;

		const action = quoteEmbed.isDetached ? "reattach" : "detach";
		const isDetach = action === "detach";

		try {
			await toggleQuoteDetachment({
				post,
				quoteUri: quoteEmbed.uri,
				action: quoteEmbed.isDetached ? "reattach" : "detach",
			});
			Toast.show(isDetach ? "Quote post was successfully detached" : "Quote post was re-attached");
		} catch (e: any) {
			Toast.show("Updating quote attachment failed");
			console.error(`Failed to ${action} quote`, { safeMessage: e.message });
		}
	}, [quoteEmbed, post, toggleQuoteDetachment]);

	const canHidePostForMe = !isAuthor && !isPostHidden;
	const canEmbed = isWeb && gtMobile && !hideInPWI;
	const canHideReplyForEveryone = !isAuthor && isRootPostAuthor && !isPostHidden && isReply;
	const canDetachQuote = quoteEmbed?.isOwnedByViewer;

	const onToggleReplyVisibility = React.useCallback(async () => {
		// TODO no threadgate?
		if (!canHideReplyForEveryone) return;

		const action = isReplyHiddenByThreadgate ? "show" : "hide";
		const isHide = action === "hide";

		try {
			await toggleReplyVisibility({
				postUri: rootUri,
				replyUri: postUri,
				action,
			});
			Toast.show(isHide ? "Reply was successfully hidden" : "Reply visibility updated");
		} catch (e: any) {
			Toast.show("Updating reply visibility failed");
			console.error(`Failed to ${action} reply`, { safeMessage: e.message });
		}
	}, [isReplyHiddenByThreadgate, rootUri, postUri, canHideReplyForEveryone, toggleReplyVisibility]);

	const onPressPin = useCallback(() => {
		pinPostMutate({
			postUri,
			postCid,
			action: isPinned ? "unpin" : "pin",
		});
	}, [isPinned, pinPostMutate, postCid, postUri]);

	const onBlockAuthor = useCallback(async () => {
		try {
			await queueBlock();
			Toast.show("Account blocked");
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				console.error("Failed to block account", { message: e });
				Toast.show(`There was an issue! ${e.toString()}`, "xmark");
			}
		}
	}, [queueBlock]);

	const onMuteAuthor = useCallback(async () => {
		if (postAuthor.viewer?.muted) {
			try {
				await queueUnmute();
				Toast.show("Account unmuted");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to unmute account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		} else {
			try {
				await queueMute();
				Toast.show("Account muted");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to mute account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		}
	}, [queueMute, queueUnmute, postAuthor.viewer?.muted]);

	const onShareATURI = useCallback(() => {
		shareText(postUri);
	}, [postUri]);

	const onShareAuthorDID = useCallback(() => {
		shareText(postAuthor.did);
	}, [postAuthor.did]);

	return (
		<>
			<Menu.Outer>
				{isAuthor && (
					<>
						<Menu.Group>
							<Menu.Item
								testID="pinPostBtn"
								label={isPinned ? "Unpin from profile" : "Pin to your profile"}
								disabled={isPinPending}
								onPress={onPressPin}
							>
								<Menu.ItemText>{isPinned ? "Unpin from profile" : "Pin to your profile"}</Menu.ItemText>
								<Menu.ItemIcon icon={isPinPending ? Loader : PinIcon} position="right" />
							</Menu.Item>
						</Menu.Group>
						<Menu.Divider />
					</>
				)}

				<Menu.Group>
					{(!hideInPWI || hasSession) && (
						<>
							<Menu.Item testID="postDropdownTranslateBtn" label={"Translate"} onPress={onPressTranslate}>
								<Menu.ItemText>{"Translate"}</Menu.ItemText>
								<Menu.ItemIcon icon={Translate} position="right" />
							</Menu.Item>

							<Menu.Item
								testID="postDropdownCopyTextBtn"
								label={"Copy post text"}
								onPress={onCopyPostText}
							>
								<Menu.ItemText>{"Copy post text"}</Menu.ItemText>
								<Menu.ItemIcon icon={ClipboardIcon} position="right" />
							</Menu.Item>
						</>
					)}

					{hasSession && (
						<Menu.Item
							testID="postDropdownSendViaDMBtn"
							label={"Send via direct message"}
							onPress={() => sendViaChatControl.open()}
						>
							<Menu.ItemText>Send via direct message</Menu.ItemText>
							<Menu.ItemIcon icon={Send} position="right" />
						</Menu.Item>
					)}

					<Menu.Item
						testID="postDropdownShareBtn"
						label={isWeb ? "Copy link to post" : "Share"}
						onPress={() => {
							if (showLoggedOutWarning) {
								loggedOutWarningPromptControl.open();
							} else {
								onSharePost();
							}
						}}
					>
						<Menu.ItemText>{isWeb ? "Copy link to post" : "Share"}</Menu.ItemText>
						<Menu.ItemIcon icon={Share} position="right" />
					</Menu.Item>

					{canEmbed && (
						<Menu.Item
							testID="postDropdownEmbedBtn"
							label={"Embed post"}
							onPress={() => embedPostControl.open()}
						>
							<Menu.ItemText>{"Embed post"}</Menu.ItemText>
							<Menu.ItemIcon icon={CodeBrackets} position="right" />
						</Menu.Item>
					)}
				</Menu.Group>

				{hasSession && feedFeedback.enabled && (
					<>
						<Menu.Divider />
						<Menu.Group>
							<Menu.Item
								testID="postDropdownShowMoreBtn"
								label={"Show more like this"}
								onPress={onPressShowMore}
							>
								<Menu.ItemText>{"Show more like this"}</Menu.ItemText>
								<Menu.ItemIcon icon={EmojiSmile} position="right" />
							</Menu.Item>

							<Menu.Item
								testID="postDropdownShowLessBtn"
								label={"Show less like this"}
								onPress={onPressShowLess}
							>
								<Menu.ItemText>{"Show less like this"}</Menu.ItemText>
								<Menu.ItemIcon icon={EmojiSad} position="right" />
							</Menu.Item>
						</Menu.Group>
					</>
				)}

				{hasSession && (
					<>
						<Menu.Divider />
						<Menu.Group>
							<Menu.Item
								testID="postDropdownMuteThreadBtn"
								label={isThreadMuted ? "Unmute thread" : "Mute thread"}
								onPress={onToggleThreadMute}
							>
								<Menu.ItemText>{isThreadMuted ? "Unmute thread" : "Mute thread"}</Menu.ItemText>
								<Menu.ItemIcon icon={isThreadMuted ? Unmute : Mute} position="right" />
							</Menu.Item>

							<Menu.Item
								testID="postDropdownMuteWordsBtn"
								label={"Mute words & tags"}
								onPress={() => mutedWordsDialogControl.open()}
							>
								<Menu.ItemText>{"Mute words & tags"}</Menu.ItemText>
								<Menu.ItemIcon icon={Filter} position="right" />
							</Menu.Item>
						</Menu.Group>
					</>
				)}

				{hasSession && (canHideReplyForEveryone || canDetachQuote || canHidePostForMe) && (
					<>
						<Menu.Divider />
						<Menu.Group>
							{canHidePostForMe && (
								<Menu.Item
									testID="postDropdownHideBtn"
									label={isReply ? "Hide reply for me" : "Hide post for me"}
									onPress={() => hidePromptControl.open()}
								>
									<Menu.ItemText>{isReply ? "Hide reply for me" : "Hide post for me"}</Menu.ItemText>
									<Menu.ItemIcon icon={EyeSlash} position="right" />
								</Menu.Item>
							)}
							{canHideReplyForEveryone && (
								<Menu.Item
									testID="postDropdownHideBtn"
									label={
										isReplyHiddenByThreadgate
											? "Show reply for everyone"
											: "Hide reply for everyone"
									}
									onPress={
										isReplyHiddenByThreadgate
											? onToggleReplyVisibility
											: () => hideReplyConfirmControl.open()
									}
								>
									<Menu.ItemText>
										{isReplyHiddenByThreadgate
											? "Show reply for everyone"
											: "Hide reply for everyone"}
									</Menu.ItemText>
									<Menu.ItemIcon icon={isReplyHiddenByThreadgate ? Eye : EyeSlash} position="right" />
								</Menu.Item>
							)}

							{canDetachQuote && (
								<Menu.Item
									disabled={isDetachPending}
									testID="postDropdownHideBtn"
									label={quoteEmbed.isDetached ? "Re-attach quote" : "Detach quote"}
									onPress={
										quoteEmbed.isDetached
											? onToggleQuotePostAttachment
											: () => quotePostDetachConfirmControl.open()
									}
								>
									<Menu.ItemText>
										{quoteEmbed.isDetached ? "Re-attach quote" : "Detach quote"}
									</Menu.ItemText>
									<Menu.ItemIcon
										icon={isDetachPending ? Loader : quoteEmbed.isDetached ? Eye : EyeSlash}
										position="right"
									/>
								</Menu.Item>
							)}
						</Menu.Group>
					</>
				)}

				{hasSession && (
					<>
						<Menu.Divider />
						<Menu.Group>
							{!isAuthor && (
								<>
									<Menu.Item
										testID="postDropdownMuteBtn"
										label={postAuthor.viewer?.muted ? "Unmute account" : "Mute account"}
										onPress={onMuteAuthor}
									>
										<Menu.ItemText>
											{postAuthor.viewer?.muted ? "Unmute account" : "Mute account"}
										</Menu.ItemText>
										<Menu.ItemIcon
											icon={postAuthor.viewer?.muted ? UnmuteIcon : MuteIcon}
											position="right"
										/>
									</Menu.Item>

									{!postAuthor.viewer?.blocking && (
										<Menu.Item
											testID="postDropdownBlockBtn"
											label={"Block account"}
											onPress={() => blockPromptControl.open()}
										>
											<Menu.ItemText>{"Block account"}</Menu.ItemText>
											<Menu.ItemIcon icon={PersonX} position="right" />
										</Menu.Item>
									)}

									<Menu.Item
										testID="postDropdownReportBtn"
										label={"Report post"}
										onPress={() => reportDialogControl.open()}
									>
										<Menu.ItemText>{"Report post"}</Menu.ItemText>
										<Menu.ItemIcon icon={Warning} position="right" />
									</Menu.Item>
								</>
							)}

							{isAuthor && (
								<>
									<Menu.Item
										testID="postDropdownEditPostInteractions"
										label={"Edit interaction settings"}
										onPress={() => postInteractionSettingsDialogControl.open()}
										{...(isAuthor
											? Platform.select({
													web: {
														onHoverIn: prefetchPostInteractionSettings,
													},
													native: {
														onPressIn: prefetchPostInteractionSettings,
													},
												})
											: {})}
									>
										<Menu.ItemText>{"Edit interaction settings"}</Menu.ItemText>
										<Menu.ItemIcon icon={Gear} position="right" />
									</Menu.Item>
									<Menu.Item
										testID="postDropdownDeleteBtn"
										label={"Delete post"}
										onPress={() => deletePromptControl.open()}
									>
										<Menu.ItemText>{"Delete post"}</Menu.ItemText>
										<Menu.ItemIcon icon={Trash} position="right" />
									</Menu.Item>
								</>
							)}
						</Menu.Group>

						{devModeEnabled ? (
							<>
								<Menu.Divider />
								<Menu.Group>
									<Menu.Item
										testID="postAtUriShareBtn"
										label={"Copy post at:// URI"}
										onPress={onShareATURI}
									>
										<Menu.ItemText>{"Copy post at:// URI"}</Menu.ItemText>
										<Menu.ItemIcon icon={Share} position="right" />
									</Menu.Item>
									<Menu.Item
										testID="postAuthorDIDShareBtn"
										label={"Copy author DID"}
										onPress={onShareAuthorDID}
									>
										<Menu.ItemText>{"Copy author DID"}</Menu.ItemText>
										<Menu.ItemIcon icon={Share} position="right" />
									</Menu.Item>
								</Menu.Group>
							</>
						) : null}
					</>
				)}
			</Menu.Outer>

			<Prompt.Basic
				control={deletePromptControl}
				title={"Delete this post?"}
				description={`If you remove this post, you won't be able to recover it.`}
				onConfirm={onDeletePost}
				confirmButtonCta={"Delete"}
				confirmButtonColor="negative"
			/>

			<Prompt.Basic
				control={hidePromptControl}
				title={isReply ? "Hide this reply?" : "Hide this post?"}
				description={"This post will be hidden from feeds and threads. This cannot be undone."}
				onConfirm={onHidePost}
				confirmButtonCta={"Hide"}
			/>

			<ReportDialog
				control={reportDialogControl}
				subject={{
					...post,
					$type: "app.bsky.feed.defs#postView",
				}}
			/>

			<Prompt.Basic
				control={loggedOutWarningPromptControl}
				title={"Note about sharing"}
				description={`This post is only visible to logged-in users. It won't be visible to people who aren't signed in.`}
				onConfirm={onSharePost}
				confirmButtonCta={"Share anyway"}
			/>

			{canEmbed && (
				<EmbedDialog
					control={embedPostControl}
					postCid={postCid}
					postUri={postUri}
					record={record}
					postAuthor={postAuthor}
					timestamp={timestamp}
				/>
			)}

			<SendViaChatDialog control={sendViaChatControl} onSelectChat={onSelectChatToShareTo} />

			<PostInteractionSettingsDialog
				control={postInteractionSettingsDialogControl}
				postUri={post.uri}
				rootPostUri={rootUri}
				initialThreadgateView={post.threadgate}
			/>

			<Prompt.Basic
				control={quotePostDetachConfirmControl}
				title={"Detach quote post?"}
				description={
					"This will remove your post from this quote post for all users, and replace it with a placeholder."
				}
				onConfirm={onToggleQuotePostAttachment}
				confirmButtonCta={"Yes, detach"}
			/>

			<Prompt.Basic
				control={hideReplyConfirmControl}
				title={"Hide this reply?"}
				description={
					"This reply will be sorted into a hidden section at the bottom of your thread and will mute notifications for subsequent replies - both for yourself and others."
				}
				onConfirm={onToggleReplyVisibility}
				confirmButtonCta={"Yes, hide"}
			/>

			<Prompt.Basic
				control={blockPromptControl}
				title={"Block Account?"}
				description={
					"Blocked accounts cannot reply in your threads, mention you, or otherwise interact with you."
				}
				onConfirm={onBlockAuthor}
				confirmButtonCta={"Block"}
				confirmButtonColor="negative"
			/>
		</>
	);
};
PostDropdownMenuItems = memo(PostDropdownMenuItems);
export { PostDropdownMenuItems };
