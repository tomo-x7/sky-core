import Graphemer from "graphemer";
import React from "react";
import { flushSync } from "react-dom";
import TextareaAutosize from "react-textarea-autosize";

import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { useSharedInputStyles } from "#/components/forms/TextField";
import { EmojiArc_Stroke2_Corner0_Rounded as EmojiSmile } from "#/components/icons/Emoji";
import { PaperPlane_Stroke2_Corner0_Rounded as PaperPlane } from "#/components/icons/PaperPlane";
import { isSafari, isTouchDevice } from "#/lib/browser";
import { MAX_DM_GRAPHEME_LENGTH } from "#/lib/constants";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { useMessageDraft, useSaveMessageDraft } from "#/state/messages/message-drafts";
import { textInputWebEmitter } from "#/view/com/composer/text-input/textInputWebEmitter";
import type { Emoji, EmojiPickerPosition } from "#/view/com/composer/text-input/web/EmojiPicker.web";
import * as Toast from "#/view/com/util/Toast";
import { useExtractEmbedFromFacets } from "./MessageInputEmbed";

export function MessageInput({
	onSendMessage,
	hasEmbed,
	setEmbed,
	children,
	openEmojiPicker,
}: {
	onSendMessage: (message: string) => void;
	hasEmbed: boolean;
	setEmbed: (embedUrl: string | undefined) => void;
	children?: React.ReactNode;
	openEmojiPicker?: (pos: EmojiPickerPosition) => void;
}) {
	const { isMobile } = useWebMediaQueries();
	const t = useTheme();
	const { getDraft, clearDraft } = useMessageDraft();
	const [message, setMessage] = React.useState(getDraft);

	const inputStyles = useSharedInputStyles();
	const isComposing = React.useRef(false);
	const [isFocused, setIsFocused] = React.useState(false);
	const [isHovered, setIsHovered] = React.useState(false);
	const [textAreaHeight, setTextAreaHeight] = React.useState(38);
	const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

	const onSubmit = React.useCallback(() => {
		if (!hasEmbed && message.trim() === "") {
			return;
		}
		if (new Graphemer().countGraphemes(message) > MAX_DM_GRAPHEME_LENGTH) {
			Toast.show("Message is too long", "xmark");
			return;
		}
		clearDraft();
		onSendMessage(message);
		setMessage("");
		setEmbed(undefined);
	}, [message, onSendMessage, clearDraft, hasEmbed, setEmbed]);

	const onKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Don't submit the form when the Japanese or any other IME is composing
			if (isComposing.current) return;

			// see https://github.com/bluesky-social/social-app/issues/4178
			// see https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/
			// see https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
			//
			// On Safari, the final keydown event to dismiss the IME - which is the enter key - is also "Enter" below.
			// Obviously, this causes problems because the final dismissal should _not_ submit the text, but should just
			// stop the IME editing. This is the behavior of Chrome and Firefox, but not Safari.
			//
			// Keycode is deprecated, however the alternative seems to only be to compare the timestamp from the
			// onCompositionEnd event to the timestamp of the keydown event, which is not reliable. For example, this hack
			// uses that method: https://github.com/ProseMirror/prosemirror-view/pull/44. However, from my 500ms resulted in
			// far too long of a delay, and a subsequent enter press would often just end up doing nothing. A shorter time
			// frame was also not great, since it was too short to be reliable (i.e. an older system might have a larger
			// time gap between the two events firing.
			if (isSafari && e.key === "Enter" && e.keyCode === 229) {
				return;
			}

			if (e.key === "Enter") {
				if (e.shiftKey) return;
				e.preventDefault();
				onSubmit();
			}
		},
		[onSubmit],
	);

	const onChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
	}, []);

	const onEmojiInserted = React.useCallback((emoji: Emoji) => {
		if (!textAreaRef.current) {
			return;
		}
		const position = textAreaRef.current.selectionStart ?? 0;
		textAreaRef.current.focus();
		flushSync(() => {
			setMessage((message) => message.slice(0, position) + emoji.native + message.slice(position));
		});
		textAreaRef.current.selectionStart = position + emoji.native.length;
		textAreaRef.current.selectionEnd = position + emoji.native.length;
	}, []);
	React.useEffect(() => {
		textInputWebEmitter.addListener("emoji-inserted", onEmojiInserted);
		return () => {
			textInputWebEmitter.removeListener("emoji-inserted", onEmojiInserted);
		};
	}, [onEmojiInserted]);

	useSaveMessageDraft(message);
	useExtractEmbedFromFacets(message, setEmbed);

	return (
		<div style={{ padding: 8 }}>
			{children}
			<div
				style={{
					flexDirection: "row",
					...t.atoms.bg_contrast_25,

					...{
						paddingRight: 6,
						paddingLeft: 6,
						borderWidth: 1,
						borderRadius: 23,
						borderColor: "transparent",
						height: textAreaHeight + 23,
					},

					...(isHovered && inputStyles.chromeHover),
					...(isFocused && inputStyles.chromeFocus),
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Button
					onPress={(e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						const px = rect.left + window.scrollX;
						const py = rect.top + window.scrollY;
						openEmojiPicker?.({
							top: py,
							left: px,
							right: px,
							bottom: py,
							nextFocusRef: textAreaRef,
						});
					}}
					style={{
						borderRadius: 999,
						overflow: "hidden",
						alignItems: "center",
						justifyContent: "center",

						...{
							marginTop: 5,
							height: 30,
							width: 30,
						},
					}}
					label={"Open emoji picker"}
				>
					{(state) => (
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								alignItems: "center",
								justifyContent: "center",

								...{
									backgroundColor:
										state.hovered || state.focused || state.pressed
											? t.atoms.bg.backgroundColor
											: undefined,
								},
							}}
						>
							<EmojiSmile size="lg" />
						</div>
					)}
				</Button>
				<TextareaAutosize
					ref={textAreaRef}
					style={{
						flex: 1,
						paddingLeft: 8,
						paddingRight: 8,
						...a.border_0,
						...t.atoms.text,
						paddingTop: 10,
						backgroundColor: "transparent",
						resize: "none",
					}}
					maxRows={12}
					placeholder={"Write a message"}
					defaultValue=""
					value={message}
					dirName="ltr"
					autoFocus={true}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					onCompositionStart={() => {
						isComposing.current = true;
					}}
					onCompositionEnd={() => {
						isComposing.current = false;
					}}
					onHeightChange={(height) => setTextAreaHeight(height)}
					onChange={onChange}
					// On mobile web phones, we want to keep the same behavior as the native app. Do not submit the message
					// in these cases.
					onKeyDown={isTouchDevice && isMobile ? undefined : onKeyDown}
				/>
				<button
					type="button"
					style={{
						borderRadius: 999,
						alignItems: "center",
						justifyContent: "center",

						...{
							height: 30,
							width: 30,
							marginTop: 5,
							backgroundColor: t.palette.primary_500,
						},
					}}
					onClick={onSubmit}
				>
					<PaperPlane
						fill={t.palette.white}
						style={{
							position: "relative",
							...{ left: 1 },
						}}
					/>
				</button>
			</div>
		</div>
	);
}
