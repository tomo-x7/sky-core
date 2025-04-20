import { AtUri } from "@atproto/api";
import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useNavigate } from "react-router-dom";
import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import { useEmail } from "#/lib/hooks/useEmail";
import { useModalControls } from "#/state/modals";
import { useSetMinimalShellMode } from "#/state/shell";
import { MyLists } from "#/view/com/lists/MyLists";

export function ListsScreen() {
	const setMinimalShellMode = useSetMinimalShellMode();
	const { openModal } = useModalControls();
	const { needsEmailVerification } = useEmail();
	const control = useDialogControl();
	const navigate = useNavigate();

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
					navigate(`/profile/${urip.hostname}/lists/${urip.rkey}`);
				} catch {}
			},
		});
	}, [needsEmailVerification, control, openModal, navigate]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content align="left">
					<Layout.Header.TitleText>Lists</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Button label={"New list"} color="secondary" variant="solid" size="small" onPress={onPressNewList}>
					<ButtonIcon icon={PlusIcon} />
					<ButtonText>New</ButtonText>
				</Button>
			</Layout.Header.Outer>
			<MyLists filter="curate" style={{ ...a.flex_grow }} />
			<VerifyEmailDialog
				reasonText={"Before creating a list, you must first verify your email."}
				control={control}
			/>
		</Layout.Screen>
	);
}
