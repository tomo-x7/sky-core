import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback } from "react";

import { atoms as a } from "#/alf";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import type { CommonNavigatorParams } from "#/lib/routes/types";
import { useUpdateActorDeclaration } from "#/state/queries/messages/actor-declaration";
import { useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

type AllowIncoming = "all" | "none" | "following";

type Props = NativeStackScreenProps<CommonNavigatorParams, "MessagesSettings">;
export function MessagesSettingsScreen(props: Props) {
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
						...a.p_lg,
						...a.gap_md,
					}}
				>
					<Text
						style={{
							...a.text_lg,
							...a.font_bold,
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
									...a.justify_between,
									...a.py_sm,
								}}
							>
								<Toggle.LabelText>Everyone</Toggle.LabelText>
								<Toggle.Radio />
							</Toggle.Item>
							<Toggle.Item
								name="following"
								label={"Users I follow"}
								style={{
									...a.justify_between,
									...a.py_sm,
								}}
							>
								<Toggle.LabelText>Users I follow</Toggle.LabelText>
								<Toggle.Radio />
							</Toggle.Item>
							<Toggle.Item
								name="none"
								label={"No one"}
								style={{
									...a.justify_between,
									...a.py_sm,
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
