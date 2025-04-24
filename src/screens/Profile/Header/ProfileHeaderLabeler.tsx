import {
	type AppBskyActorDefs,
	type AppBskyLabelerDefs,
	type ModerationOpts,
	type RichText as RichTextAPI,
	moderateProfile,
} from "@atproto/api";
import React, { memo, useMemo } from "react";
import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { type DialogOuterProps, useDialogControl } from "#/components/Dialog";
import { Link } from "#/components/Link";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import {
	Heart2_Stroke2_Corner0_Rounded as Heart,
	Heart2_Filled_Stroke2_Corner0_Rounded as HeartFilled,
} from "#/components/icons/Heart2";
import { isAppLabeler } from "#/lib/moderation";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import type { Shadow } from "#/state/cache/types";
import { useModalControls } from "#/state/modals";
import { useLabelerSubscriptionMutation } from "#/state/queries/labeler";
import { useLikeMutation, useUnlikeMutation } from "#/state/queries/like";
import { usePreferencesQuery } from "#/state/queries/preferences";
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
	labeler: AppBskyLabelerDefs.LabelerViewDetailed;
	descriptionRT: RichTextAPI | null;
	moderationOpts: ModerationOpts;
	hideBackButton?: boolean;
	isPlaceholderProfile?: boolean;
}

