import { AppBskyFeedDefs, type AppBskyFeedGetPostThread, type BskyAgent, type RichText } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from "react";

import { useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { ProgressCircle } from "#/components/Progress";
import * as Prompt from "#/components/Prompt";
import { Text as NewText } from "#/components/Typography";
import { Text } from "#/components/Typography";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { EmojiArc_Stroke2_Corner0_Rounded as EmojiSmile } from "#/components/icons/Emoji";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { Keyboard } from "#/lib/Keyboard";
import * as apilib from "#/lib/api/index";
import { EmbeddingDisabledError } from "#/lib/api/resolve";
import { until } from "#/lib/async/until";
import { MAX_GRAPHEME_LENGTH, SUPPORTED_MIME_TYPES, type SupportedMimeTypes } from "#/lib/constants";
import { useEmail } from "#/lib/hooks/useEmail";
import { useNonReactiveCallback } from "#/lib/hooks/useNonReactiveCallback";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { mimeToExt } from "#/lib/media/video/util";
import { cleanError } from "#/lib/strings/errors";
import { colors, s } from "#/lib/styles";
import { useSharedValue } from "#/state/SharedValue";
import { useDialogStateControlContext } from "#/state/dialogs";
import { emitPostCreated } from "#/state/events";
import { type ComposerImage, pasteImage } from "#/state/gallery";
import { useModalControls } from "#/state/modals";
import { useRequireAltTextEnabled } from "#/state/preferences";
import { toPostLanguages, useLanguagePrefs, useLanguagePrefsApi } from "#/state/preferences/languages";
import { usePreferencesQuery } from "#/state/queries/preferences";
import { useProfileQuery } from "#/state/queries/profile";
import type { Gif } from "#/state/queries/tenor";
import { useAgent, useSession } from "#/state/session";
import { useComposerControls } from "#/state/shell/composer";
import type { ComposerOpts } from "#/state/shell/composer";
import type { ImagePickerAsset } from "#/temp";
import { ComposerReplyTo } from "#/view/com/composer/ComposerReplyTo";
import { ExternalEmbedGif, ExternalEmbedLink } from "#/view/com/composer/ExternalEmbed";
import { GifAltTextDialog } from "#/view/com/composer/GifAltText";
import { CharProgress } from "#/view/com/composer/char-progress/CharProgress";
import { LabelsBtn } from "#/view/com/composer/labels/LabelsBtn";
import { Gallery } from "#/view/com/composer/photos/Gallery";
import { SelectGifBtn } from "#/view/com/composer/photos/SelectGifBtn";
import { SelectPhotoBtn } from "#/view/com/composer/photos/SelectPhotoBtn";
import { SelectLangBtn } from "#/view/com/composer/select-language/SelectLangBtn";
import { SuggestedLanguage } from "#/view/com/composer/select-language/SuggestedLanguage";
// TODO: Prevent naming components that coincide with RN primitives
// due to linting false positives
import { TextInput, type TextInputRef } from "#/view/com/composer/text-input/TextInput";
import { ThreadgateBtn } from "#/view/com/composer/threadgate/ThreadgateBtn";
import { SelectVideoBtn } from "#/view/com/composer/videos/SelectVideoBtn";
import { SubtitleDialogBtn } from "#/view/com/composer/videos/SubtitleDialog";
import { VideoPreview } from "#/view/com/composer/videos/VideoPreview";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { LazyQuoteEmbed, QuoteX } from "#/view/com/util/post-embeds/QuoteEmbed";
import {
	type ComposerAction,
	type EmbedDraft,
	MAX_IMAGES,
	type PostAction,
	type PostDraft,
	type ThreadDraft,
	composerReducer,
	createComposerState,
} from "./state/composer";
import { NO_VIDEO, type NoVideoState, type VideoState, processVideo } from "./state/video";
import { getVideoMetadata } from "./videos/pickVideo";

type CancelRef = {
	onPressCancel: () => void;
};

type Props = ComposerOpts;
export const ComposePost = ({
	replyTo,
	onPost,
	quote: initQuote,
	mention: initMention,
	openEmojiPicker,
	text: initText,
	imageUris: initImageUris,
	videoUri: initVideoUri,
	cancelRef,
}: Props & {
	cancelRef?: React.RefObject<CancelRef | null>;
}) => {
	const { currentAccount } = useSession();
	const agent = useAgent();
	const queryClient = useQueryClient();
	const currentDid = currentAccount!.did;
	const { closeComposer } = useComposerControls();
	const requireAltTextEnabled = useRequireAltTextEnabled();
	const langPrefs = useLanguagePrefs();
	const setLangPrefs = useLanguagePrefsApi();
	const textInput = useRef<TextInputRef>(null);
	const discardPromptControl = Prompt.usePromptControl();
	const { closeAllDialogs } = useDialogStateControlContext();
	const { closeAllModals } = useModalControls();
	const { data: preferences } = usePreferencesQuery();

	const [isPublishing, setIsPublishing] = useState(false);
	const [publishingStage, setPublishingStage] = useState("");
	const [error, setError] = useState("");

	const [composerState, composerDispatch] = useReducer(
		composerReducer,
		{
			initImageUris,
			initQuoteUri: initQuote?.uri,
			initText,
			initMention,
			initInteractionSettings: preferences?.postInteractionSettings,
		},
		createComposerState,
	);

	const thread = composerState.thread;
	const activePost = thread.posts[composerState.activePostIndex];
	const nextPost: PostDraft | undefined = thread.posts[composerState.activePostIndex + 1];
	const dispatch = useCallback(
		(postAction: PostAction) => {
			composerDispatch({
				type: "update_post",
				postId: activePost.id,
				postAction,
			});
		},
		[activePost.id],
	);

	const selectVideo = React.useCallback(
		(postId: string, asset: ImagePickerAsset) => {
			const abortController = new AbortController();
			composerDispatch({
				type: "update_post",
				postId: postId,
				postAction: {
					type: "embed_add_video",
					asset,
					abortController,
				},
			});
			processVideo(
				asset,
				(videoAction) => {
					composerDispatch({
						type: "update_post",
						postId: postId,
						postAction: {
							type: "embed_update_video",
							videoAction,
						},
					});
				},
				agent,
				currentDid,
				abortController.signal,
			);
		},
		[agent, currentDid],
	);

	const onInitVideo = useNonReactiveCallback(() => {
		if (initVideoUri) {
			selectVideo(activePost.id, initVideoUri);
		}
	});

	useEffect(() => {
		onInitVideo();
	}, [onInitVideo]);

	const clearVideo = React.useCallback((postId: string) => {
		composerDispatch({
			type: "update_post",
			postId: postId,
			postAction: {
				type: "embed_remove_video",
			},
		});
	}, []);

	const [publishOnUpload, setPublishOnUpload] = useState(false);

	const onClose = useCallback(() => {
		closeComposer();
	}, [closeComposer]);

	const viewStyles = useMemo(
		() => ({
			paddingTop: 0,
			paddingBottom: 0,
		}),
		[],
	);

	const onPressCancel = useCallback(() => {
		if (thread.posts.some((post) => post.shortenedGraphemeLength > 0 || post.embed.media || post.embed.link)) {
			closeAllDialogs();
			Keyboard.dismiss();
			discardPromptControl.open();
		} else {
			onClose();
		}
	}, [thread, closeAllDialogs, discardPromptControl, onClose]);

	useImperativeHandle(cancelRef, () => ({ onPressCancel }));

	const { needsEmailVerification } = useEmail();
	const emailVerificationControl = useDialogControl();

	useEffect(() => {
		if (needsEmailVerification) {
			emailVerificationControl.open();
		}
	}, [needsEmailVerification, emailVerificationControl]);

	const missingAltError = useMemo(() => {
		if (!requireAltTextEnabled) {
			return;
		}
		for (let i = 0; i < thread.posts.length; i++) {
			const media = thread.posts[i].embed.media;
			if (media) {
				if (media.type === "images" && media.images.some((img) => !img.alt)) {
					return "One or more images is missing alt text.";
				}
				if (media.type === "gif" && !media.alt) {
					return "One or more GIFs is missing alt text.";
				}
				if (media.type === "video" && media.video.status !== "error" && !media.video.altText) {
					return "One or more videos is missing alt text.";
				}
			}
		}
	}, [thread, requireAltTextEnabled]);

	const canPost =
		!missingAltError &&
		thread.posts.every(
			(post) =>
				post.shortenedGraphemeLength <= MAX_GRAPHEME_LENGTH &&
				!isEmptyPost(post) &&
				!(post.embed.media?.type === "video" && post.embed.media.video.status === "error"),
		);

	const onPressPublish = React.useCallback(async () => {
		if (isPublishing) {
			return;
		}

		if (!canPost) {
			return;
		}

		if (
			thread.posts.some(
				(post) =>
					post.embed.media?.type === "video" &&
					post.embed.media.video.asset &&
					post.embed.media.video.status !== "done",
			)
		) {
			setPublishOnUpload(true);
			return;
		}

		setError("");
		setIsPublishing(true);

		let postUri;
		try {
			postUri = (
				await apilib.post(agent, queryClient, {
					thread,
					replyTo: replyTo?.uri,
					onStateChange: setPublishingStage,
					langs: toPostLanguages(langPrefs.postLanguage),
				})
			).uris[0];
			try {
				await whenAppViewReady(agent, postUri, (res) => {
					const postedThread = res.data.thread;
					return AppBskyFeedDefs.isThreadViewPost(postedThread);
				});
			} catch (waitErr: any) {
				console.error(waitErr, {
					message: "Waiting for app view failed",
				});
				// Keep going because the post *was* published.
			}
		} catch (e: any) {
			console.error(e, {
				message: "Composer: create post failed",
				hasImages: thread.posts.some((p) => p.embed.media?.type === "images"),
			});

			let err = cleanError(e.message);
			if (err.includes("not locate record")) {
				err = `We're sorry! The post you are replying to has been deleted.`;
			} else if (e instanceof EmbeddingDisabledError) {
				err = `This post's author has disabled quote posts.`;
			}
			setError(err);
			setIsPublishing(false);
			return;
		}
		if (postUri && !replyTo) {
			emitPostCreated();
		}
		setLangPrefs.savePostLanguageToHistory();
		if (initQuote) {
			// We want to wait for the quote count to update before we call `onPost`, which will refetch data
			whenAppViewReady(agent, initQuote.uri, (res) => {
				const quotedThread = res.data.thread;
				if (
					AppBskyFeedDefs.isThreadViewPost(quotedThread) &&
					quotedThread.post.quoteCount !== initQuote.quoteCount
				) {
					onPost?.(postUri);
					return true;
				}
				return false;
			});
		} else {
			onPost?.(postUri);
		}
		onClose();
		Toast.show(
			thread.posts.length > 1
				? "Your posts have been published"
				: replyTo
					? "Your reply has been published"
					: "Your post has been published",
		);
	}, [
		agent,
		thread,
		canPost,
		isPublishing,
		langPrefs.postLanguage,
		onClose,
		onPost,
		initQuote,
		replyTo,
		setLangPrefs,
		queryClient,
	]);

	// Preserves the referential identity passed to each post item.
	// Avoids re-rendering all posts on each keystroke.
	const onComposerPostPublish = useNonReactiveCallback(() => {
		onPressPublish();
	});

	React.useEffect(() => {
		if (publishOnUpload) {
			let erroredVideos = 0;
			let uploadingVideos = 0;
			for (const post of thread.posts) {
				if (post.embed.media?.type === "video") {
					const video = post.embed.media.video;
					if (video.status === "error") {
						erroredVideos++;
					} else if (video.status !== "done") {
						uploadingVideos++;
					}
				}
			}
			if (erroredVideos > 0) {
				setPublishOnUpload(false);
			} else if (uploadingVideos === 0) {
				setPublishOnUpload(false);
				onPressPublish();
			}
		}
	}, [thread.posts, onPressPublish, publishOnUpload]);

	// TODO: It might make more sense to display this error per-post.
	// Right now we're just displaying the first one.
	let erroredVideoPostId: string | undefined;
	let erroredVideo: VideoState | NoVideoState = NO_VIDEO;
	for (let i = 0; i < thread.posts.length; i++) {
		const post = thread.posts[i];
		if (post.embed.media?.type === "video" && post.embed.media.video.status === "error") {
			erroredVideoPostId = post.id;
			erroredVideo = post.embed.media.video;
			break;
		}
	}

	const onEmojiButtonPress = useCallback(() => {
		const rect = textInput.current?.getCursorPosition();
		if (rect) {
			openEmojiPicker?.({
				...rect,
				nextFocusRef: textInput as unknown as React.MutableRefObject<HTMLElement>,
			});
		}
	}, [openEmojiPicker]);

	const scrollViewRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (composerState.mutableNeedsFocusActive) {
			composerState.mutableNeedsFocusActive = false;
			textInput.current?.focus();
		}
	}, [composerState]);

	const isLastThreadedPost = thread.posts.length > 1 && nextPost === undefined;
	const {
		// scrollHandler,
		onScrollViewContentSizeChange,
		onScrollViewLayout,
		topBarAnimatedStyle,
		bottomBarAnimatedStyle,
	} = useScrollTracker({
		scrollViewRef,
		stickyBottom: isLastThreadedPost,
	});
	useOnLayout(onScrollViewLayout, scrollViewRef);
	const keyboardVerticalOffset = useKeyboardVerticalOffset();

	const footer = (
		<>
			<SuggestedLanguage text={activePost.richtext.text} />
			<ComposerPills
				isReply={!!replyTo}
				post={activePost}
				thread={composerState.thread}
				dispatch={composerDispatch}
				bottomBarAnimatedStyle={bottomBarAnimatedStyle}
			/>
			<ComposerFooter
				post={activePost}
				dispatch={dispatch}
				showAddButton={!isEmptyPost(activePost) && (!nextPost || !isEmptyPost(nextPost))}
				onError={setError}
				onEmojiButtonPress={onEmojiButtonPress}
				onSelectVideo={selectVideo}
				onAddPost={() => {
					composerDispatch({
						type: "add_post",
					});
				}}
			/>
		</>
	);

	const isWebFooterSticky = thread.posts.length > 1;
	return (
		<>
			<VerifyEmailDialog
				control={emailVerificationControl}
				onCloseWithoutVerifying={() => {
					onClose();
				}}
				reasonText={"Before creating a post, you must first verify your email."}
			/>
			<div
				// KeyboardAvoidingView
				// behavior={"height"}
				// keyboardVerticalOffset={keyboardVerticalOffset}
				style={{ flex: 1 }}
			>
				<div
					style={{
						flex: 1,
						...viewStyles,
					}}
					aria-modal
				>
					<ComposerTopBar
						canPost={canPost}
						isReply={!!replyTo}
						isPublishQueued={publishOnUpload}
						isPublishing={isPublishing}
						isThread={thread.posts.length > 1}
						publishingStage={publishingStage}
						topBarAnimatedStyle={topBarAnimatedStyle}
						onCancel={onPressCancel}
						onPublish={onPressPublish}
					>
						{missingAltError && <AltTextReminder error={missingAltError} />}
						<ErrorBanner
							error={error}
							videoState={erroredVideo}
							clearError={() => setError("")}
							clearVideo={erroredVideoPostId ? () => clearVideo(erroredVideoPostId) : () => {}}
						/>
					</ComposerTopBar>

					<div
						// Animated.ScrollView
						ref={scrollViewRef}
						// onScroll={scrollHandler}
						// contentContainerstyle={{flexGrow:1}}
						style={{ flex: 1 }}
						// keyboardShouldPersistTaps="always"
						// onContentSizeChange={onScrollViewContentSizeChange}
					>
						{replyTo ? <ComposerReplyTo replyTo={replyTo} /> : undefined}
						{thread.posts.map((post, index) => (
							<React.Fragment key={post.id}>
								<ComposerPost
									post={post}
									dispatch={composerDispatch}
									textInput={post.id === activePost.id ? textInput : null}
									isFirstPost={index === 0}
									isPartOfThread={thread.posts.length > 1}
									isReply={index > 0 || !!replyTo}
									isActive={post.id === activePost.id}
									canRemovePost={thread.posts.length > 1}
									canRemoveQuote={index > 0 || !initQuote}
									onSelectVideo={selectVideo}
									onClearVideo={clearVideo}
									onPublish={onComposerPostPublish}
									onError={setError}
								/>
								{isWebFooterSticky && post.id === activePost.id && (
									<div style={styles.stickyFooterWeb}>{footer}</div>
								)}
							</React.Fragment>
						))}
					</div>
					{!isWebFooterSticky && footer}
				</div>

				<Prompt.Basic
					control={discardPromptControl}
					title={"Discard draft?"}
					description={`Are you sure you'd like to discard this draft?`}
					onConfirm={onClose}
					confirmButtonCta={"Discard"}
					confirmButtonColor="negative"
				/>
			</div>
		</>
	);
};

