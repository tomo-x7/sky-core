import type { AppBskyActorDefs } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { memo } from "react";

import { useNavigate } from "react-router-dom";
import { Button, ButtonIcon } from "#/components/Button";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as Share } from "#/components/icons/ArrowOutOfBox";
import { DotGrid_Stroke2_Corner0_Rounded as Ellipsis } from "#/components/icons/DotGrid";
import { Flag_Stroke2_Corner0_Rounded as Flag } from "#/components/icons/Flag";
import { ListSparkle_Stroke2_Corner0_Rounded as List } from "#/components/icons/ListSparkle";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as SearchIcon } from "#/components/icons/MagnifyingGlass2";
import { Mute_Stroke2_Corner0_Rounded as Mute } from "#/components/icons/Mute";
import { PeopleRemove2_Stroke2_Corner0_Rounded as UserMinus } from "#/components/icons/PeopleRemove2";
import {
	PersonCheck_Stroke2_Corner0_Rounded as PersonCheck,
	PersonX_Stroke2_Corner0_Rounded as PersonX,
} from "#/components/icons/Person";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { SpeakerVolumeFull_Stroke2_Corner0_Rounded as Unmute } from "#/components/icons/Speaker";
import { ReportDialog, useReportDialogControl } from "#/components/moderation/ReportDialog";
import { HITSLOP_20 } from "#/lib/constants";
import { makeProfileLink } from "#/lib/routes/links";
import { shareText, shareUrl } from "#/lib/sharing";
import { toShareUrl } from "#/lib/strings/url-helpers";
import type { Shadow } from "#/state/cache/types";
import { useModalControls } from "#/state/modals";
import { useDevModeEnabled } from "#/state/preferences/dev-mode";
import {
	RQKEY as profileQueryKey,
	useProfileBlockMutationQueue,
	useProfileFollowMutationQueue,
	useProfileMuteMutationQueue,
} from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { EventStopper } from "#/view/com/util/EventStopper";
import * as Toast from "#/view/com/util/Toast";