let ProfileHeaderLabeler = ({
	profile: profileUnshadowed,
	labeler,
	descriptionRT,
	moderationOpts,
	hideBackButton = false,
	isPlaceholderProfile,
}: Props): React.ReactNode => {
	const profile: Shadow<AppBskyActorDefs.ProfileViewDetailed> = useProfileShadow(profileUnshadowed);
	const t = useTheme();
	const { currentAccount, hasSession } = useSession();
	const requireAuth = useRequireAuth();
	const cantSubscribePrompt = Prompt.usePromptControl();
	const isSelf = currentAccount?.did === profile.did;

	const moderation = useMemo(() => moderateProfile(profile, moderationOpts), [profile, moderationOpts]);
	const { data: preferences } = usePreferencesQuery();
	const { mutateAsync: toggleSubscription, variables, reset } = useLabelerSubscriptionMutation();
	const isSubscribed =
		variables?.subscribe ?? preferences?.moderationPrefs.labelers.find((l) => l.did === profile.did);
	const { mutateAsync: likeMod, isPending: isLikePending } = useLikeMutation();
	const { mutateAsync: unlikeMod, isPending: isUnlikePending } = useUnlikeMutation();
	const [likeUri, setLikeUri] = React.useState<string>(labeler.viewer?.like || "");
	const [likeCount, setLikeCount] = React.useState(labeler.likeCount || 0);

	const onToggleLiked = React.useCallback(async () => {
		if (!labeler) {
			return;
		}
		try {
			if (likeUri) {
				await unlikeMod({ uri: likeUri });
				setLikeCount((c) => c - 1);
				setLikeUri("");
			} else {
				const res = await likeMod({ uri: labeler.uri, cid: labeler.cid });
				setLikeCount((c) => c + 1);
				setLikeUri(res.uri);
			}
		} catch (e: any) {
			Toast.show(
				"There was an issue contacting the server, please check your internet connection and try again.",
				"xmark",
			);
			console.error("Failed to toggle labeler like", { message: e.message });
		}
	}, [labeler, likeUri, unlikeMod, likeMod]);

	const { openModal } = useModalControls();
	const editProfileControl = useDialogControl();
	const onPressEditProfile = React.useCallback(() => {
		// temp, while we figure out the nested dialog bug
		openModal({
			name: "edit-profile",
			profile,
		});
	}, [openModal, profile]);

	const onPressSubscribe = React.useCallback(
		() =>
			requireAuth(async (): Promise<void> => {
				try {
					await toggleSubscription({
						did: profile.did,
						subscribe: !isSubscribed,
					});
				} catch (e: any) {
					reset();
					if (e.message === "MAX_LABELERS") {
						cantSubscribePrompt.open();
						return;
					}
					console.error("Failed to subscribe to labeler", { message: e.message });
				}
			}),
		[requireAuth, toggleSubscription, isSubscribed, profile, cantSubscribePrompt, reset],
	);

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
					pointerEvents: "none",
				}}
			>
				<div
					style={{
						flexDirection: "row",
						justifyContent: "flex-end",
						alignItems: "center",
						gap: 4,
						paddingBottom: 16,
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
					) : !isAppLabeler(profile.did) ? (
						<>
							<Button
								label={isSubscribed ? "Unsubscribe from this labeler" : "Subscribe to this labeler"}
								onPress={onPressSubscribe}
								style={{ pointerEvents: "auto" }}
							>
								{(state) => (
									<div
										style={{
											padding: "9px 12px",
											borderRadius: 6,
											gap: 6,
											backgroundColor: isSubscribed
												? state.hovered || state.pressed
													? t.palette.contrast_50
													: t.palette.contrast_25
												: state.hovered || state.pressed
													? "rgb(83 0 202)"
													: "rgb(105 0 255)",
										}}
									>
										<Text
											style={{
												...{
													color: isSubscribed ? t.palette.contrast_700 : t.palette.white,
												},

												fontWeight: "600",
												textAlign: "center",
												lineHeight: 1.15,
											}}
										>
											{isSubscribed ? <>Unsubscribe</> : <>Subscribe to Labeler</>}
										</Text>
									</div>
								)}
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
						paddingBottom: 12,
					}}
				>
					<ProfileHeaderDisplayName profile={profile} moderation={moderation} />
					<ProfileHeaderHandle profile={profile} />
				</div>
				{!isPlaceholderProfile && (
					<>
						{isSelf && <ProfileHeaderMetrics profile={profile} />}
						{descriptionRT && !moderation.ui("profileView").blur ? (
							<div style={{ pointerEvents: "auto" }}>
								<RichText
									style={{ fontSize: 16 }}
									numberOfLines={15}
									value={descriptionRT}
									enableTags
									authorHandle={profile.handle}
								/>
							</div>
						) : undefined}
						{!isAppLabeler(profile.did) && (
							<div
								style={{
									flexDirection: "row",
									gap: 4,
									alignItems: "center",
									paddingTop: 16,
								}}
							>
								<Button
									size="small"
									color="secondary"
									variant="solid"
									shape="round"
									label={"Like this labeler"}
									disabled={!hasSession || isLikePending || isUnlikePending}
									onPress={onToggleLiked}
								>
									{likeUri ? (
										<HeartFilled fill={t.palette.negative_400} />
									) : (
										<Heart fill={t.atoms.text_contrast_medium.color} />
									)}
								</Button>

								{typeof likeCount === "number" && (
									<Link
										to={`/profile/${labeler.creator.handle || labeler.creator.did}/labeler/liked-by`}
										// to={{
										// 	screen: "ProfileLabelerLikedBy",
										// 	params: {
										// 		name: labeler.creator.handle || labeler.creator.did,
										// 	},
										// }}
										size="tiny"
										label={`Liked by ${likeCount} ${likeCount === 1 ? "user" : "users"}`}
									>
										{({ hovered, focused, pressed }) => (
											<Text
												style={{
													fontWeight: "600",
													fontSize: 14,
													letterSpacing: 0,
													...t.atoms.text_contrast_medium,
													...((hovered || focused || pressed) && t.atoms.text_contrast_high),
												}}
											>
												<>
													Liked by {likeCount} {likeCount === 1 ? "user" : "users"}
												</>
											</Text>
										)}
									</Link>
								)}
							</div>
						)}
					</>
				)}
			</div>
			<CantSubscribePrompt control={cantSubscribePrompt} />
		</ProfileHeaderShell>
	);
};
ProfileHeaderLabeler = memo(ProfileHeaderLabeler);
export { ProfileHeaderLabeler };

/**
 * Keep this in sync with the value of {@link MAX_LABELERS}
 */
function CantSubscribePrompt({
	control,
}: {
	control: DialogOuterProps["control"];
}) {
	return (
		<Prompt.Outer control={control}>
			<Prompt.TitleText>Unable to subscribe</Prompt.TitleText>
			<Prompt.DescriptionText>
				We're sorry! You can only subscribe to twenty labelers, and you've reached your limit of twenty.
			</Prompt.DescriptionText>
			<Prompt.Actions>
				<Prompt.Action onPress={() => control.close()} cta={"OK"} />
			</Prompt.Actions>
		</Prompt.Outer>
	);
}