const ComposerPost = React.memo(function ComposerPost({
	post,
	dispatch,
	textInput,
	isActive,
	isReply,
	isFirstPost,
	isPartOfThread,
	canRemovePost,
	canRemoveQuote,
	onClearVideo,
	onSelectVideo,
	onError,
	onPublish,
}: {
	post: PostDraft;
	dispatch: (action: ComposerAction) => void;
	textInput: React.Ref<TextInputRef>;
	isActive: boolean;
	isReply: boolean;
	isFirstPost: boolean;
	isPartOfThread: boolean;
	canRemovePost: boolean;
	canRemoveQuote: boolean;
	onClearVideo: (postId: string) => void;
	onSelectVideo: (postId: string, asset: ImagePickerAsset) => void;
	onError: (error: string) => void;
	onPublish: (richtext: RichText) => void;
}) {
	const { currentAccount } = useSession();
	const currentDid = currentAccount!.did;
	const { data: currentProfile } = useProfileQuery({ did: currentDid });
	const richtext = post.richtext;
	const isTextOnly = !post.embed.link && !post.embed.quote && !post.embed.media;
	const forceMinHeight = isTextOnly && isActive;
	const selectTextInputPlaceholder = isReply ? (isFirstPost ? "Write your reply" : "Add another post") : `What's up?`;
	const discardPromptControl = Prompt.usePromptControl();

	const dispatchPost = useCallback(
		(action: PostAction) => {
			dispatch({
				type: "update_post",
				postId: post.id,
				postAction: action,
			});
		},
		[dispatch, post.id],
	);

	const onImageAdd = useCallback(
		(next: ComposerImage[]) => {
			dispatchPost({
				type: "embed_add_images",
				images: next,
			});
		},
		[dispatchPost],
	);

	const onNewLink = useCallback(
		(uri: string) => {
			dispatchPost({ type: "embed_add_uri", uri });
		},
		[dispatchPost],
	);

	const onPhotoPasted = useCallback(
		async (uri: string) => {
			if (uri.startsWith("data:video/") || uri.startsWith("data:image/gif")) {
				const [mimeType] = uri.slice("data:".length).split(";");
				if (!SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeTypes)) {
					Toast.show("Unsupported video type", "xmark");
					return;
				}
				const name = `pasted.${mimeToExt(mimeType)}`;
				const file = await fetch(uri)
					.then((res) => res.blob())
					.then((blob) => new File([blob], name, { type: mimeType }));
				onSelectVideo(post.id, await getVideoMetadata(file));
			} else {
				const res = await pasteImage(uri);
				onImageAdd([res]);
			}
		},
		[post.id, onSelectVideo, onImageAdd],
	);

	return (
		<div
			style={{
				marginLeft: 16,
				marginRight: 16,
				...(!isActive && styles.inactivePost),
			}}
		>
			<div style={{ flexDirection: "row" }}>
				<UserAvatar
					avatar={currentProfile?.avatar}
					size={50}
					type={currentProfile?.associated?.labeler ? "labeler" : "user"}
					style={{ marginTop: 4 }}
				/>
				<TextInput
					ref={textInput}
					style={{ paddingTop: 4 }}
					richtext={richtext}
					placeholder={selectTextInputPlaceholder}
					autoFocus
					webForceMinHeight={forceMinHeight}
					// To avoid overlap with the close button:
					hasRightPadding={isPartOfThread}
					isActive={isActive}
					setRichText={(rt) => {
						dispatchPost({ type: "update_richtext", richtext: rt });
					}}
					onFocus={() => {
						dispatch({
							type: "focus_post",
							postId: post.id,
						});
					}}
					onPhotoPasted={onPhotoPasted}
					onNewLink={onNewLink}
					onError={onError}
					onPressPublish={onPublish}
				/>
			</div>
			{canRemovePost && isActive && (
				<>
					<Button
						label={"Delete post"}
						size="small"
						color="secondary"
						variant="ghost"
						shape="round"
						style={{
							position: "absolute",
							...{ top: 0, right: 0 },
						}}
						onPress={() => {
							if (
								post.shortenedGraphemeLength > 0 ||
								post.embed.media ||
								post.embed.link ||
								post.embed.quote
							) {
								discardPromptControl.open();
							} else {
								dispatch({
									type: "remove_post",
									postId: post.id,
								});
							}
						}}
					>
						<ButtonIcon icon={X} />
					</Button>
					<Prompt.Basic
						control={discardPromptControl}
						title={"Discard post?"}
						description={`Are you sure you'd like to discard this post?`}
						onConfirm={() => {
							dispatch({
								type: "remove_post",
								postId: post.id,
							});
						}}
						confirmButtonCta={"Discard"}
						confirmButtonColor="negative"
					/>
				</>
			)}
			<ComposerEmbeds
				canRemoveQuote={canRemoveQuote}
				embed={post.embed}
				dispatch={dispatchPost}
				clearVideo={() => onClearVideo(post.id)}
				isActivePost={isActive}
			/>
		</div>
	);
});

