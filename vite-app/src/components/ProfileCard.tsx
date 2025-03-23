import { type ModerationOpts, RichText as RichTextApi, moderateProfile } from "@atproto/api";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, type ButtonProps, ButtonText } from "#/components/Button";
import { Link as InternalLink, type LinkProps } from "#/components/Link";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useProfileFollowMutationQueue } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import { ProfileCardPills } from "#/view/com/profile/ProfileCard";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";

export function Default({
	profile,
	moderationOpts,
	logContext = "ProfileCard",
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	logContext?: "ProfileCard" | "StarterPackProfilesList";
}) {
	return (
		<Link profile={profile}>
			<Card profile={profile} moderationOpts={moderationOpts} logContext={logContext} />
		</Link>
	);
}

export function Card({
	profile,
	moderationOpts,
	logContext = "ProfileCard",
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	logContext?: "ProfileCard" | "StarterPackProfilesList";
}) {
	const moderation = moderateProfile(profile, moderationOpts);

	return (
		<Outer>
			<Header>
				<Avatar profile={profile} moderationOpts={moderationOpts} />
				<NameAndHandle profile={profile} moderationOpts={moderationOpts} />
				<FollowButton profile={profile} moderationOpts={moderationOpts} />
			</Header>

			<ProfileCardPills followedBy={Boolean(profile.viewer?.followedBy)} moderation={moderation} />

			<Description profile={profile} />
		</Outer>
	);
}

export function Outer({
	children,
}: {
	children: React.ReactElement | React.ReactElement[];
}) {
	return (
		<div
			style={{
				...a.w_full,
				...a.flex_1,
				...a.gap_xs,
			}}
		>
			{children}
		</div>
	);
}

export function Header({
	children,
}: {
	children: React.ReactElement | React.ReactElement[];
}) {
	return (
		<div
			style={{
				...a.flex_row,
				...a.align_center,
				...a.gap_sm,
			}}
		>
			{children}
		</div>
	);
}

export function Link({
	profile,
	children,
	style,
	...rest
}: {
	profile: bsky.profile.AnyProfileView;
} & Omit<LinkProps, "to" | "label">) {
	return (
		<InternalLink
			label={`View ${profile.displayName || sanitizeHandle(profile.handle)}'s profile`}
			to={`/profile/${profile.did}`}
			// to={{
			// 	screen: "Profile",
			// 	params: { name: profile.did },
			// }}
			style={{
				...a.flex_col,
				...style,
			}}
			{...rest}
		>
			{children}
		</InternalLink>
	);
}

export function Avatar({
	profile,
	moderationOpts,
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
}) {
	const moderation = moderateProfile(profile, moderationOpts);

	return (
		<UserAvatar
			size={42}
			avatar={profile.avatar}
			type={profile.associated?.labeler ? "labeler" : "user"}
			moderation={moderation.ui("avatar")}
		/>
	);
}

export function AvatarPlaceholder() {
	const t = useTheme();
	return (
		<div
			style={{
				...a.rounded_full,
				...t.atoms.bg_contrast_50,

				...{
					width: 42,
					height: 42,
				},
			}}
		/>
	);
}

export function NameAndHandle({
	profile,
	moderationOpts,
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
}) {
	const t = useTheme();
	const moderation = moderateProfile(profile, moderationOpts);
	const name = sanitizeDisplayName(
		profile.displayName || sanitizeHandle(profile.handle),
		moderation.ui("displayName"),
	);
	const handle = sanitizeHandle(profile.handle, "@");

	return (
		<div style={a.flex_1}>
			<Text
				emoji
				style={{
					...a.text_md,
					...a.font_bold,
					...a.leading_snug,
					...a.self_start,
				}}
				numberOfLines={1}
			>
				{name}
			</Text>
			<Text
				emoji
				style={{
					...a.leading_snug,
					...t.atoms.text_contrast_medium,
				}}
				numberOfLines={1}
			>
				{handle}
			</Text>
		</div>
	);
}

