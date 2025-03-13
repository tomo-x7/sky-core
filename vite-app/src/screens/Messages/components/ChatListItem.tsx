import { AppBskyEmbedRecord, ChatBskyConvoDefs, type ModerationOpts, moderateProfile } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { type GestureResponderEvent, View } from "react-native";

import { atoms as a, useBreakpoints, useTheme, web } from "#/alf";
import * as tokens from "#/alf/tokens";
import { useDialogControl } from "#/components/Dialog";
import { Link } from "#/components/Link";
import { useMenuControl } from "#/components/Menu";
import { Text } from "#/components/Typography";
import { ConvoMenu } from "#/components/dms/ConvoMenu";
import { LeaveConvoPrompt } from "#/components/dms/LeaveConvoPrompt";
import { Bell2Off_Filled_Corner0_Rounded as BellStroke } from "#/components/icons/Bell2";
import { Envelope_Open_Stroke2_Corner0_Rounded as EnvelopeOpen } from "#/components/icons/EnveopeOpen";
import { Trash_Stroke2_Corner0_Rounded } from "#/components/icons/Trash";
import { PostAlerts } from "#/components/moderation/PostAlerts";
import { GestureActionView } from "#/lib/custom-animations/GestureActionView";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { postUriToRelativePath, toBskyAppUrl, toShortUrl } from "#/lib/strings/url-helpers";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { precacheConvoQuery, useMarkAsReadMutation } from "#/state/queries/messages/conversation";
import { precacheProfile } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import { TimeElapsed } from "#/view/com/util/TimeElapsed";
import { PreviewableUserAvatar } from "#/view/com/util/UserAvatar";

export let ChatListItem = ({
	convo,
	showMenu = true,
	children,
}: {
	convo: ChatBskyConvoDefs.ConvoView;
	showMenu?: boolean;
	children?: React.ReactNode;
}): React.ReactNode => {
	const { currentAccount } = useSession();
	const moderationOpts = useModerationOpts();

	const otherUser = convo.members.find((member) => member.did !== currentAccount?.did);

	if (!otherUser || !moderationOpts) {
		return null;
	}

	return (
		<ChatListItemReady convo={convo} profile={otherUser} moderationOpts={moderationOpts} showMenu={showMenu}>
			{children}
		</ChatListItemReady>
	);
};

ChatListItem = React.memo(ChatListItem);

