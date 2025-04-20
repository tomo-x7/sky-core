import { AppBskyEmbedRecord, ChatBskyConvoDefs, type ModerationOpts, moderateProfile } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
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
		(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
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
		<GestureActionView
		// actions={actions}
		>
			<div
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onFocus={onFocus}
				onBlur={onMouseLeave}
				style={{
					position: "relative",
					...t.atoms.bg,
				}}
			>
				<div
					style={{
						zIndex: 10,
						position: "absolute",
						...{ top: tokens.space.md, left: tokens.space.lg },
					}}
				>
					<PreviewableUserAvatar profile={profile} size={52} moderation={moderation.ui("avatar")} />
				</div>

				<Link to={`/messages/${convo.id}`} label={displayName} onPress={onPress}>
					{({ hovered, pressed, focused }) => (
						<div
							style={{
								flexDirection: "row",
								...(isDeletedAccount ? a.align_center : a.align_start),
								flex: 1,
								paddingLeft: 16,
								paddingRight: 16,
								paddingTop: 12,
								paddingBottom: 12,
								gap: 12,
								...((hovered || pressed || focused) && t.atoms.bg_contrast_25),
							}}
						>
							{/* Avatar goes here */}
							<div style={{ width: 52, height: 52 }} />

							<div
								style={{
									flex: 1,
									justifyContent: "center",
									...{ paddingRight: 45 },
								}}
							>
								<div
									style={{
										width: "100%",
										flexDirection: "row",
										alignItems: "flex-end",
										paddingBottom: 2,
									}}
								>
									<Text
										numberOfLines={1}
										style={{
											...{ maxWidth: "85%" },
											lineHeight: 1.5,
										}}
									>
										<Text
											style={{
												fontSize: 16,
												letterSpacing: 0,
												...t.atoms.text,
												fontWeight: "600",
												...{ lineHeight: "21px" },
												...(isDimStyle && t.atoms.text_contrast_medium),
											}}
										>
											{displayName}
										</Text>
									</Text>
									{lastMessageSentAt && (
										<TimeElapsed timestamp={lastMessageSentAt}>
											{({ timeElapsed }) => (
												<Text
													style={{
														fontSize: 14,
														letterSpacing: 0,
														...{ lineHeight: "21px" },

														...t.atoms.text_contrast_medium,

														...{ whiteSpace: "preserve nowrap" },
													}}
												>
													{" "}
													&middot; {timeElapsed}
												</Text>
											)}
										</TimeElapsed>
									)}
									{(convo.muted || moderation.blocked) && (
										<Text
											style={{
												fontSize: 14,
												letterSpacing: 0,
												...{ lineHeight: "21px" },
												...t.atoms.text_contrast_medium,
												whiteSpace: "preserve nowrap",
											}}
										>
											{" "}
											&middot; <BellStroke size="xs" style={t.atoms.text_contrast_medium} />
										</Text>
									)}
								</div>

								{!isDeletedAccount && (
									<Text
										numberOfLines={1}
										style={{
											fontSize: 14,
											letterSpacing: 0,
											...t.atoms.text_contrast_medium,
											paddingBottom: 4,
										}}
									>
										@{profile.handle}
									</Text>
								)}

								<Text
									numberOfLines={2}
									style={{
										fontSize: 14,
										letterSpacing: 0,
										lineHeight: 1.3,
										...(hasUnread ? a.font_bold : t.atoms.text_contrast_high),
										...(isDimStyle && t.atoms.text_contrast_medium),
									}}
								>
									{lastMessage}
								</Text>

								<PostAlerts modui={moderation.ui("contentList")} size="lg" style={{ ...a.pt_xs }} />

								{children}
							</div>

							{hasUnread && (
								<div
									style={{
										position: "absolute",
										borderRadius: 999,

										...{
											backgroundColor: isDimStyle
												? t.palette.contrast_200
												: t.palette.primary_500,
											height: 7,
											width: 7,
											top: 15,
											right: 12,
										},
									}}
								/>
							)}
						</div>
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
						style={{
							position: "absolute",
							height: "100%",
							...a.self_end,
							justifyContent: "center",

							...{
								right: tokens.space.lg,
								opacity: !gtMobile || showActions || menuControl.isOpen ? 1 : 0,
							},
						}}
						latestReportableMessage={latestReportableMessage}
					/>
				)}
				<LeaveConvoPrompt control={leaveConvoControl} convoId={convo.id} currentScreen="list" />
			</div>
		</GestureActionView>
	);
}
