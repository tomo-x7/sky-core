import type { ComAtprotoServerListAppPasswords } from "@atproto/api";
import { useCallback } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Admonition, colors } from "#/components/Admonition";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { PlusLarge_Stroke2_Corner0_Rounded as PlusIcon } from "#/components/icons/Plus";
import { Trash_Stroke2_Corner0_Rounded as TrashIcon } from "#/components/icons/Trash";
import { Warning_Stroke2_Corner0_Rounded as WarningIcon } from "#/components/icons/Warning";
import { cleanError } from "#/lib/strings/errors";
import { useAppPasswordDeleteMutation, useAppPasswordsQuery } from "#/state/queries/app-passwords";
import { EmptyState } from "#/view/com/util/EmptyState";
import * as Toast from "#/view/com/util/Toast";
import { ErrorScreen } from "#/view/com/util/error/ErrorScreen";
import { AddAppPasswordDialog } from "./components/AddAppPasswordDialog";
import * as SettingsList from "./components/SettingsList";

export function AppPasswordsScreen() {
	const { data: appPasswords, error } = useAppPasswordsQuery();
	const createAppPasswordControl = useDialogControl();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>App Passwords</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				{error ? (
					<ErrorScreen
						title={"Oops!"}
						message={"There was an issue fetching your app passwords"}
						details={cleanError(error)}
					/>
				) : (
					<SettingsList.Container>
						<SettingsList.Item>
							<Admonition type="tip" style={{ flex: 1 }}>
								Use app passwords to sign in to other Bluesky clients without giving full access to your
								account or password.
							</Admonition>
						</SettingsList.Item>
						<SettingsList.Item>
							<Button
								label={"Add App Password"}
								size="large"
								color="primary"
								variant="solid"
								onPress={() => createAppPasswordControl.open()}
								style={{ flex: 1 }}
							>
								<ButtonIcon icon={PlusIcon} />
								<ButtonText>Add App Password</ButtonText>
							</Button>
						</SettingsList.Item>
						<SettingsList.Divider />
						<div
						// LayoutAnimationConfig
						// skipEntering
						// skipExiting
						>
							{appPasswords ? (
								appPasswords.length > 0 ? (
									<div style={{ ...a.overflow_hidden }}>
										{appPasswords.map((appPassword) => (
											<div
												// Animated.View
												key={appPassword.name}
												style={{ ...a.w_full }}
												// entering={FadeIn}
												// exiting={FadeOut}
												// layout={LinearTransition.delay(150)}
											>
												<SettingsList.Item>
													<AppPasswordCard appPassword={appPassword} />
												</SettingsList.Item>
											</div>
										))}
									</div>
								) : (
									<EmptyState icon="growth" message={"No app passwords yet"} />
								)
							) : (
								<div
									style={{
										flex: 1,
										justifyContent: "center",
										alignItems: "center",
										paddingTop: 32,
										paddingBottom: 32,
									}}
								>
									<Loader size="xl" />
								</div>
							)}
						</div>
					</SettingsList.Container>
				)}
			</Layout.Content>
			<AddAppPasswordDialog
				control={createAppPasswordControl}
				passwords={appPasswords?.map((p) => p.name) || []}
			/>
		</Layout.Screen>
	);
}

function AppPasswordCard({
	appPassword,
}: {
	appPassword: ComAtprotoServerListAppPasswords.AppPassword;
}) {
	const t = useTheme();
	const deleteControl = Prompt.usePromptControl();
	const { mutateAsync: deleteMutation } = useAppPasswordDeleteMutation();

	const onDelete = useCallback(async () => {
		await deleteMutation({ name: appPassword.name });
		Toast.show("App password deleted");
	}, [deleteMutation, appPassword.name]);

	return (
		<div
			style={{
				width: "100%",
				border: "1px solid black",
				borderWidth: 1,
				borderRadius: 8,
				paddingLeft: 12,
				paddingRight: 12,
				paddingTop: 8,
				paddingBottom: 8,
				...t.atoms.bg_contrast_25,
				...t.atoms.border_contrast_low,
			}}
		>
			<div
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "flex-start",
					width: "100%",
					gap: 8,
				}}
			>
				<div style={{ gap:4 }}>
					<Text
						style={{
							...t.atoms.text,
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
						}}
					>
						{appPassword.name}
					</Text>
					<Text style={t.atoms.text_contrast_medium}>
						<>
							Created{" "}
							{new Date(appPassword.createdAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "numeric",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</>
					</Text>
				</div>
				<Button
					label={"Delete app password"}
					variant="ghost"
					color="negative"
					size="small"
					style={{ ...a.bg_transparent }}
					onPress={() => deleteControl.open()}
				>
					<ButtonIcon icon={TrashIcon} />
				</Button>
			</div>
			{appPassword.privileged && (
				<div
					style={{
						flexDirection: "row",
						gap: 8,
						alignItems: "center",
						marginTop: 12,
					}}
				>
					<WarningIcon style={{ color: colors.warning[t.scheme] }} />
					<Text style={t.atoms.text_contrast_high}>Allows access to direct messages</Text>
				</div>
			)}
			<Prompt.Basic
				control={deleteControl}
				title={"Delete app password?"}
				description={`Are you sure you want to delete the app password "${appPassword.name}"?`}
				onConfirm={onDelete}
				confirmButtonCta={"Delete"}
				confirmButtonColor="negative"
			/>
		</div>
	);
}
