import type { ChatBskyConvoDefs, ModerationCause } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Keyboard, Pressable, View } from "react-native";

import { type ViewStyleProp, atoms as a, useTheme } from "#/alf";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { BlockedByListDialog } from "#/components/dms/BlockedByListDialog";
import { LeaveConvoPrompt } from "#/components/dms/LeaveConvoPrompt";
import { ReportConversationPrompt } from "#/components/dms/ReportConversationPrompt";
import { ArrowBoxLeft_Stroke2_Corner0_Rounded as ArrowBoxLeft } from "#/components/icons/ArrowBoxLeft";
import { DotGrid_Stroke2_Corner0_Rounded as DotsHorizontal } from "#/components/icons/DotGrid";
import { Flag_Stroke2_Corner0_Rounded as Flag } from "#/components/icons/Flag";
import { Mute_Stroke2_Corner0_Rounded as Mute } from "#/components/icons/Mute";
import {
	Person_Stroke2_Corner0_Rounded as Person,
	PersonCheck_Stroke2_Corner0_Rounded as PersonCheck,
	PersonX_Stroke2_Corner0_Rounded as PersonX,
} from "#/components/icons/Person";
import { SpeakerVolumeFull_Stroke2_Corner0_Rounded as Unmute } from "#/components/icons/Speaker";
import type { NavigationProp } from "#/lib/routes/types";
import type { Shadow } from "#/state/cache/types";
import { useConvoQuery, useMarkAsReadMutation } from "#/state/queries/messages/conversation";
import { useMuteConvo } from "#/state/queries/messages/mute-conversation";
import { useProfileBlockMutationQueue } from "#/state/queries/profile";
import type * as bsky from "#/types/bsky";
import * as Toast from "#/view/com/util/Toast";
import { Bubble_Stroke2_Corner2_Rounded as Bubble } from "../icons/Bubble";
import { ReportDialog } from "./ReportDialog";

let ConvoMenu = ({
	convo,
	profile,
	control,
	currentScreen,
	showMarkAsRead,
	hideTrigger,
	blockInfo,
	latestReportableMessage,
	style,
}: {
	convo: ChatBskyConvoDefs.ConvoView;
	profile: Shadow<bsky.profile.AnyProfileView>;
	control?: Menu.MenuControlProps;
	currentScreen: "list" | "conversation";
	showMarkAsRead?: boolean;
	hideTrigger?: boolean;
	blockInfo: {
		listBlocks: ModerationCause[];
		userBlock?: ModerationCause;
	};
	latestReportableMessage?: ChatBskyConvoDefs.MessageView;
	style?: ViewStyleProp["style"];
}): React.ReactNode => {
	const t = useTheme();

	const leaveConvoControl = Prompt.usePromptControl();
	const reportControl = Prompt.usePromptControl();
	const blockedByListControl = Prompt.usePromptControl();

	const { listBlocks } = blockInfo;

	return (
		<>
			<Menu.Root control={control}>
				{!hideTrigger && (
					<View style={[style]}>
						<Menu.Trigger label={"Chat settings"}>
							{({ props, state }) => (
								<Pressable
									{...props}
									onPress={() => {
										Keyboard.dismiss();
										props.onPress();
									}}
									style={[
										a.p_sm,
										a.rounded_full,
										(state.hovered || state.pressed) && t.atoms.bg_contrast_25,
										// make sure pfp is in the middle
										{ marginLeft: -10 },
									]}
								>
									<DotsHorizontal size="md" style={t.atoms.text} />
								</Pressable>
							)}
						</Menu.Trigger>
					</View>
				)}

				<Menu.Outer>
					<MenuContent
						profile={profile}
						showMarkAsRead={showMarkAsRead}
						blockInfo={blockInfo}
						convo={convo}
						leaveConvoControl={leaveConvoControl}
						reportControl={reportControl}
						blockedByListControl={blockedByListControl}
					/>
				</Menu.Outer>
			</Menu.Root>

			<LeaveConvoPrompt control={leaveConvoControl} convoId={convo.id} currentScreen={currentScreen} />
			{latestReportableMessage ? (
				<ReportDialog
					currentScreen={currentScreen}
					params={{
						type: "convoMessage",
						convoId: convo.id,
						message: latestReportableMessage,
					}}
					control={reportControl}
				/>
			) : (
				<ReportConversationPrompt control={reportControl} />
			)}

			<BlockedByListDialog control={blockedByListControl} listBlocks={listBlocks} />
		</>
	);
};
ConvoMenu = React.memo(ConvoMenu);