function ComposerTopBar({
	canPost,
	isReply,
	isPublishQueued,
	isPublishing,
	isThread,
	publishingStage,
	onCancel,
	onPublish,
	topBarAnimatedStyle,
	children,
}: {
	isPublishing: boolean;
	publishingStage: string;
	canPost: boolean;
	isReply: boolean;
	isPublishQueued: boolean;
	isThread: boolean;
	onCancel: () => void;
	onPublish: () => void;
	topBarAnimatedStyle: React.CSSProperties;
	children?: React.ReactNode;
}) {
	const pal = usePalette("default");
	return (
		<div
			// Animated.View
			style={topBarAnimatedStyle}
		>
			<div style={styles.topbarInner}>
				<Button
					label="Cancel"
					variant="ghost"
					color="primary"
					shape="default"
					size="small"
					style={{
						borderRadius: 999,
						paddingTop: 8,
						paddingBottom: 8,
						...{ paddingLeft: 7, paddingRight: 7 },
					}}
					onPress={onCancel}
				>
					<ButtonText style={{ fontSize: 16 }}>Cancel</ButtonText>
				</Button>
				<div style={{ flex: 1 }} />
				{isPublishing ? (
					<>
						<Text style={pal.textLight}>{publishingStage}</Text>
						<div style={styles.postBtn}>
							<ActivityIndicator />
						</div>
					</>
				) : (
					<Button
						label={isReply ? "Publish reply" : "Publish post"}
						variant="solid"
						color="primary"
						shape="default"
						size="small"
						style={{
							borderRadius: 999,
							paddingTop: 8,
							paddingBottom: 8,
						}}
						onPress={onPublish}
						disabled={!canPost || isPublishQueued}
					>
						<ButtonText style={{ fontSize: 16 }}>
							{isReply ? <>Reply</> : isThread ? <>Post All</> : <>Post</>}
						</ButtonText>
					</Button>
				)}
			</div>
			{children}
		</div>
	);
}

