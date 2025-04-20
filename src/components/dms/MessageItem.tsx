import { AppBskyEmbedRecord, ChatBskyConvoDefs, RichText as RichTextAPI } from "@atproto/api";
import React, { useCallback, useMemo, useRef } from "react";

import { atoms as a, flatten, useTheme } from "#/alf";
import { isOnlyEmoji } from "#/alf/typography";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { ActionsWrapper } from "#/components/dms/ActionsWrapper";
import type { ConvoItem } from "#/state/messages/convo/types";
import { useSession } from "#/state/session";
import { TimeElapsed } from "#/view/com/util/TimeElapsed";
import { RichText } from "../RichText";
import { DateDivider } from "./DateDivider";
import { MessageItemEmbed } from "./MessageItemEmbed";
import { localDateString } from "./util";

let MessageItem = ({
	item,
}: {
	item: ConvoItem & { type: "message" | "pending-message" };
}): React.ReactNode => {
	const t = useTheme();
	const { currentAccount } = useSession();

	const { message, nextMessage, prevMessage } = item;
	const isPending = item.type === "pending-message";

	const isFromSelf = message.sender?.did === currentAccount?.did;

	const nextIsMessage = ChatBskyConvoDefs.isMessageView(nextMessage);

	const isNextFromSelf = nextIsMessage && nextMessage.sender?.did === currentAccount?.did;

	const isNextFromSameSender = isNextFromSelf === isFromSelf;

	const isNewDay = useMemo(() => {
		if (!prevMessage) return true;

		const thisDate = new Date(message.sentAt);
		const prevDate = new Date(prevMessage.sentAt);

		return localDateString(thisDate) !== localDateString(prevDate);
	}, [message, prevMessage]);

	const isLastMessageOfDay = useMemo(() => {
		if (!nextMessage || !nextIsMessage) return true;

		const thisDate = new Date(message.sentAt);
		const prevDate = new Date(nextMessage.sentAt);

		return localDateString(thisDate) !== localDateString(prevDate);
	}, [message.sentAt, nextIsMessage, nextMessage]);

	const needsTail = isLastMessageOfDay || !isNextFromSameSender;

	const isLastInGroup = useMemo(() => {
		// if this message is pending, it means the next message is pending too
		if (isPending && nextMessage) {
			return false;
		}

		// or, if there's a 5 minute gap between this message and the next
		if (ChatBskyConvoDefs.isMessageView(nextMessage)) {
			const thisDate = new Date(message.sentAt);
			const nextDate = new Date(nextMessage.sentAt);

			const diff = nextDate.getTime() - thisDate.getTime();

			// 5 minutes
			return diff > 5 * 60 * 1000;
		}

		return true;
	}, [message, nextMessage, isPending]);

	const lastInGroupRef = useRef(isLastInGroup);
	if (lastInGroupRef.current !== isLastInGroup) {
		// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		lastInGroupRef.current = isLastInGroup;
	}

	const pendingColor = t.palette.primary_200;

	const rt = useMemo(() => {
		return new RichTextAPI({ text: message.text, facets: message.facets });
	}, [message.text, message.facets]);

	return (
		<>
			{isNewDay && <DateDivider date={message.sentAt} />}
			<div
				style={{
					...(isFromSelf ? a.mr_md : a.ml_md),
					...(nextIsMessage && !isNextFromSameSender && a.mb_md),
				}}
			>
				<ActionsWrapper isFromSelf={isFromSelf} message={message}>
					{AppBskyEmbedRecord.isView(message.embed) && <MessageItemEmbed embed={message.embed} />}
					{rt.text.length > 0 && (
						<div
							style={
								isOnlyEmoji(message.text)
									? undefined
									: flatten([
											a.py_sm,
											a.my_2xs,
											a.rounded_md,
											{
												paddingLeft: 14,
												paddingRight: 14,
												backgroundColor: isFromSelf
													? isPending
														? pendingColor
														: t.palette.primary_500
													: t.palette.contrast_50,
												borderRadius: 17,
											},
											isFromSelf ? a.self_end : a.self_start,
											isFromSelf
												? { borderBottomRightRadius: needsTail ? 2 : 17 }
												: { borderBottomLeftRadius: needsTail ? 2 : 17 },
										])
							}
						>
							<RichText
								value={rt}
								style={{
									fontSize: 16,
									letterSpacing: 0,
									...(isFromSelf && { color: t.palette.white }),
								}}
								interactivestyle={{ ...a.underline }}
								enableTags
								emojiMultiplier={3}
							/>
						</div>
					)}
				</ActionsWrapper>

				{isLastInGroup && <MessageItemMetadata item={item} style={isFromSelf ? a.text_right : a.text_left} />}
			</div>
		</>
	);
};
MessageItem = React.memo(MessageItem);
export { MessageItem };

let MessageItemMetadata = ({
	item,
	style,
}: {
	item: ConvoItem & { type: "message" | "pending-message" };
	style: React.CSSProperties;
}): React.ReactNode => {
	const t = useTheme();
	const { message } = item;

	const handleRetry = useCallback(
		(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
			if (item.type === "pending-message" && item.retry) {
				e.preventDefault();
				item.retry();
				return false;
			}
		},
		[item],
	);

	const relativeTimestamp = useCallback((timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();

		const time = date.toLocaleString(undefined, { hour: "numeric", minute: "numeric" });

		const diff = now.getTime() - date.getTime();

		// if under 30 seconds
		if (diff < 1000 * 30) {
			return "Now";
		}

		return time;
	}, []);

	return (
		<Text
			style={{
				fontSize: 12,
				letterSpacing: 0,
				marginTop: 2,
				marginBottom: 16,
				...t.atoms.text_contrast_medium,
				...style,
			}}
		>
			<TimeElapsed timestamp={message.sentAt} timeToString={relativeTimestamp}>
				{({ timeElapsed }) => (
					<Text
						style={{
							fontSize: 12,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
						}}
					>
						{timeElapsed}
					</Text>
				)}
			</TimeElapsed>
			{item.type === "pending-message" && item.failed && (
				<>
					{" "}
					&middot;{" "}
					<Text
						style={{
							fontSize: 12,
							letterSpacing: 0,

							...{
								color: t.palette.negative_400,
							},
						}}
					>
						{"Failed to send"}
					</Text>
					{item.retry && (
						<>
							{" "}
							&middot;{" "}
							<InlineLinkText
								label={"Click to retry failed message"}
								to="#"
								onPress={handleRetry}
								style={{ ...a.text_xs }}
							>
								{"Retry"}
							</InlineLinkText>
						</>
					)}
				</>
			)}
		</Text>
	);
};
MessageItemMetadata = React.memo(MessageItemMetadata);
export { MessageItemMetadata };
