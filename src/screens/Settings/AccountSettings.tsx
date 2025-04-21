import { useTheme } from "#/alf";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { BirthDateSettingsDialog } from "#/components/dialogs/BirthDateSettings";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { At_Stroke2_Corner2_Rounded as AtIcon } from "#/components/icons/At";
import { BirthdayCake_Stroke2_Corner2_Rounded as BirthdayCakeIcon } from "#/components/icons/BirthdayCake";
import { Car_Stroke2_Corner2_Rounded as CarIcon } from "#/components/icons/Car";
import { Envelope_Stroke2_Corner2_Rounded as EnvelopeIcon } from "#/components/icons/Envelope";
import { Freeze_Stroke2_Corner2_Rounded as FreezeIcon } from "#/components/icons/Freeze";
import { Lock_Stroke2_Corner2_Rounded as LockIcon } from "#/components/icons/Lock";
import { PencilLine_Stroke2_Corner2_Rounded as PencilIcon } from "#/components/icons/Pencil";
import { Trash_Stroke2_Corner2_Rounded } from "#/components/icons/Trash";
import { Verified_Stroke2_Corner2_Rounded as VerifiedIcon } from "#/components/icons/Verified";
import * as SettingsList from "#/screens/Settings/components/SettingsList";
import { useModalControls } from "#/state/modals";
import { useSession } from "#/state/session";
import { ChangeHandleDialog } from "./components/ChangeHandleDialog";
import { DeactivateAccountDialog } from "./components/DeactivateAccountDialog";
import { ExportCarDialog } from "./components/ExportCarDialog";

export function AccountSettingsScreen() {
	const t = useTheme();
	const { currentAccount } = useSession();
	const { openModal } = useModalControls();
	const verifyEmailControl = useDialogControl();
	const birthdayControl = useDialogControl();
	const changeHandleControl = useDialogControl();
	const exportCarControl = useDialogControl();
	const deactivateAccountControl = useDialogControl();

	return (
		<Layout.Screen>
			<Layout.Header.Outer>
				<Layout.Header.BackButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Account</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Layout.Content>
				<SettingsList.Container>
					<SettingsList.Item>
						<SettingsList.ItemIcon icon={EnvelopeIcon} />
						{/* Tricky flexbox situation here: we want the email to truncate, but by default it will make the "Email" text wrap instead.
                For numberOfLines to work, we need flex: 1 on the BadgeText, but that means it goes to width: 50% because the
                ItemText is also flex: 1. So we need to set flex: 0 on the ItemText to prevent it from growing, but if we did that everywhere
                it wouldn't push the BadgeText/Chevron/whatever to the right.
                TODO: find a general solution for this. workaround in this case is to set the ItemText to flex: 1 and BadgeText to flex: 0 -sfn */}
						<SettingsList.ItemText style={{ flex: "0 0 auto" }}>Email</SettingsList.ItemText>
						{currentAccount && (
							<>
								<SettingsList.BadgeText style={{ flex: 1 }}>
									{currentAccount.email || "(no email)"}
								</SettingsList.BadgeText>
								{currentAccount.emailConfirmed && (
									<VerifiedIcon fill={t.palette.primary_500} size="md" />
								)}
							</>
						)}
					</SettingsList.Item>
					{currentAccount && !currentAccount.emailConfirmed && (
						<SettingsList.PressableItem
							label={"Verify your email"}
							onPress={() => verifyEmailControl.open()}
							style={{
								marginTop: 4,
								marginBottom: 4,
								marginLeft: 16,
								marginRight: 16,
								borderRadius: 12,
								...{ backgroundColor: t.palette.primary_50 },
							}}
							hoverStyle={{ backgroundColor: t.palette.primary_100 }}
							contentContainerStyle={{
								borderRadius: 12,
								paddingLeft: 16,
								paddingRight: 16,
							}}
						>
							<SettingsList.ItemIcon icon={VerifiedIcon} color={t.palette.primary_500} />
							<SettingsList.ItemText
								style={{
									...{ color: t.palette.primary_500 },
									fontWeight: "600",
								}}
							>
								Verify your email
							</SettingsList.ItemText>
							<SettingsList.Chevron color={t.palette.primary_500} />
						</SettingsList.PressableItem>
					)}
					<SettingsList.PressableItem
						label={"Change email"}
						onPress={() => openModal({ name: "change-email" })}
					>
						<SettingsList.ItemIcon icon={PencilIcon} />
						<SettingsList.ItemText>Change email</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.Divider />
					<SettingsList.Item>
						<SettingsList.ItemIcon icon={BirthdayCakeIcon} />
						<SettingsList.ItemText>Birthday</SettingsList.ItemText>
						<SettingsList.BadgeButton label={"Edit"} onPress={() => birthdayControl.open()} />
					</SettingsList.Item>
					<SettingsList.PressableItem
						label={"Password"}
						onPress={() => openModal({ name: "change-password" })}
					>
						<SettingsList.ItemIcon icon={LockIcon} />
						<SettingsList.ItemText>Password</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.PressableItem label={"Handle"} onPress={() => changeHandleControl.open()}>
						<SettingsList.ItemIcon icon={AtIcon} />
						<SettingsList.ItemText>Handle</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.Divider />
					<SettingsList.PressableItem label={"Export my data"} onPress={() => exportCarControl.open()}>
						<SettingsList.ItemIcon icon={CarIcon} />
						<SettingsList.ItemText>Export my data</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.PressableItem
						label={"Deactivate account"}
						onPress={() => deactivateAccountControl.open()}
						destructive
					>
						<SettingsList.ItemIcon icon={FreezeIcon} />
						<SettingsList.ItemText>Deactivate account</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
					<SettingsList.PressableItem
						label={"Delete account"}
						onPress={() => openModal({ name: "delete-account" })}
						destructive
					>
						<SettingsList.ItemIcon icon={Trash_Stroke2_Corner2_Rounded} />
						<SettingsList.ItemText>Delete account</SettingsList.ItemText>
						<SettingsList.Chevron />
					</SettingsList.PressableItem>
				</SettingsList.Container>
			</Layout.Content>
			<VerifyEmailDialog control={verifyEmailControl} />
			<BirthDateSettingsDialog control={birthdayControl} />
			<ChangeHandleDialog control={changeHandleControl} />
			<ExportCarDialog control={exportCarControl} />
			<DeactivateAccountDialog control={deactivateAccountControl} />
		</Layout.Screen>
	);
}
