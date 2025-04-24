import type { ChatBskyConvoDefs } from "@atproto/api";
import { KnownFollowers } from "#/components/KnownFollowers";
import { Text } from "#/components/Typography";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useSession } from "#/state/session";
import { ChatListItem } from "./ChatListItem";
import { AcceptChatButton, DeleteChatButton, RejectMenu } from "./RequestButtons";

export function RequestListItem({ convo }: { convo: ChatBskyConvoDefs.ConvoView }) {
	const { currentAccount } = useSession();
	const moderationOpts = useModerationOpts();

	const otherUser = convo.members.find((member) => member.did !== currentAccount?.did);

	if (!otherUser || !moderationOpts) {
		return null;
	}

	const isDeletedAccount = otherUser.handle === "missing.invalid";

	return (
		<div
			style={{
				position: "relative",
				flex: 1,
			}}
		>
			<ChatListItem convo={convo} showMenu={false}>
				<div
					style={{
						paddingTop: 4,
						paddingBottom: 2,
					}}
				>
					<KnownFollowers profile={otherUser} moderationOpts={moderationOpts} minimal showIfEmpty />
				</div>
				{/* spacer, since you can't nest pressables */}
				<div
					style={{
						paddingTop: 12,
						paddingBottom: 4,
						width: "100%",
						...{ opacity: 0 },
					}}
					aria-hidden
				>
					{/* Placeholder text so that it responds to the font height */}
					<Text
						style={{
							fontSize: 12,
							letterSpacing: 0,
							lineHeight: 1.15,
							fontWeight: "600",
						}}
					>
						Accept Request
					</Text>
				</div>
			</ChatListItem>
			<div
				style={{
					position: "absolute",
					paddingRight: 12,
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					gap: 8,

					...{
						bottom: 12,
						paddingLeft: 16 + 52 + 12,
					},
				}}
			>
				{!isDeletedAccount ? (
					<>
						<AcceptChatButton convo={convo} currentScreen="list" />
						<RejectMenu convo={convo} profile={otherUser} showDeleteConvo currentScreen="list" />
					</>
				) : (
					<>
						<DeleteChatButton convo={convo} currentScreen="list" />
						<div style={{ flex: 1 }} />
					</>
				)}
			</div>
		</div>
	);
}