function MenuContent({
	convo: initialConvo,
	profile,
	showMarkAsRead,
	blockInfo,
	leaveConvoControl,
	reportControl,
	blockedByListControl,
}: {
	convo: ChatBskyConvoDefs.ConvoView;
	profile: Shadow<bsky.profile.AnyProfileView>;
	showMarkAsRead?: boolean;
	blockInfo: {
		listBlocks: ModerationCause[];
		userBlock?: ModerationCause;
	};
	leaveConvoControl: Prompt.PromptControlProps;
	reportControl: Prompt.PromptControlProps;
	blockedByListControl: Prompt.PromptControlProps;
}) {
	const navigation = useNavigation<NavigationProp>();
	const { mutate: markAsRead } = useMarkAsReadMutation();

	const { listBlocks, userBlock } = blockInfo;
	const isBlocking = userBlock || !!listBlocks.length;
	const isDeletedAccount = profile.handle === "missing.invalid";

	const convoId = initialConvo.id;
	const { data: convo } = useConvoQuery(initialConvo);

	const onNavigateToProfile = useCallback(() => {
		navigation.navigate("Profile", { name: profile.did });
	}, [navigation, profile.did]);

	const { mutate: muteConvo } = useMuteConvo(convoId, {
		onSuccess: (data) => {
			if (data.convo.muted) {
				Toast.show("Chat muted");
			} else {
				Toast.show("Chat unmuted");
			}
		},
		onError: () => {
			Toast.show("Could not mute chat", "xmark");
		},
	});

	const [queueBlock, queueUnblock] = useProfileBlockMutationQueue(profile);

	const toggleBlock = React.useCallback(() => {
		if (listBlocks.length) {
			blockedByListControl.open();
			return;
		}

		if (userBlock) {
			queueUnblock();
		} else {
			queueBlock();
		}
	}, [userBlock, listBlocks, blockedByListControl, queueBlock, queueUnblock]);

	return isDeletedAccount ? (
		<Menu.Item label={"Leave conversation"} onPress={() => leaveConvoControl.open()}>
			<Menu.ItemText>Leave conversation</Menu.ItemText>
			<Menu.ItemIcon icon={ArrowBoxLeft} />
		</Menu.Item>
	) : (
		<>
			<Menu.Group>
				{showMarkAsRead && (
					<Menu.Item label="Mark as read" onPress={() => markAsRead({ convoId })}>
						<Menu.ItemText>Mark as read</Menu.ItemText>
						<Menu.ItemIcon icon={Bubble} />
					</Menu.Item>
				)}
				<Menu.Item label="Go to user's profile" onPress={onNavigateToProfile}>
					<Menu.ItemText>Go to profile</Menu.ItemText>
					<Menu.ItemIcon icon={Person} />
				</Menu.Item>
				<Menu.Item label="Mute conversation" onPress={() => muteConvo({ mute: !convo?.muted })}>
					<Menu.ItemText>{convo?.muted ? <>Unmute conversation</> : <>Mute conversation</>}</Menu.ItemText>
					<Menu.ItemIcon icon={convo?.muted ? Unmute : Mute} />
				</Menu.Item>
			</Menu.Group>
			<Menu.Divider />
			<Menu.Group>
				<Menu.Item label={isBlocking ? "Unblock account" : "Block account"} onPress={toggleBlock}>
					<Menu.ItemText>{isBlocking ? "Unblock account" : "Block account"}</Menu.ItemText>
					<Menu.ItemIcon icon={isBlocking ? PersonCheck : PersonX} />
				</Menu.Item>
				<Menu.Item label={"Report conversation"} onPress={() => reportControl.open()}>
					<Menu.ItemText>Report conversation</Menu.ItemText>
					<Menu.ItemIcon icon={Flag} />
				</Menu.Item>
			</Menu.Group>
			<Menu.Divider />
			<Menu.Group>
				<Menu.Item label={"Leave conversation"} onPress={() => leaveConvoControl.open()}>
					<Menu.ItemText>Leave conversation</Menu.ItemText>
					<Menu.ItemIcon icon={ArrowBoxLeft} />
				</Menu.Item>
			</Menu.Group>
		</>
	);
}

export { ConvoMenu };
