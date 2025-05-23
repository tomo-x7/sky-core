import { ComAtprotoModerationDefs } from "@atproto/api";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

export function ChatDisabled() {
	const t = useTheme();
	return (
		<div style={{ padding: 12 }}>
			<div
				style={{
					alignItems: "flex-start",
					padding: 20,
					borderRadius: 12,
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						fontWeight: "600",
						paddingBottom: 8,
						...t.atoms.text_contrast_high,
					}}
				>
					Your chats have been disabled
				</Text>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: 0,
						lineHeight: 1.3,
						...t.atoms.text_contrast_medium,
					}}
				>
					Our moderators have reviewed reports and decided to disable your access to chats on Bluesky.
				</Text>
				<AppealDialog />
			</div>
		</div>
	);
}

function AppealDialog() {
	const control = Dialog.useDialogControl();

	return (
		<>
			<Button
				variant="ghost"
				color="secondary"
				size="small"
				onPress={control.open}
				label={"Appeal this decision"}
				style={{ marginTop: 8 }}
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
			<Text
				style={{
					fontSize: 22,
					letterSpacing: 0,
					fontWeight: "600",
					paddingBottom: 4,
					lineHeight: 1.15,
				}}
			>
				Appeal this decision
			</Text>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					lineHeight: 1.3,
				}}
			>
				This appeal will be sent to Bluesky's moderation service.
			</Text>
			<div style={{ marginTop: 12, marginBottom: 12 }}>
				<Dialog.Input
					label={"Text input field"}
					placeholder={"Please explain why you think your chats were incorrectly disabled"}
					value={details}
					onChangeText={setDetails}
					autoFocus={true}
					// TODO
					// numberOfLines={3}
					multiline
					maxLength={300}
				/>
			</div>
			<div
				style={{
					flexDirection: gtMobile ? "row" : "column",
					justifyContent: gtMobile ? "space-between" : undefined,
					gap: gtMobile ? undefined : 8,
				}}
			>
				<Button variant="solid" color="secondary" size="large" onPress={onBack} label={"Back"}>
					<ButtonText>{"Back"}</ButtonText>
				</Button>
				<Button variant="solid" color="primary" size="large" onPress={onSubmit} label={"Submit"}>
					<ButtonText>{"Submit"}</ButtonText>
					{isPending && <ButtonIcon icon={Loader} />}
				</Button>
			</div>
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