export function NameAndHandlePlaceholder() {
	const t = useTheme();

	return (
		<div
			style={{
				...a.flex_1,
				...a.gap_xs,
			}}
		>
			<div
				style={{
					...a.rounded_xs,
					...t.atoms.bg_contrast_50,

					...{
						width: "60%",
						height: 14,
					},
				}}
			/>
			<div
				style={{
					...a.rounded_xs,
					...t.atoms.bg_contrast_50,

					...{
						width: "40%",
						height: 10,
					},
				}}
			/>
		</div>
	);
}

export function Description({
	profile: profileUnshadowed,
	numberOfLines = 3,
}: {
	profile: bsky.profile.AnyProfileView;
	numberOfLines?: number;
}) {
	const profile = useProfileShadow(profileUnshadowed);
	const rt = React.useMemo(() => {
		if (!("description" in profile)) return;
		const rt = new RichTextApi({ text: profile.description || "" });
		rt.detectFacetsWithoutResolution();
		return rt;
	}, [profile]);
	if (!rt) return null;
	if (profile.viewer && (profile.viewer.blockedBy || profile.viewer.blocking || profile.viewer.blockingByList))
		return null;
	return (
		<div style={a.pt_xs}>
			<RichText value={rt} style={a.leading_snug} numberOfLines={numberOfLines} disableLinks />
		</div>
	);
}

export function DescriptionPlaceholder({
	numberOfLines = 3,
}: {
	numberOfLines?: number;
}) {
	const t = useTheme();
	return (
		<div style={{ gap: 8 }}>
			{Array(numberOfLines)
				.fill(0)
				.map((_, i) => (
					<div
						key={i.toString()}
						style={{
							...a.rounded_xs,
							...a.w_full,
							...t.atoms.bg_contrast_50,
							...{ height: 12, width: i + 1 === numberOfLines ? "60%" : "100%" },
						}}
					/>
				))}
		</div>
	);
}

export type FollowButtonProps = {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	colorInverted?: boolean;
	onFollow?: () => void;
} & Partial<ButtonProps>;

export function FollowButton(props: FollowButtonProps) {
	const { currentAccount, hasSession } = useSession();
	const isMe = props.profile.did === currentAccount?.did;
	return hasSession && !isMe ? <FollowButtonInner {...props} /> : null;
}

export function FollowButtonInner({
	profile: profileUnshadowed,
	moderationOpts,
	onPress: onPressProp,
	onFollow,
	colorInverted,
	...rest
}: FollowButtonProps) {
	const profile = useProfileShadow(profileUnshadowed);
	const moderation = moderateProfile(profile, moderationOpts);
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile);
	const isRound = Boolean(rest.shape && rest.shape === "round");

	const onPressFollow = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			await queueFollow();
			Toast.show(
				`Following ${sanitizeDisplayName(profile.displayName || profile.handle, moderation.ui("displayName"))}`,
			);
			onPressProp?.(e);
			onFollow?.();
		} catch (err) {
			if ((err as { name: string })?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	const onPressUnfollow = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			await queueUnfollow();
			Toast.show(
				`No longer following ${sanitizeDisplayName(
					profile.displayName || profile.handle,
					moderation.ui("displayName"),
				)}`,
			);
			onPressProp?.(e);
		} catch (err) {
			if ((err as { name: string })?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	const unfollowLabel = "Following";
	const followLabel = "Follow";

	if (!profile.viewer) return null;
	if (profile.viewer.blockedBy || profile.viewer.blocking || profile.viewer.blockingByList) return null;

	return (
		<div>
			{profile.viewer.following ? (
				<Button
					label={unfollowLabel}
					size="small"
					variant="solid"
					color="secondary"
					{...rest}
					onPress={onPressUnfollow}
				>
					<ButtonIcon icon={Check} position={isRound ? undefined : "left"} />
					{isRound ? null : <ButtonText>{unfollowLabel}</ButtonText>}
				</Button>
			) : (
				<Button
					label={followLabel}
					size="small"
					variant="solid"
					color={colorInverted ? "secondary_inverted" : "primary"}
					{...rest}
					onPress={onPressFollow}
				>
					<ButtonIcon icon={Plus} position={isRound ? undefined : "left"} />
					{isRound ? null : <ButtonText>{followLabel}</ButtonText>}
				</Button>
			)}
		</div>
	);
}
