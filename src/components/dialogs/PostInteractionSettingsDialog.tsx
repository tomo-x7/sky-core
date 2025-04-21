import { type AppBskyFeedDefs, type AppBskyFeedPostgate, AtUri } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import isEqual from "lodash.isequal";
import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { STALE } from "#/state/queries";
import { useMyListsQuery } from "#/state/queries/my-lists";
import {
	createPostgateQueryKey,
	getPostgateRecord,
	usePostgateQuery,
	useWritePostgateMutation,
} from "#/state/queries/postgate";
import { createPostgateRecord, embeddingRules } from "#/state/queries/postgate/util";
import {
	type ThreadgateAllowUISetting,
	createThreadgateViewQueryKey,
	getThreadgateView,
	threadgateViewToAllowUISetting,
	useSetThreadgateAllowMutation,
	useThreadgateViewQuery,
} from "#/state/queries/threadgate";
import { useAgent, useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";

export type PostInteractionSettingsFormProps = {
	canSave?: boolean;
	onSave: () => void;
	isSaving?: boolean;

	postgate: AppBskyFeedPostgate.Record;
	onChangePostgate: (v: AppBskyFeedPostgate.Record) => void;

	threadgateAllowUISettings: ThreadgateAllowUISetting[];
	onChangeThreadgateAllowUISettings: (v: ThreadgateAllowUISetting[]) => void;

	replySettingsDisabled?: boolean;
};

export function PostInteractionSettingsControlledDialog({
	control,
	...rest
}: PostInteractionSettingsFormProps & {
	control: Dialog.DialogControlProps;
}) {
	const t = useTheme();

	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner
				label="Edit post interaction settings"
				style={{
					...{ maxWidth: 500 },
					width: "100%",
				}}
			>
				<div style={{ gap: 12 }}>
					<Header />
					<PostInteractionSettingsForm {...rest} />
					<Text
						style={{
							paddingTop: 8,
							fontSize: 14,
							letterSpacing: 0,
							lineHeight: 1.3,
							...t.atoms.text_contrast_medium,
						}}
					>
						<>
							You can set default interaction settings in{" "}
							<Text
								style={{
									fontWeight: "600",
									...t.atoms.text_contrast_medium,
								}}
							>
								Settings &rarr; Moderation &rarr; Interaction settings
							</Text>
							.
						</>
					</Text>
				</div>
				<Dialog.Close />
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}

export function Header() {
	return (
		<div
			style={{
				gap: 12,
				paddingBottom: 8,
			}}
		>
			<Text
				style={{
					fontSize: 22,
					letterSpacing: 0,
					fontWeight: "600",
				}}
			>
				Post interaction settings
			</Text>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					paddingBottom: 4,
				}}
			>
				Customize who can interact with this post.
			</Text>
			<Divider />
		</div>
	);
}

export type PostInteractionSettingsDialogProps = {
	control: Dialog.DialogControlProps;
	/**
	 * URI of the post to edit the interaction settings for. Could be a root post
	 * or could be a reply.
	 */
	postUri: string;
	/**
	 * The URI of the root post in the thread. Used to determine if the viewer
	 * owns the threadgate record and can therefore edit it.
	 */
	rootPostUri: string;
	/**
	 * Optional initial {@link AppBskyFeedDefs.ThreadgateView} to use if we
	 * happen to have one before opening the settings dialog.
	 */
	initialThreadgateView?: AppBskyFeedDefs.ThreadgateView;
};

export function PostInteractionSettingsDialog(props: PostInteractionSettingsDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<PostInteractionSettingsDialogControlledInner {...props} />
		</Dialog.Outer>
	);
}

