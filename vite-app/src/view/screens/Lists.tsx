import { AtUri } from "@atproto/api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import { useEmail } from "#/lib/hooks/useEmail";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import type { NavigationProp } from "#/lib/routes/types";
import { useModalControls } from "#/state/modals";
import { useSetMinimalShellMode } from "#/state/shell";
import { MyLists } from "#/view/com/lists/MyLists";

type Props = NativeStackScreenProps<CommonNavigatorParams, "Lists">;
export function ListsScreen(props: Props) {
	const setMinimalShellMode = useSetMinimalShellMode();
	const navigation = useNavigation<NavigationProp>();
	const { openModal } = useModalControls();
	const { needsEmailVerification } = useEmail();
	const control = useDialogControl();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onPressNewList = React.useCallback(() => {
		if (needsEmailVerification) {
			control.open();
			return;
		}

		openModal({
			name: "create-or-edit-list",
			purpose: "app.bsky.graph.defs#curatelist",
			onSave: (uri: string) => {
				try {
					const urip = new AtUri(uri);
					navigation.navigate("ProfileList", {
						name: urip.hostname,
						rkey: urip.rkey,
					});
				} catch {}
			},
		});
	}, [needsEmailVerification, control, openModal, navigation]);

	return (
		<Layout.Screen testID="listsScreen">
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content align="left">
					<Layout.Header.TitleText>Lists</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Button
					label={"New list"}
					testID="newUserListBtn"
					color="secondary"
					variant="solid"
					size="small"
					onPress={onPressNewList}
				>
					<ButtonIcon icon={PlusIcon} />
					<ButtonText>
						New
					</ButtonText>
				</Button>
			</Layout.Header.Outer>
			<MyLists filter="curate" style={a.flex_grow} />
			<VerifyEmailDialog
				reasonText={"Before creating a list, you must first verify your email."}
				control={control}
			/>
		</Layout.Screen>
	);
}