function AltTextReminder({ error }: { error: string }) {
	const pal = usePalette("default");
	return (
		<div
			style={{
				...styles.reminderLine,
				...pal.viewLight,
			}}
		>
			<div style={styles.errorIcon}>
				<FontAwesomeIcon icon="exclamation" style={{ color: colors.red4 }} /*size={10}*/ size="xl" />
			</div>
			<Text
				style={{
					...pal.text,
					flex: 1,
				}}
			>
				{error}
			</Text>
		</div>
	);
}

function ComposerEmbeds({
	embed,
	dispatch,
	clearVideo,
	canRemoveQuote,
	isActivePost,
}: {
	embed: EmbedDraft;
	dispatch: (action: PostAction) => void;
	clearVideo: () => void;
	canRemoveQuote: boolean;
	isActivePost: boolean;
}) {
	const video = embed.media?.type === "video" ? embed.media.video : null;
	return (
		<>
			{embed.media?.type === "images" && <Gallery images={embed.media.images} dispatch={dispatch} />}
			{embed.media?.type === "gif" && (
				<div
					style={{
						position: "relative",
						marginTop: 16,
					}}
					key={embed.media.gif.url}
				>
					<ExternalEmbedGif gif={embed.media.gif} onRemove={() => dispatch({ type: "embed_remove_gif" })} />
					<GifAltTextDialog
						gif={embed.media.gif}
						altText={embed.media.alt ?? ""}
						onSubmit={(altText: string) => {
							dispatch({ type: "embed_update_gif", alt: altText });
						}}
					/>
				</div>
			)}
			{!embed.media && embed.link && (
				<div
					style={{
						position: "relative",
						marginTop: 16,
					}}
					key={embed.link.uri}
				>
					<ExternalEmbedLink
						uri={embed.link.uri}
						hasQuote={!!embed.quote}
						onRemove={() => dispatch({ type: "embed_remove_link" })}
					/>
				</div>
			)}
			<div
			// LayoutAnimationConfig
			// skipExiting
			>
				{video && (
					<div
						// Animated.View
						style={{
							width: "100%",
							marginTop: 16,
						}}
					>
						{video.asset && video.status !== "compressing" && video.video && (
							<VideoPreview
								asset={video.asset}
								video={video.video}
								// isActivePost={isActivePost} //TODO
								clear={clearVideo}
							/>
						)}
						<SubtitleDialogBtn
							defaultAltText={video.altText}
							saveAltText={(altText) =>
								dispatch({
									type: "embed_update_video",
									videoAction: {
										type: "update_alt_text",
										altText,
										signal: video.abortController.signal,
									},
								})
							}
							captions={video.captions}
							setCaptions={(updater) => {
								dispatch({
									type: "embed_update_video",
									videoAction: {
										type: "update_captions",
										updater,
										signal: video.abortController.signal,
									},
								});
							}}
						/>
					</div>
				)}
			</div>
			{embed.quote?.uri ? (
				<div style={!video ? { marginTop: 12 } : undefined}>
					<div
						style={{
							...s.mt5,
							...s.mb2,
							...s.mb10,
						}}
					>
						<div style={{ pointerEvents: "none" }}>
							<LazyQuoteEmbed uri={embed.quote.uri} />
						</div>
						{canRemoveQuote && <QuoteX onRemove={() => dispatch({ type: "embed_remove_quote" })} />}
					</div>
				</div>
			) : null}
		</>
	);
}

