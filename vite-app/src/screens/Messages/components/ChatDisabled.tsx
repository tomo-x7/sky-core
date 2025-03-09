import { ComAtprotoModerationDefs } from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { View } from "react-native";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

export function ChatDisabled() {
	const t = useTheme();
	return (
		<View style={[a.p_md]}>
			<View style={[a.align_start, a.p_xl, a.rounded_md, t.atoms.bg_contrast_25]}>
				<Text style={[a.text_md, a.font_bold, a.pb_sm, t.atoms.text_contrast_high]}>
					Your chats have been disabled
				</Text>
				<Text style={[a.text_sm, a.leading_snug, t.atoms.text_contrast_medium]}>
					Our moderators have reviewed reports and decided to disable your access to chats on Bluesky.
				</Text>
				<AppealDialog />
			</View>
		</View>
	);
}

function AppealDialog() {
	const control = Dialog.useDialogControl();

	return (
		<>
			<Button
				testID="appealDisabledChatBtn"
				variant="ghost"
				color="secondary"
				size="small"
				onPress={control.open}
				label={"Appeal this decision"}
				style={a.mt_sm}
			>
				<ButtonText>{"Appeal this decision"}</ButtonText>
			</Button>

			<Dialog.Outer control={control}>
				<Dialog.Handle />
				<DialogInner />
			</Dialog.Outer>
		</>
	);
}

function DialogInner() {
	const control = Dialog.useDialogContext();
	const [details, setDetails] = useState("");
	const { gtMobile } = useBreakpoints();
	const agent = useAgent();
	const { currentAccount } = useSession();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!currentAccount) throw new Error("No current account, should be unreachable");
			await agent.createModerationReport({
				reasonType: ComAtprotoModerationDefs.REASONAPPEAL,
				subject: {
					$type: "com.atproto.admin.defs#repoRef",
					did: currentAccount.did,
				},
				reason: details,
			});
		},
		onError: (err) => {
			console.error("Failed to submit chat appeal", { message: err });
			Toast.show("Failed to submit appeal, please try again.", "xmark");
		},
		onSuccess: () => {
			control.close();
			Toast.show("Appeal submitted");
		},
	});

	const onSubmit = useCallback(() => mutate(), [mutate]);
	const onBack = useCallback(() => control.close(), [control]);

	return (
		<Dialog.ScrollableInner label={"Appeal this decision"}>
			<Text style={[a.text_2xl, a.font_bold, a.pb_xs, a.leading_tight]}>Appeal this decision</Text>
			<Text style={[a.text_md, a.leading_snug]}>This appeal will be sent to Bluesky's moderation service.</Text>
			<View style={[a.my_md]}>
				<Dialog.Input
					label={"Text input field"}
					placeholder={"Please explain why you think your chats were incorrectly disabled"}
					value={details}
					onChangeText={setDetails}
					autoFocus={true}
					numberOfLines={3}
					multiline
					maxLength={300}
				/>
			</View>

			<View style={gtMobile ? [a.flex_row, a.justify_between] : [{ flexDirection: "column-reverse" }, a.gap_sm]}>
				<Button testID="backBtn" variant="solid" color="secondary" size="large" onPress={onBack} label={"Back"}>
					<ButtonText>{"Back"}</ButtonText>
				</Button>
				<Button
					testID="submitBtn"
					variant="solid"
					color="primary"
					size="large"
					onPress={onSubmit}
					label={"Submit"}
				>
					<ButtonText>{"Submit"}</ButtonText>
					{isPending && <ButtonIcon icon={Loader} />}
				</Button>
			</View>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