let ProfileMenu = ({
	profile,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
}): React.ReactNode => {
	const { currentAccount, hasSession } = useSession();
	const { openModal } = useModalControls();
	const reportDialogControl = useReportDialogControl();
	const queryClient = useQueryClient();
	const isSelf = currentAccount?.did === profile.did;
	const isFollowing = profile.viewer?.following;
	const isBlocked = profile.viewer?.blocking || profile.viewer?.blockedBy;
	const isFollowingBlockedAccount = isFollowing && isBlocked;
	const isLabelerAndNotBlocked = !!profile.associated?.labeler && !isBlocked;
	const [devModeEnabled] = useDevModeEnabled();
	const navigate = useNavigate();

	const [queueMute, queueUnmute] = useProfileMuteMutationQueue(profile);
	const [queueBlock, queueUnblock] = useProfileBlockMutationQueue(profile);
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile);

	const blockPromptControl = Prompt.usePromptControl();
	const loggedOutWarningPromptControl = Prompt.usePromptControl();

	const showLoggedOutWarning = React.useMemo(() => {
		return (
			profile.did !== currentAccount?.did &&
			!!profile.labels?.find((label) => label.val === "!no-unauthenticated")
		);
	}, [currentAccount, profile]);

	const invalidateProfileQuery = React.useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: profileQueryKey(profile.did),
		});
	}, [queryClient, profile.did]);

	const onPressShare = React.useCallback(() => {
		shareUrl(toShareUrl(makeProfileLink(profile)));
	}, [profile]);

	const onPressAddRemoveLists = React.useCallback(() => {
		openModal({
			name: "user-add-remove-lists",
			subject: profile.did,
			handle: profile.handle,
			displayName: profile.displayName || profile.handle,
			onAdd: invalidateProfileQuery,
			onRemove: invalidateProfileQuery,
		});
	}, [profile, openModal, invalidateProfileQuery]);

	const onPressMuteAccount = React.useCallback(async () => {
		if (profile.viewer?.muted) {
			try {
				await queueUnmute();
				Toast.show("Account unmuted");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to unmute account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		} else {
			try {
				await queueMute();
				Toast.show("Account muted");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to mute account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		}
	}, [profile.viewer?.muted, queueUnmute, queueMute]);

	const blockAccount = React.useCallback(async () => {
		if (profile.viewer?.blocking) {
			try {
				await queueUnblock();
				Toast.show("Account unblocked");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to unblock account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		} else {
			try {
				await queueBlock();
				Toast.show("Account blocked");
			} catch (e: any) {
				if (e?.name !== "AbortError") {
					console.error("Failed to block account", { message: e });
					Toast.show(`There was an issue! ${e.toString()}`, "xmark");
				}
			}
		}
	}, [profile.viewer?.blocking, queueUnblock, queueBlock]);

	const onPressFollowAccount = React.useCallback(async () => {
		try {
			await queueFollow();
			Toast.show("Account followed");
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				console.error("Failed to follow account", { message: e });
				Toast.show(`There was an issue! ${e.toString()}`, "xmark");
			}
		}
	}, [queueFollow]);

	const onPressUnfollowAccount = React.useCallback(async () => {
		try {
			await queueUnfollow();
			Toast.show("Account unfollowed");
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				console.error("Failed to unfollow account", { message: e });
				Toast.show(`There was an issue! ${e.toString()}`, "xmark");
			}
		}
	}, [queueUnfollow]);

	const onPressReportAccount = React.useCallback(() => {
		reportDialogControl.open();
	}, [reportDialogControl]);

	const onPressShareATUri = React.useCallback(() => {
		shareText(`at://${profile.did}`);
	}, [profile.did]);

	const onPressShareDID = React.useCallback(() => {
		shareText(profile.did);
	}, [profile.did]);

	const onPressSearch = React.useCallback(() => {
		navigate(`/profile/${profile.handle}/search`);
	}, [navigate, profile.handle]);

	return (
		<EventStopper onKeyDown={false}>
			<Menu.Root>
				<Menu.Trigger label={"More options"}>
					{({ props }) => {
						return (
							<Button
								{...props}
								label={"More options"}
								hitSlop={HITSLOP_20}
								variant="solid"
								color="secondary"
								size="small"
								shape="round"
							>
								<ButtonIcon icon={Ellipsis} size="sm" />
							</Button>
						);
					}}
				</Menu.Trigger>

				<Menu.Outer style={{ minWidth: 170 }}>
					<Menu.Group>
						<Menu.Item
							label={"Share"}
							onPress={() => {
								if (showLoggedOutWarning) {
									loggedOutWarningPromptControl.open();
								} else {
									onPressShare();
								}
							}}
						>
							<Menu.ItemText>Share</Menu.ItemText>
							<Menu.ItemIcon icon={Share} />
						</Menu.Item>
						<Menu.Item label={"Search posts"} onPress={onPressSearch}>
							<Menu.ItemText>Search posts</Menu.ItemText>
							<Menu.ItemIcon icon={SearchIcon} />
						</Menu.Item>
					</Menu.Group>

					{hasSession && (
						<>
							<Menu.Divider />
							<Menu.Group>
								{!isSelf && (isLabelerAndNotBlocked || isFollowingBlockedAccount) && (
									<Menu.Item
										label={isFollowing ? "Unfollow account" : "Follow account"}
										onPress={isFollowing ? onPressUnfollowAccount : onPressFollowAccount}
									>
										<Menu.ItemText>
											{isFollowing ? <>Unfollow account</> : <>Follow account</>}
										</Menu.ItemText>
										<Menu.ItemIcon icon={isFollowing ? UserMinus : Plus} />
									</Menu.Item>
								)}
								<Menu.Item label={"Add to Lists"} onPress={onPressAddRemoveLists}>
									<Menu.ItemText>Add to lists</Menu.ItemText>
									<Menu.ItemIcon icon={List} />
								</Menu.Item>
								{!isSelf && (
									<>
										{!profile.viewer?.blocking && !profile.viewer?.mutedByList && (
											<Menu.Item
												label={profile.viewer?.muted ? "Unmute account" : "Mute account"}
												onPress={onPressMuteAccount}
											>
												<Menu.ItemText>
													{profile.viewer?.muted ? <>Unmute account</> : <>Mute account</>}
												</Menu.ItemText>
												<Menu.ItemIcon icon={profile.viewer?.muted ? Unmute : Mute} />
											</Menu.Item>
										)}
										{!profile.viewer?.blockingByList && (
											<Menu.Item
												label={profile.viewer ? "Unblock account" : "Block account"}
												onPress={() => blockPromptControl.open()}
											>
												<Menu.ItemText>
													{profile.viewer?.blocking ? (
														<>Unblock account</>
													) : (
														<>Block account</>
													)}
												</Menu.ItemText>
												<Menu.ItemIcon
													icon={profile.viewer?.blocking ? PersonCheck : PersonX}
												/>
											</Menu.Item>
										)}
										<Menu.Item label={"Report account"} onPress={onPressReportAccount}>
											<Menu.ItemText>Report account</Menu.ItemText>
											<Menu.ItemIcon icon={Flag} />
										</Menu.Item>
									</>
								)}
							</Menu.Group>
						</>
					)}
					{devModeEnabled ? (
						<>
							<Menu.Divider />
							<Menu.Group>
								<Menu.Item label={"Copy at:// URI"} onPress={onPressShareATUri}>
									<Menu.ItemText>Copy at:// URI</Menu.ItemText>
									<Menu.ItemIcon icon={Share} />
								</Menu.Item>
								<Menu.Item label={"Copy DID"} onPress={onPressShareDID}>
									<Menu.ItemText>Copy DID</Menu.ItemText>
									<Menu.ItemIcon icon={Share} />
								</Menu.Item>
							</Menu.Group>
						</>
					) : null}
				</Menu.Outer>
			</Menu.Root>

			<ReportDialog
				control={reportDialogControl}
				subject={{
					...profile,
					$type: "app.bsky.actor.defs#profileViewDetailed",
				}}
			/>

			<Prompt.Basic
				control={blockPromptControl}
				title={profile.viewer?.blocking ? "Unblock Account?" : "Block Account?"}
				description={
					profile.viewer?.blocking
						? "The account will be able to interact with you after unblocking."
						: profile.associated?.labeler
							? "Blocking will not prevent labels from being applied on your account, but it will stop this account from replying in your threads or interacting with you."
							: "Blocked accounts cannot reply in your threads, mention you, or otherwise interact with you."
				}
				onConfirm={blockAccount}
				confirmButtonCta={profile.viewer?.blocking ? "Unblock" : "Block"}
				confirmButtonColor={profile.viewer?.blocking ? undefined : "negative"}
			/>

			<Prompt.Basic
				control={loggedOutWarningPromptControl}
				title={"Note about sharing"}
				description={`This profile is only visible to logged-in users. It won't be visible to people who aren't signed in.`}
				onConfirm={onPressShare}
				confirmButtonCta={"Share anyway"}
			/>
		</EventStopper>
	);
};

ProfileMenu = memo(ProfileMenu);
export { ProfileMenu };