function ComposerPills({
	isReply,
	thread,
	post,
	dispatch,
	bottomBarAnimatedStyle,
}: {
	isReply: boolean;
	thread: ThreadDraft;
	post: PostDraft;
	dispatch: (action: ComposerAction) => void;
	bottomBarAnimatedStyle: React.CSSProperties;
}) {
	const t = useTheme();
	const media = post.embed.media;
	const hasMedia = media?.type === "images" || media?.type === "video";
	const hasLink = !!post.embed.link;

	// Don't render anything if no pills are going to be displayed
	if (isReply && !hasMedia && !hasLink) {
		return null;
	}

	return (
		<div
			// Animated.View
			style={{
				flexDirection: "row",
				padding: 8,
				...t.atoms.bg,
				...bottomBarAnimatedStyle,
			}}
		>
			<div
			// ScrollView
			// contentContainerStyle={[a.gap_sm]}
			// horizontal={true}
			// bounces={false}
			// keyboardShouldPersistTaps="always"
			// showsHorizontalScrollIndicator={false}
			>
				{isReply ? null : (
					<ThreadgateBtn
						postgate={thread.postgate}
						onChangePostgate={(nextPostgate) => {
							dispatch({ type: "update_postgate", postgate: nextPostgate });
						}}
						threadgateAllowUISettings={thread.threadgate}
						onChangeThreadgateAllowUISettings={(nextThreadgate) => {
							dispatch({
								type: "update_threadgate",
								threadgate: nextThreadgate,
							});
						}}
						style={bottomBarAnimatedStyle}
					/>
				)}
				{hasMedia || hasLink ? (
					<LabelsBtn
						labels={post.labels}
						onChange={(nextLabels) => {
							dispatch({
								type: "update_post",
								postId: post.id,
								postAction: {
									type: "update_labels",
									labels: nextLabels,
								},
							});
						}}
					/>
				) : null}
			</div>
		</div>
	);
}