export function PostInteractionSettingsDialogControlledInner(props: PostInteractionSettingsDialogProps) {
	const { currentAccount } = useSession();
	const [isSaving, setIsSaving] = React.useState(false);

	const { data: threadgateViewLoaded, isLoading: isLoadingThreadgate } = useThreadgateViewQuery({
		postUri: props.rootPostUri,
	});
	const { data: postgate, isLoading: isLoadingPostgate } = usePostgateQuery({
		postUri: props.postUri,
	});

	const { mutateAsync: writePostgateRecord } = useWritePostgateMutation();
	const { mutateAsync: setThreadgateAllow } = useSetThreadgateAllowMutation();

	const [editedPostgate, setEditedPostgate] = React.useState<AppBskyFeedPostgate.Record>();
	const [editedAllowUISettings, setEditedAllowUISettings] = React.useState<ThreadgateAllowUISetting[]>();

	const isLoading = isLoadingThreadgate || isLoadingPostgate;
	const threadgateView = threadgateViewLoaded || props.initialThreadgateView;
	const isThreadgateOwnedByViewer = React.useMemo(() => {
		return currentAccount?.did === new AtUri(props.rootPostUri).host;
	}, [props.rootPostUri, currentAccount?.did]);

	const postgateValue = React.useMemo(() => {
		return editedPostgate || postgate || createPostgateRecord({ post: props.postUri });
	}, [postgate, editedPostgate, props.postUri]);
	const allowUIValue = React.useMemo(() => {
		return editedAllowUISettings || threadgateViewToAllowUISetting(threadgateView);
	}, [threadgateView, editedAllowUISettings]);

	const onSave = React.useCallback(async () => {
		if (!editedPostgate && !editedAllowUISettings) {
			props.control.close();
			return;
		}

		setIsSaving(true);

		try {
			const requests = [];

			if (editedPostgate) {
				requests.push(
					writePostgateRecord({
						postUri: props.postUri,
						postgate: editedPostgate,
					}),
				);
			}

			if (editedAllowUISettings && isThreadgateOwnedByViewer) {
				requests.push(
					setThreadgateAllow({
						postUri: props.rootPostUri,
						allow: editedAllowUISettings,
					}),
				);
			}

			await Promise.all(requests);

			props.control.close();
		} catch (e: unknown) {
			console.error("Failed to save post interaction settings", {
				source: "PostInteractionSettingsDialogControlledInner",
				safeMessage: (e as { message: string }).message,
			});
			Toast.show("There was an issue. Please check your internet connection and try again.", "xmark");
		} finally {
			setIsSaving(false);
		}
	}, [
		props.postUri,
		props.rootPostUri,
		props.control,
		editedPostgate,
		editedAllowUISettings,
		writePostgateRecord,
		setThreadgateAllow,
		isThreadgateOwnedByViewer,
	]);

	return (
		<Dialog.ScrollableInner
			label="Edit post interaction settings"
			style={{
				...{ maxWidth: 500 },
				width: "100%",
			}}
		>
			<div style={{ gap: 12 }}>
				<Header />

				{isLoading ? (
					<div
						style={{
							flex: 1,
							paddingTop: 32,
							paddingBottom: 32,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Loader size="xl" />
					</div>
				) : (
					<PostInteractionSettingsForm
						replySettingsDisabled={!isThreadgateOwnedByViewer}
						isSaving={isSaving}
						onSave={onSave}
						postgate={postgateValue}
						onChangePostgate={setEditedPostgate}
						threadgateAllowUISettings={allowUIValue}
						onChangeThreadgateAllowUISettings={setEditedAllowUISettings}
					/>
				)}
			</div>
		</Dialog.ScrollableInner>
	);
}

export function PostInteractionSettingsForm({
	canSave = true,
	onSave,
	isSaving,
	postgate,
	onChangePostgate,
	threadgateAllowUISettings,
	onChangeThreadgateAllowUISettings,
	replySettingsDisabled,
}: PostInteractionSettingsFormProps) {
	const t = useTheme();
	const { data: lists } = useMyListsQuery("curate");
	const [quotesEnabled, setQuotesEnabled] = React.useState(
		!postgate.embeddingRules?.find((v) => v.$type === embeddingRules.disableRule.$type),
	);

	const onPressAudience = (setting: ThreadgateAllowUISetting) => {
		// remove boolean values
		const newSelected: ThreadgateAllowUISetting[] = threadgateAllowUISettings.filter(
			(v) => v.type !== "nobody" && v.type !== "everybody",
		);
		// toggle
		const i = newSelected.findIndex((v) => isEqual(v, setting));
		if (i === -1) {
			newSelected.push(setting);
		} else {
			newSelected.splice(i, 1);
		}
		if (newSelected.length === 0) {
			newSelected.push({ type: "everybody" });
		}

		onChangeThreadgateAllowUISettings(newSelected);
	};

	const onChangeQuotesEnabled = React.useCallback(
		(enabled: boolean) => {
			setQuotesEnabled(enabled);
			onChangePostgate(
				createPostgateRecord({
					...postgate,
					embeddingRules: enabled ? [] : [embeddingRules.disableRule],
				}),
			);
		},
		[postgate, onChangePostgate],
	);

	const noOneCanReply = !!threadgateAllowUISettings.find((v) => v.type === "nobody");

	return (
		<div>
			<div
				style={{
					flex: 1,
					gap: 12,
				}}
			>
				<div style={{ gap: 16 }}>
					<div style={{ gap: 8 }}>
						<Text
							style={{
								fontWeight: "600",
								fontSize: 18,
								letterSpacing: 0,
							}}
						>
							Quote settings
						</Text>

						<Toggle.Item
							name="quoteposts"
							type="checkbox"
							label={
								quotesEnabled
									? "Click to disable quote posts of this post."
									: "Click to enable quote posts of this post."
							}
							value={quotesEnabled}
							onChange={onChangeQuotesEnabled}
							style={{
								justifyContent: "space-between",
								paddingTop: 4,
							}}
						>
							<Text style={t.atoms.text_contrast_medium}>Allow quote posts</Text>
							<Toggle.Switch />
						</Toggle.Item>
					</div>

					<Divider />

					{replySettingsDisabled && (
						<div
							style={{
								paddingLeft: 12,
								paddingRight: 12,
								paddingTop: 8,
								paddingBottom: 8,
								borderRadius: 8,
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								...t.atoms.bg_contrast_25,
							}}
						>
							<CircleInfo fill={t.atoms.text_contrast_low.color} />
							<Text
								style={{
									flex: 1,
									lineHeight: 1.3,
									...t.atoms.text_contrast_medium,
								}}
							>
								Reply settings are chosen by the author of the thread
							</Text>
						</div>
					)}

					<div
						style={{
							gap: 8,

							...{
								opacity: replySettingsDisabled ? 0.3 : 1,
							},
						}}
					>
						<Text
							style={{
								fontWeight: "600",
								fontSize: 18,
								letterSpacing: 0,
							}}
						>
							Reply settings
						</Text>

						<Text
							style={{
								paddingTop: 8,
								...t.atoms.text_contrast_medium,
							}}
						>
							Allow replies from:
						</Text>

						<div
							style={{
								flexDirection: "row",
								gap: 8,
							}}
						>
							<Selectable
								label="Everybody"
								isSelected={!!threadgateAllowUISettings.find((v) => v.type === "everybody")}
								onPress={() => onChangeThreadgateAllowUISettings([{ type: "everybody" }])}
								style={{ flex: 1 }}
								disabled={replySettingsDisabled}
							/>
							<Selectable
								label="Nobody"
								isSelected={noOneCanReply}
								onPress={() => onChangeThreadgateAllowUISettings([{ type: "nobody" }])}
								style={{ flex: 1 }}
								disabled={replySettingsDisabled}
							/>
						</div>

						{!noOneCanReply && (
							<>
								<Text
									style={{
										paddingTop: 8,
										...t.atoms.text_contrast_medium,
									}}
								>
									Or combine these options:
								</Text>

								<div style={{ gap: 8 }}>
									<Selectable
										label="Mentioned users"
										isSelected={!!threadgateAllowUISettings.find((v) => v.type === "mention")}
										onPress={() => onPressAudience({ type: "mention" })}
										disabled={replySettingsDisabled}
									/>
									<Selectable
										label="Users you follow"
										isSelected={!!threadgateAllowUISettings.find((v) => v.type === "following")}
										onPress={() => onPressAudience({ type: "following" })}
										disabled={replySettingsDisabled}
									/>
									<Selectable
										label="Your followers"
										isSelected={!!threadgateAllowUISettings.find((v) => v.type === "followers")}
										onPress={() => onPressAudience({ type: "followers" })}
										disabled={replySettingsDisabled}
									/>
									{lists && lists.length > 0
										? lists.map((list) => (
												<Selectable
													key={list.uri}
													label={`Users in "${list.name}"`}
													isSelected={
														!!threadgateAllowUISettings.find(
															(v) => v.type === "list" && v.list === list.uri,
														)
													}
													onPress={() => onPressAudience({ type: "list", list: list.uri })}
													disabled={replySettingsDisabled}
												/>
											))
										: // No loading states to avoid jumps for the common case (no lists)
											null}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			<Button
				disabled={!canSave || isSaving}
				label="Save"
				onPress={onSave}
				color="primary"
				size="large"
				variant="solid"
				style={{ marginTop: 20 }}
			>
				<ButtonText>"Save"</ButtonText>
				{isSaving && <ButtonIcon icon={Loader} position="right" />}
			</Button>
		</div>
	);
}

function Selectable({
	label,
	isSelected,
	onPress,
	style,
	disabled,
}: {
	label: string;
	isSelected: boolean;
	onPress: () => void;
	style?: React.CSSProperties;
	disabled?: boolean;
}) {
	const t = useTheme();
	return (
		<Button
			disabled={disabled}
			onPress={onPress}
			label={label}
			// accessibilityRole="checkbox"
			aria-checked={isSelected}
			style={{ flex: 1 }}
		>
			{({ hovered, focused }) => (
				<div
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						borderRadius: 8,
						padding: 12,

						...// for consistency with checkmark icon visible or not
						{ minHeight: 40 },

						...t.atoms.bg_contrast_50,
						...((hovered || focused) && t.atoms.bg_contrast_100),

						...(isSelected && {
							backgroundColor: t.palette.primary_100,
						}),

						...style,
					}}
				>
					<Text
						style={{
							fontSize: 14,
							letterSpacing: 0,
							fontWeight: isSelected ? "600" : undefined,
						}}
					>
						{label}
					</Text>
					{isSelected ? <Check size="sm" fill={t.palette.primary_500} /> : <div />}
				</div>
			)}
		</Button>
	);
}

export function usePrefetchPostInteractionSettings({
	postUri,
	rootPostUri,
}: {
	postUri: string;
	rootPostUri: string;
}) {
	const queryClient = useQueryClient();
	const agent = useAgent();

	return React.useCallback(async () => {
		try {
			await Promise.all([
				queryClient.prefetchQuery({
					queryKey: createPostgateQueryKey(postUri),
					queryFn: () => getPostgateRecord({ agent, postUri }),
					staleTime: STALE.SECONDS.THIRTY,
				}),
				queryClient.prefetchQuery({
					queryKey: createThreadgateViewQueryKey(rootPostUri),
					queryFn: () => getThreadgateView({ agent, postUri: rootPostUri }),
					staleTime: STALE.SECONDS.THIRTY,
				}),
			]);
		} catch (e: unknown) {
			console.error("Failed to prefetch post interaction settings", {
				safeMessage: (e as { message: unknown }).message,
			});
		}
	}, [queryClient, agent, postUri, rootPostUri]);
}
