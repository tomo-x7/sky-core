import deepEqual from "lodash.isequal";
import React from "react";

import { useGutters } from "#/alf";
import { Admonition } from "#/components/Admonition";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { PostInteractionSettingsForm } from "#/components/dialogs/PostInteractionSettingsDialog";
import { usePostInteractionSettingsMutation } from "#/state/queries/post-interaction-settings";
import { createPostgateRecord } from "#/state/queries/postgate/util";
import { type UsePreferencesQueryResponse, usePreferencesQuery } from "#/state/queries/preferences";
import {
	threadgateAllowUISettingToAllowRecordValue,
	threadgateRecordToAllowUISetting,
} from "#/state/queries/threadgate";
import * as Toast from "#/view/com/util/Toast";

export function Screen() {
	const gutters = useGutters(["base"]);
	const { data: preferences } = usePreferencesQuery();
	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Post Interaction Settings</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<div
					style={{
						...gutters,
						gap: 20,
					}}
				>
					<Admonition type="tip">
						The following settings will be used as your defaults when creating new posts. You can edit these
						for a specific post from the composer.
					</Admonition>
					{preferences ? (
						<Inner preferences={preferences} />
					) : (
						<div
							style={{
								...gutters,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Loader size="xl" />
						</div>
					)}
				</div>
			</Layout.Content>
		</Layout.Screen>
	);
}

function Inner({ preferences }: { preferences: UsePreferencesQueryResponse }) {
	const { mutateAsync: setPostInteractionSettings, isPending } = usePostInteractionSettingsMutation();
	const [error, setError] = React.useState<string | undefined>(undefined);

	const allowUI = React.useMemo(() => {
		return threadgateRecordToAllowUISetting({
			$type: "app.bsky.feed.threadgate",
			post: "",
			createdAt: new Date().toString(),
			allow: preferences.postInteractionSettings.threadgateAllowRules,
		});
	}, [preferences.postInteractionSettings.threadgateAllowRules]);
	const postgate = React.useMemo(() => {
		return createPostgateRecord({
			post: "",
			embeddingRules: preferences.postInteractionSettings.postgateEmbeddingRules,
		});
	}, [preferences.postInteractionSettings.postgateEmbeddingRules]);

	const [maybeEditedAllowUI, setAllowUI] = React.useState(allowUI);
	const [maybeEditedPostgate, setEditedPostgate] = React.useState(postgate);

	const wasEdited = React.useMemo(() => {
		return (
			!deepEqual(allowUI, maybeEditedAllowUI) ||
			!deepEqual(postgate.embeddingRules, maybeEditedPostgate.embeddingRules)
		);
	}, [postgate, allowUI, maybeEditedAllowUI, maybeEditedPostgate]);

	const onSave = React.useCallback(async () => {
		setError("");

		try {
			await setPostInteractionSettings({
				threadgateAllowRules: threadgateAllowUISettingToAllowRecordValue(maybeEditedAllowUI),
				postgateEmbeddingRules: maybeEditedPostgate.embeddingRules ?? [],
			});
			Toast.show("Settings saved");
		} catch (e: any) {
			console.error("Failed to save post interaction settings", {
				source: "ModerationInteractionSettingsScreen",
				safeMessage: e.message,
			});
			setError("Failed to save settings. Please try again.");
		}
	}, [maybeEditedPostgate, maybeEditedAllowUI, setPostInteractionSettings]);

	return (
		<>
			<PostInteractionSettingsForm
				canSave={wasEdited}
				isSaving={isPending}
				onSave={onSave}
				postgate={maybeEditedPostgate}
				onChangePostgate={setEditedPostgate}
				threadgateAllowUISettings={maybeEditedAllowUI}
				onChangeThreadgateAllowUISettings={setAllowUI}
			/>

			{error && <Admonition type="error">{error}</Admonition>}
		</>
	);
}