function ComposerFooter({
	post,
	dispatch,
	showAddButton,
	onEmojiButtonPress,
	onError,
	onSelectVideo,
	onAddPost,
}: {
	post: PostDraft;
	dispatch: (action: PostAction) => void;
	showAddButton: boolean;
	onEmojiButtonPress: () => void;
	onError: (error: string) => void;
	onSelectVideo: (postId: string, asset: ImagePickerAsset) => void;
	onAddPost: () => void;
}) {
	const t = useTheme();
	const { isMobile } = useWebMediaQueries();

	const media = post.embed.media;
	const images = media?.type === "images" ? media.images : [];
	const video = media?.type === "video" ? media.video : null;
	const isMaxImages = images.length >= MAX_IMAGES;

	const onImageAdd = useCallback(
		(next: ComposerImage[]) => {
			dispatch({
				type: "embed_add_images",
				images: next,
			});
		},
		[dispatch],
	);

	const onSelectGif = useCallback(
		(gif: Gif) => {
			dispatch({ type: "embed_add_gif", gif });
		},
		[dispatch],
	);

	return (
		<div
			style={{
				flexDirection: "row",
				paddingTop: 4,
				paddingBottom: 4,
				...{ paddingLeft: 7, paddingRight: 16 },
				alignItems: "center",
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.bg,
				...t.atoms.border_contrast_medium,
				justifyContent: "space-between",
			}}
		>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				{video && video.status !== "done" ? (
					<VideoUploadToolbar state={video} />
				) : (
					<ToolbarWrapper
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 4,
						}}
					>
						<SelectPhotoBtn
							size={images.length}
							disabled={media?.type === "images" ? isMaxImages : !!media}
							onAdd={onImageAdd}
						/>
						<SelectVideoBtn
							onSelectVideo={(asset) => onSelectVideo(post.id, asset)}
							disabled={!!media}
							setError={onError}
						/>
						<SelectGifBtn onSelectGif={onSelectGif} disabled={!!media} />
						<Button
							onPress={onEmojiButtonPress}
							style={{ padding: 8 }}
							label={"Open emoji picker"}
							variant="ghost"
							shape="round"
							color="primary"
						>
							<EmojiSmile size="lg" />
						</Button>
					</ToolbarWrapper>
				)}
			</div>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				{showAddButton && (
					<Button
						label={"Add new post"}
						onPress={onAddPost}
						style={{
							padding: 8,
							margin: 2,
						}}
						variant="ghost"
						shape="round"
						color="primary"
					>
						<FontAwesomeIcon icon="add" /*size={20}*/ size="2xl" color={t.palette.primary_500} />
					</Button>
				)}
				<SelectLangBtn />
				<CharProgress count={post.shortenedGraphemeLength} style={{ width: 65 }} />
			</div>
		</div>
	);
}