function ChatListItemReady({
	convo,
	profile: profileUnshadowed,
	moderationOpts,
	showMenu,
	children,
}: {
	convo: ChatBskyConvoDefs.ConvoView;
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	showMenu?: boolean;
	children?: React.ReactNode;
}) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const menuControl = useMenuControl();
	const leaveConvoControl = useDialogControl();
	const { gtMobile } = useBreakpoints();
	const profile = useProfileShadow(profileUnshadowed);
	const { mutate: markAsRead } = useMarkAsReadMutation();
	const moderation = React.useMemo(() => moderateProfile(profile, moderationOpts), [profile, moderationOpts]);
	const queryClient = useQueryClient();
	const isUnread = convo.unreadCount > 0;

	const blockInfo = useMemo(() => {
		const modui = moderation.ui("profileView");
		const blocks = modui.alerts.filter((alert) => alert.type === "blocking");
		const listBlocks = blocks.filter((alert) => alert.source.type === "list");
		const userBlock = blocks.find((alert) => alert.source.type === "user");
		return {
			listBlocks,
			userBlock,
		};
	}, [moderation]);

	const isDeletedAccount = profile.handle === "missing.invalid";
	const displayName = isDeletedAccount
		? "Deleted Account"
		: sanitizeDisplayName(profile.displayName || profile.handle, moderation.ui("displayName"));

	const isDimStyle = convo.muted || moderation.blocked || isDeletedAccount;

	const { lastMessage, lastMessageSentAt, latestReportableMessage } = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		let lastMessage = "No messages yet";
		// eslint-disable-next-line @typescript-eslint/no-shadow
		let lastMessageSentAt: string | null = null;
		// eslint-disable-next-line @typescript-eslint/no-shadow
		let latestReportableMessage: ChatBskyConvoDefs.MessageView | undefined;

		if (ChatBskyConvoDefs.isMessageView(convo.lastMessage)) {
			const isFromMe = convo.lastMessage.sender?.did === currentAccount?.did;

			if (!isFromMe) {
				latestReportableMessage = convo.lastMessage;
			}

			if (convo.lastMessage.text) {
				if (isFromMe) {
					lastMessage = `You: ${convo.lastMessage.text}`;
				} else {
					lastMessage = convo.lastMessage.text;
				}
			} else if (convo.lastMessage.embed) {
				const defaultEmbeddedContentMessage = "(contains embedded content)";

				if (AppBskyEmbedRecord.isView(convo.lastMessage.embed)) {
					const embed = convo.lastMessage.embed;

					if (AppBskyEmbedRecord.isViewRecord(embed.record)) {
						const record = embed.record;
						const path = postUriToRelativePath(record.uri, {
							handle: record.author.handle,
						});
						const href = path ? toBskyAppUrl(path) : undefined;
						const short = href ? toShortUrl(href) : defaultEmbeddedContentMessage;
						if (isFromMe) {
							lastMessage = `You: ${short}`;
						} else {
							lastMessage = short;
						}
					}
				} else {
					if (isFromMe) {
						lastMessage = `You: ${defaultEmbeddedContentMessage}`;
					} else {
						lastMessage = defaultEmbeddedContentMessage;
					}
				}
			}

			lastMessageSentAt = convo.lastMessage.sentAt;
		}
		if (ChatBskyConvoDefs.isDeletedMessageView(convo.lastMessage)) {
			lastMessage = isDeletedAccount ? "Conversation deleted" : "Message deleted";
		}

		return {
			lastMessage,
			lastMessageSentAt,
			latestReportableMessage,
		};
	}, [convo.lastMessage, currentAccount?.did, isDeletedAccount]);

	const [showActions, setShowActions] = useState(false);

	const onMouseEnter = useCallback(() => {
		setShowActions(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setShowActions(false);
	}, []);

	const onFocus = useCallback<React.FocusEventHandler>((e) => {
		if (e.nativeEvent.relatedTarget == null) return;
		setShowActions(true);
	}, []);

	const onPress = useCallback(
		(e: GestureResponderEvent) => {
			precacheProfile(queryClient, profile);
			precacheConvoQuery(queryClient, convo);
			if (isDeletedAccount) {
				e.preventDefault();
				menuControl.open();
				return false;
			} else {
			}
		},
		[isDeletedAccount, menuControl, queryClient, profile, convo],
	);

	const onLongPress = useCallback(() => {
		menuControl.open();
	}, [menuControl]);

	const markReadAction = {
		threshold: 120,
		color: t.palette.primary_500,
		icon: EnvelopeOpen,
		action: () => {
			markAsRead({
				convoId: convo.id,
			});
		},
	};

	const deleteAction = {
		threshold: 225,
		color: t.palette.negative_500,
		icon: Trash_Stroke2_Corner0_Rounded,
		action: () => {
			leaveConvoControl.open();
		},
	};

	const actions = isUnread
		? {
				leftFirst: markReadAction,
				leftSecond: deleteAction,
			}
		: {
				leftFirst: deleteAction,
			};

	const hasUnread = convo.unreadCount > 0 && !isDeletedAccount;

	return (
		<GestureActionView actions={actions}>
			<View
				// @ts-expect-error web only
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onFocus={onFocus}
				onBlur={onMouseLeave}
				style={[a.relative, t.atoms.bg]}
			>
				<View style={[a.z_10, a.absolute, { top: tokens.space.md, left: tokens.space.lg }]}>
					<PreviewableUserAvatar profile={profile} size={52} moderation={moderation.ui("avatar")} />
				</View>

				<Link
					to={`/messages/${convo.id}`}
					label={displayName}
					accessibilityHint={
						!isDeletedAccount
							? `Go to conversation with ${profile.handle}`
							: "This conversation is with a deleted or a deactivated account. Press for options"
					}
					accessibilityActions={undefined}
					onPress={onPress}
					onLongPress={undefined}
					onAccessibilityAction={onLongPress}
				>
					{({ hovered, pressed, focused }) => (
						<View
							style={[
								a.flex_row,
								isDeletedAccount ? a.align_center : a.align_start,
								a.flex_1,
								a.px_lg,
								a.py_md,
								a.gap_md,
								(hovered || pressed || focused) && t.atoms.bg_contrast_25,
							]}
						>
							{/* Avatar goes here */}
							<View style={{ width: 52, height: 52 }} />

							<View style={[a.flex_1, a.justify_center, web({ paddingRight: 45 })]}>
								<View style={[a.w_full, a.flex_row, a.align_end, a.pb_2xs]}>
									<Text numberOfLines={1} style={[{ maxWidth: "85%" }, web([a.leading_normal])]}>
										<Text
											emoji
											style={[
												a.text_md,
												t.atoms.text,
												a.font_bold,
												{ lineHeight: 21 },
												isDimStyle && t.atoms.text_contrast_medium,
											]}
										>
											{displayName}
										</Text>
									</Text>
									{lastMessageSentAt && (
										<TimeElapsed timestamp={lastMessageSentAt}>
											{({ timeElapsed }) => (
												<Text
													style={[
														a.text_sm,
														{ lineHeight: 21 },
														t.atoms.text_contrast_medium, //@ts-ignore
														web({ whiteSpace: "preserve nowrap" }),
													]}
												>
													{" "}
													&middot; {timeElapsed}
												</Text>
											)}
										</TimeElapsed>
									)}
									{(convo.muted || moderation.blocked) && (
										<Text
											style={[
												a.text_sm,
												{ lineHeight: 21 },
												t.atoms.text_contrast_medium, //@ts-ignore
												web({ whiteSpace: "preserve nowrap" }),
											]}
										>
											{" "}
											&middot; <BellStroke size="xs" style={[t.atoms.text_contrast_medium]} />
										</Text>
									)}
								</View>

								{!isDeletedAccount && (
									<Text numberOfLines={1} style={[a.text_sm, t.atoms.text_contrast_medium, a.pb_xs]}>
										@{profile.handle}
									</Text>
								)}

								<Text
									emoji
									numberOfLines={2}
									style={[
										a.text_sm,
										a.leading_snug,
										hasUnread ? a.font_bold : t.atoms.text_contrast_high,
										isDimStyle && t.atoms.text_contrast_medium,
									]}
								>
									{lastMessage}
								</Text>

								<PostAlerts modui={moderation.ui("contentList")} size="lg" style={[a.pt_xs]} />

								{children}
							</View>

							{hasUnread && (
								<View
									style={[
										a.absolute,
										a.rounded_full,
										{
											backgroundColor: isDimStyle
												? t.palette.contrast_200
												: t.palette.primary_500,
											height: 7,
											width: 7,
											top: 15,
											right: 12,
										},
									]}
								/>
							)}
						</View>
					)}
				</Link>

				{showMenu && (
					<ConvoMenu
						convo={convo}
						profile={profile}
						control={menuControl}
						currentScreen="list"
						showMarkAsRead={convo.unreadCount > 0}
						hideTrigger={false}
						blockInfo={blockInfo}
						style={[
							a.absolute,
							a.h_full,
							a.self_end,
							a.justify_center,
							{
								right: tokens.space.lg,
								opacity: !gtMobile || showActions || menuControl.isOpen ? 1 : 0,
							},
						]}
						latestReportableMessage={latestReportableMessage}
					/>
				)}
				<LeaveConvoPrompt control={leaveConvoControl} convoId={convo.id} currentScreen="list" />
			</View>
		</GestureActionView>
	);
}
