import { useCallback } from "react";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { useUpdateActorDeclaration } from "#/state/queries/messages/actor-declaration";
import { useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

type AllowIncoming = "all" | "none" | "following";

export function MessagesSettingsScreen() {
	const { currentAccount } = useSession();
	const { data: profile } = useProfileQuery({
		did: currentAccount!.did,
	});

	const { mutate: updateDeclaration } = useUpdateActorDeclaration({
		onError: () => {
			Toast.show("Failed to update settings", "xmark");
		},
	});

	const onSelectMessagesFrom = useCallback(
		(keys: string[]) => {
			const key = keys[0];
			if (!key) return;
			updateDeclaration(key as AllowIncoming);
		},
		[updateDeclaration],
	);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Chat Settings</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<div
					style={{
						padding: 16,
						gap: 12,
					}}
				>
					<Text
						style={{
							fontSize: 18,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						Allow new messages from
					</Text>
					<Toggle.Group
						label={"Allow new messages from"}
						type="radio"
						values={[(profile?.associated?.chat?.allowIncoming as AllowIncoming) ?? "following"]}
						onChange={onSelectMessagesFrom}
					>
						<div>
							<Toggle.Item
								name="all"
								label={"Everyone"}
								style={{
									justifyContent: "space-between",
									paddingTop: 8,
									paddingBottom: 8,
								}}
							>
								<Toggle.LabelText>Everyone</Toggle.LabelText>
								<Toggle.Radio />
							</Toggle.Item>
							<Toggle.Item
								name="following"
								label={"Users I follow"}
								style={{
									justifyContent: "space-between",
									paddingTop: 8,
									paddingBottom: 8,
								}}
							>
								<Toggle.LabelText>Users I follow</Toggle.LabelText>
								<Toggle.Radio />
							</Toggle.Item>
							<Toggle.Item
								name="none"
								label={"No one"}
								style={{
									justifyContent: "space-between",
									paddingTop: 8,
									paddingBottom: 8,
								}}
							>
								<Toggle.LabelText>No one</Toggle.LabelText>
								<Toggle.Radio />
							</Toggle.Item>
						</div>
					</Toggle.Group>
					<Admonition type="tip">
						You can continue ongoing conversations regardless of which setting you choose.
					</Admonition>
				</div>
			</Layout.Content>
		</Layout.Screen>
	);
}