export function useComposerCancelRef() {
	return useRef<CancelRef>(null);
}

function useScrollTracker({
	scrollViewRef,
	stickyBottom,
}: {
	scrollViewRef: React.RefObject<HTMLDivElement>;
	stickyBottom: boolean;
}) {
	const t = useTheme();
	const contentOffset = useSharedValue(0);
	const scrollViewHeight = useSharedValue(Number.POSITIVE_INFINITY);
	const contentHeight = useSharedValue(0);

	const hasScrolledToTop = contentOffset.get() === 0 ? 1 : 0;

	const hasScrolledToBottom = contentHeight.get() - contentOffset.get() - 5 <= scrollViewHeight.get() ? 1 : 0;

	const showHideBottomBorder = useCallback(
		({
			newContentHeight,
			newContentOffset,
			newScrollViewHeight,
		}: {
			newContentHeight?: number;
			newContentOffset?: number;
			newScrollViewHeight?: number;
		}) => {
			"worklet";
			if (typeof newContentHeight === "number") contentHeight.set(Math.floor(newContentHeight));
			if (typeof newContentOffset === "number") contentOffset.set(Math.floor(newContentOffset));
			if (typeof newScrollViewHeight === "number") scrollViewHeight.set(Math.floor(newScrollViewHeight));
		},
		[contentHeight, contentOffset, scrollViewHeight],
	);

	// const scrollHandler = useAnimatedScrollHandler({
	// 	onScroll: (event) => {
	// 		"worklet";
	// 		showHideBottomBorder({
	// 			newContentOffset: event.contentOffset.y,
	// 			newContentHeight: event.contentSize.height,
	// 			newScrollViewHeight: event.layoutMeasurement.height,
	// 		});
	// 	},
	// });

	const onScrollViewContentSizeChangeUIThread = useCallback(
		(newContentHeight: number) => {
			"worklet";
			const oldContentHeight = contentHeight.get();
			let shouldScrollToBottom = false;
			if (stickyBottom && newContentHeight > oldContentHeight) {
				const isFairlyCloseToBottom = oldContentHeight - contentOffset.get() - 100 <= scrollViewHeight.get();
				if (isFairlyCloseToBottom) {
					shouldScrollToBottom = true;
				}
			}
			showHideBottomBorder({ newContentHeight });
			if (shouldScrollToBottom) {
				// scrollTo(scrollViewRef, 0, newContentHeight, true);
				scrollViewRef.current?.scrollTo(0, newContentHeight);
			}
		},
		[showHideBottomBorder, scrollViewRef, contentHeight, stickyBottom, contentOffset, scrollViewHeight],
	);

	const onScrollViewContentSizeChange = useCallback(
		(_width: number, height: number) => {
			// runOnUI(onScrollViewContentSizeChangeUIThread)(height);
			onScrollViewContentSizeChangeUIThread(height);
		},
		[onScrollViewContentSizeChangeUIThread],
	);

	const onScrollViewLayout = useCallback(
		(evt: DOMRect) => {
			showHideBottomBorder({
				newScrollViewHeight: evt.height,
			});
		},
		[showHideBottomBorder],
	);
	const topBarAnimatedStyle = {
		borderBottomWidth: 1,
		borderColor: hasScrolledToTop === 0 ? t.atoms.border_contrast_medium.borderColor : "transparent",
	} satisfies React.CSSProperties;
	const bottomBarAnimatedStyle = {
		borderTopWidth: 1,
		borderColor: hasScrolledToBottom === 0 ? t.atoms.border_contrast_medium.borderColor : "transparent",
	} satisfies React.CSSProperties;

	return {
		// scrollHandler,
		onScrollViewContentSizeChange,
		onScrollViewLayout,
		topBarAnimatedStyle,
		bottomBarAnimatedStyle,
	};
}

function useKeyboardVerticalOffset() {
	// if Android <35 or web, bottom is 0 anyway. if >=35, this is needed to account
	// for the edge-to-edge nav bar
	return 0;
}

async function whenAppViewReady(
	agent: BskyAgent,
	uri: string,
	fn: (res: AppBskyFeedGetPostThread.Response) => boolean,
) {
	await until(
		5, // 5 tries
		1e3, // 1s delay between tries
		fn,
		() =>
			agent.app.bsky.feed.getPostThread({
				uri,
				depth: 0,
			}),
	);
}

