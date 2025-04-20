import {
	type AppBskyActorDefs,
	type ModerationOpts,
	type RichText as RichTextAPI,
	moderateProfile,
} from "@atproto/api";
import React, { memo, useMemo } from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { KnownFollowers, shouldShowKnownFollowers } from "#/components/KnownFollowers";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { MessageProfileButton } from "#/components/dms/MessageProfileButton";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import type { Shadow } from "#/state/cache/types";
import { useModalControls } from "#/state/modals";
import { useProfileBlockMutationQueue, useProfileFollowMutationQueue } from "#/state/queries/profile";
import { useRequireAuth, useSession } from "#/state/session";
import { ProfileMenu } from "#/view/com/profile/ProfileMenu";
import * as Toast from "#/view/com/util/Toast";
import { ProfileHeaderDisplayName } from "./DisplayName";
import { EditProfileDialog } from "./EditProfileDialog";
import { ProfileHeaderHandle } from "./Handle";
import { ProfileHeaderMetrics } from "./Metrics";
import { ProfileHeaderShell } from "./Shell";

interface Props {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	descriptionRT: RichTextAPI | null;
	moderationOpts: ModerationOpts;
	hideBackButton?: boolean;
	isPlaceholderProfile?: boolean;
}

let ProfileHeaderStandard = ({
	profile: profileUnshadowed,
	descriptionRT,
	moderationOpts,
	hideBackButton = false,
	isPlaceholderProfile,
}: Props): React.ReactNode => {
	const profile: Shadow<AppBskyActorDefs.ProfileViewDetailed> = useProfileShadow(profileUnshadowed);
	const { currentAccount, hasSession } = useSession();
	const moderation = useMemo(() => moderateProfile(profile, moderationOpts), [profile, moderationOpts]);
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile);
	const [_queueBlock, queueUnblock] = useProfileBlockMutationQueue(profile);
	const unblockPromptControl = Prompt.usePromptControl();
	const requireAuth = useRequireAuth();
	const isBlockedUser = profile.viewer?.blocking || profile.viewer?.blockedBy || profile.viewer?.blockingByList;

	const { openModal } = useModalControls();
	const editProfileControl = useDialogControl();
	const onPressEditProfile = React.useCallback(() => {
		// temp, while we figure out the nested dialog bug
		openModal({
			name: "edit-profile",
			profile,
		});
	}, [openModal, profile]);

	const onPressFollow = () => {
		requireAuth(async () => {
			try {
				await queueFollow();
				Toast.show(
					`Following ${sanitizeDisplayName(
						profile.displayName || profile.handle,
						moderation.ui("displayName"),
					)}`,
				);
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to follow", { message: String(e) });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		});
	};

	const onPressUnfollow = () => {
		requireAuth(async () => {
			try {
				await queueUnfollow();
				Toast.show(
					`No longer following ${sanitizeDisplayName(
						profile.displayName || profile.handle,
						moderation.ui("displayName"),
					)}`,
				);
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to unfollow", { message: String(e) });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		});
	};

	const unblockAccount = React.useCallback(async () => {
		try {
			await queueUnblock();
			Toast.show("Account unblocked");
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				console.error("Failed to unblock account", { message: e });
				Toast.show(`There was an issue! ${e.toString()}`, "xmark");
			}
		}
	}, [queueUnblock]);

	const isMe = React.useMemo(() => currentAccount?.did === profile.did, [currentAccount, profile]);

	return (
		<ProfileHeaderShell
			profile={profile}
			moderation={moderation}
			hideBackButton={hideBackButton}
			isPlaceholderProfile={isPlaceholderProfile}
		>
			<div
				style={{
					paddingLeft: 16,
					paddingRight: 16,
					paddingTop: 12,
					paddingBottom: 8,
					overflow: "hidden",
					pointerEvents: "none",
				}}
			>
				<div
					style={{
						...{ paddingLeft: 90 },
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						gap: 4,
						paddingBottom: 8,
						flexWrap: "wrap",
						pointerEvents: "none",
					}}
				>
					{isMe ? (
						<>
							<Button
								size="small"
								color="secondary"
								variant="solid"
								onPress={onPressEditProfile}
								label={"Edit profile"}
								style={{ borderRadius: 999, pointerEvents: "auto" }}
							>
								<ButtonText>Edit Profile</ButtonText>
							</Button>
							<EditProfileDialog profile={profile} control={editProfileControl} />
						</>
					) : profile.viewer?.blocking ? (
						profile.viewer?.blockingByList ? null : (
							<Button
								size="small"
								color="secondary"
								variant="solid"
								label={"Unblock"}
								disabled={!hasSession}
								onPress={() => unblockPromptControl.open()}
								style={{ borderRadius: 999, pointerEvents: "auto" }}
							>
								<ButtonText>Unblock</ButtonText>
							</Button>
						)
					) : !profile.viewer?.blockedBy ? (
						<>
							{hasSession && <MessageProfileButton profile={profile} />}

							<Button
								size="small"
								color={profile.viewer?.following ? "secondary" : "primary"}
								variant="solid"
								label={
									profile.viewer?.following
										? `Unfollow ${profile.handle}`
										: `Follow ${profile.handle}`
								}
								onPress={profile.viewer?.following ? onPressUnfollow : onPressFollow}
								style={{ borderRadius: 999, pointerEvents: "auto" }}
							>
								<ButtonIcon position="left" icon={profile.viewer?.following ? Check : Plus} />
								<ButtonText>
									{profile.viewer?.following ? (
										<>Following</>
									) : profile.viewer?.followedBy ? (
										<>Follow Back</>
									) : (
										<>Follow</>
									)}
								</ButtonText>
							</Button>
						</>
					) : null}
					<ProfileMenu profile={profile} />
				</div>
				<div
					style={{
						flexDirection: "column",
						gap: 2,
						paddingTop: 2,
						paddingBottom: 8,
						pointerEvents: "auto",
					}}
				>
					<ProfileHeaderDisplayName profile={profile} moderation={moderation} />
					<ProfileHeaderHandle profile={profile} />
				</div>
				{!isPlaceholderProfile && !isBlockedUser && (
					<div style={{ gap: 12, pointerEvents: "auto" }}>
						<ProfileHeaderMetrics profile={profile} />
						{descriptionRT && !moderation.ui("profileView").blur ? (
							<div style={{ pointerEvents: "auto" }}>
								<RichText
									style={{ ...a.text_md }}
									numberOfLines={15}
									value={descriptionRT}
									enableTags
									authorHandle={profile.handle}
								/>
							</div>
						) : undefined}

						{!isMe && !isBlockedUser && shouldShowKnownFollowers(profile.viewer?.knownFollowers) && (
							<div
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 8,
								}}
							>
								<KnownFollowers profile={profile} moderationOpts={moderationOpts} />
							</div>
						)}
					</div>
				)}
			</div>
			<Prompt.Basic
				control={unblockPromptControl}
				title={"Unblock Account?"}
				description={"The account will be able to interact with you after unblocking."}
				onConfirm={unblockAccount}
				confirmButtonCta={profile.viewer?.blocking ? "Unblock" : "Block"}
				confirmButtonColor="negative"
			/>
		</ProfileHeaderShell>
	);
};
ProfileHeaderStandard = memo(ProfileHeaderStandard);
export { ProfileHeaderStandard };
