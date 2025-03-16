import { type ChatBskyConvoDefs, RichText } from "@atproto/api";
// import * as Clipboard from "expo-clipboard";
import React from "react";
import { LayoutAnimation, Pressable, View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { usePromptControl } from "#/components/Prompt";
import { ReportDialog } from "#/components/dms/ReportDialog";
import { BubbleQuestion_Stroke2_Corner0_Rounded as Translate } from "#/components/icons/Bubble";
import { DotGrid_Stroke2_Corner0_Rounded as DotsHorizontal } from "#/components/icons/DotGrid";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { Warning_Stroke2_Corner0_Rounded as Warning } from "#/components/icons/Warning";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { richTextToString } from "#/lib/strings/rich-text-helpers";
import { getTranslatorLink } from "#/locale/helpers";
import { useConvoActive } from "#/state/messages/convo";
import { useLanguagePrefs } from "#/state/preferences";
import { useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";
import { Clipboard_Stroke2_Corner2_Rounded as ClipboardIcon } from "../icons/Clipboard";

export let MessageMenu = ({
	message,
	control,
	triggerOpacity,
}: {
	triggerOpacity?: number;
	message: ChatBskyConvoDefs.MessageView;
	control: Menu.MenuControlProps;
}): React.ReactNode => {
	const t = useTheme();
	const { currentAccount } = useSession();
	const convo = useConvoActive();
	const deleteControl = usePromptControl();
	const reportControl = usePromptControl();
	const langPrefs = useLanguagePrefs();
	const openLink = useOpenLink();

	const isFromSelf = message.sender?.did === currentAccount?.did;

	const onCopyMessage = React.useCallback(() => {
		const str = richTextToString(
			new RichText({
				text: message.text,
				facets: message.facets,
			}),
			true,
		);

		new Clipboard().writeText(str);
		Toast.show("Copied to clipboard", "clipboard-check");
	}, [message.text, message.facets]);

	const onPressTranslateMessage = React.useCallback(() => {
		const translatorUrl = getTranslatorLink(message.text, langPrefs.primaryLanguage);
		openLink(translatorUrl, true);
	}, [langPrefs.primaryLanguage, message.text, openLink]);

	const onDelete = React.useCallback(() => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		convo
			.deleteMessage(message.id)
			.then(() => Toast.show("Message deleted"))
			.catch(() => Toast.show("Failed to delete message"));
	}, [convo, message.id]);

	return (
		<>
			<Menu.Root control={control}>
				<View style={{ opacity: triggerOpacity }}>
					<Menu.Trigger label={"Chat settings"}>
						{({ props, state }) => (
							<Pressable
								{...props}
								style={{
									...a.p_sm,
									...a.rounded_full,
									...((state.hovered || state.pressed) && t.atoms.bg_contrast_25),
								}}
							>
								<DotsHorizontal size="md" style={t.atoms.text} />
							</Pressable>
						)}
					</Menu.Trigger>
				</View>

				<Menu.Outer>
					{message.text.length > 0 && (
						<>
							<Menu.Group>
								<Menu.Item
									testID="messageDropdownTranslateBtn"
									label={"Translate"}
									onPress={onPressTranslateMessage}
								>
									<Menu.ItemText>{"Translate"}</Menu.ItemText>
									<Menu.ItemIcon icon={Translate} position="right" />
								</Menu.Item>
								<Menu.Item
									testID="messageDropdownCopyBtn"
									label={"Copy message text"}
									onPress={onCopyMessage}
								>
									<Menu.ItemText>{"Copy message text"}</Menu.ItemText>
									<Menu.ItemIcon icon={ClipboardIcon} position="right" />
								</Menu.Item>
							</Menu.Group>
							<Menu.Divider />
						</>
					)}
					<Menu.Group>
						<Menu.Item
							testID="messageDropdownDeleteBtn"
							label={"Delete message for me"}
							onPress={() => deleteControl.open()}
						>
							<Menu.ItemText>{"Delete for me"}</Menu.ItemText>
							<Menu.ItemIcon icon={Trash} position="right" />
						</Menu.Item>
						{!isFromSelf && (
							<Menu.Item
								testID="messageDropdownReportBtn"
								label={"Report message"}
								onPress={() => reportControl.open()}
							>
								<Menu.ItemText>{"Report"}</Menu.ItemText>
								<Menu.ItemIcon icon={Warning} position="right" />
							</Menu.Item>
						)}
					</Menu.Group>
				</Menu.Outer>
			</Menu.Root>
			<ReportDialog
				currentScreen="conversation"
				params={{ type: "convoMessage", convoId: convo.convo.id, message }}
				control={reportControl}
			/>
			<Prompt.Basic
				control={deleteControl}
				title={"Delete message"}
				description={
					"Are you sure you want to delete this message? The message will be deleted for you, but not for the other participant."
				}
				confirmButtonCta={"Delete"}
				confirmButtonColor="negative"
				onConfirm={onDelete}
			/>
		</>
	);
};
MessageMenu = React.memo(MessageMenu);