function isEmptyPost(post: PostDraft) {
	return post.richtext.text.trim().length === 0 && !post.embed.media && !post.embed.link && !post.embed.quote;
}

const styles = {
	topbarInner: {
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 8,
		paddingRight: 8,
		height: 54,
		gap: 4,
	},
	postBtn: {
		borderRadius: 20,
		padding: "6px 20px",
		marginLeft: 12,
	},
	stickyFooterWeb: {
		position: "sticky",
		bottom: 0,
	},
	errorLine: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.red1,
		borderRadius: 6,
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 8,
		padding: "10px 12px",
	},
	reminderLine: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 6,
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 8,
		padding: "6px 8px",
	},
	errorIcon: {
		borderWidth: 1,
		borderColor: colors.red4,
		color: colors.red4,
		borderRadius: 30,
		width: 16,
		height: 16,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 5,
	},
	inactivePost: {
		opacity: 0.5,
	},
	addExtLinkBtn: {
		borderWidth: 1,
		borderRadius: 24,
		padding: "12px 16px",
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 4,
	},
} satisfies Record<string, React.CSSProperties>;

function ErrorBanner({
	error: standardError,
	videoState,
	clearError,
	clearVideo,
}: {
	error: string;
	videoState: VideoState | NoVideoState;
	clearError: () => void;
	clearVideo: () => void;
}) {
	const t = useTheme();

	const videoError = videoState.status === "error" ? videoState.error : undefined;
	const error = standardError || videoError;

	const onClearError = () => {
		if (standardError) {
			clearError();
		} else {
			clearVideo();
		}
	};

	if (!error) return null;

	return (
		<div
			// Animated.View
			style={{
				paddingLeft: 16,
				paddingRight: 16,
				paddingBottom: 8,
			}}
			// entering={FadeIn}
			// exiting={FadeOut}
		>
			<div
				style={{
					paddingLeft: 12,
					paddingRight: 12,
					paddingTop: 8,
					paddingBottom: 8,
					gap: 4,
					borderRadius: 8,
					...t.atoms.bg_contrast_25,
				}}
			>
				<div
					style={{
						position: "relative",
						flexDirection: "row",
						gap: 8,
						...{ paddingRight: 48 },
					}}
				>
					<CircleInfo fill={t.palette.negative_400} />
					<NewText
						style={{
							flex: 1,
							lineHeight: 1.3,
							...{ paddingTop: 1 },
						}}
					>
						{error}
					</NewText>
					<Button
						label={"Dismiss error"}
						size="tiny"
						color="secondary"
						variant="ghost"
						shape="round"
						style={{
							position: "absolute",
							...{ top: 0, right: 0 },
						}}
						onPress={onClearError}
					>
						<ButtonIcon icon={X} />
					</Button>
				</div>
				{videoError && videoState.jobId && (
					<NewText
						style={{
							...{ paddingLeft: 28 },
							fontSize: 12,
							letterSpacing: 0,
							fontWeight: "600",
							lineHeight: 1.3,
							...t.atoms.text_contrast_low,
						}}
					>
						<>Job ID: {videoState.jobId}</>
					</NewText>
				)}
			</div>
		</div>
	);
}

function ToolbarWrapper({
	children,
}: {
	style: React.CSSProperties;
	children: React.ReactNode;
}) {
	return children;
}

function VideoUploadToolbar({ state }: { state: VideoState }) {
	const t = useTheme();
	const progress = state.progress;
	const shouldRotate = state.status === "processing" && (progress === 0 || progress === 1);
	let wheelProgress = shouldRotate ? 0.33 : progress;

	// const rotate = useDerivedValue(() => {
	// 	if (shouldRotate) {
	// 		return withRepeat(
	// 			withTiming(360, {
	// 				duration: 2500,
	// 				easing: Easing.out(Easing.cubic),
	// 			}),
	// 			-1,
	// 		);
	// 	}
	// 	return 0;
	// });

	// const animatedStyle = useAnimatedStyle(() => {
	// 	return {
	// 		transform: [{ rotateZ: `${rotate.get()}deg` }],
	// 	};
	// });

	let text = "";

	switch (state.status) {
		case "compressing":
			text = "Compressing video...";
			break;
		case "uploading":
			text = "Uploading video...";
			break;
		case "processing":
			text = "Processing video...";
			break;
		case "error":
			text = "Error";
			wheelProgress = 100;
			break;
		case "done":
			text = "Video uploaded";
			break;
	}

	return (
		<ToolbarWrapper
			style={{
				flexDirection: "row",
				alignItems: "center",
				...{ paddingTop: 5, paddingBottom: 5 },
			}}
		>
			<div
			// Animated.View
			// style={animatedStyle}
			>
				<ProgressCircle
					size={30}
					borderWidth={1}
					borderColor={t.atoms.border_contrast_low.borderColor}
					color={state.status === "error" ? t.palette.negative_500 : t.palette.primary_500}
					progress={wheelProgress}
				/>
			</div>
			<NewText
				style={{
					fontWeight: "600",
					marginLeft: 8,
				}}
			>
				{text}
			</NewText>
		</ToolbarWrapper>
	);
}
