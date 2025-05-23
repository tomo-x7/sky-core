import { type AppBskyActorDefs, type ModerationDecision, moderateProfile } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { KnownFollowers, shouldShowKnownFollowers } from "#/components/KnownFollowers";
import * as Pills from "#/components/Pills";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { getModerationCauseKey, isJustAMute } from "#/lib/moderation";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { s } from "#/lib/styles";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import type { Shadow } from "#/state/cache/types";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { precacheProfile } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import { Link } from "../util/Link";
import { PreviewableUserAvatar } from "../util/UserAvatar";
import { FollowButton } from "./FollowButton";

export function ProfileCard({
	profile: profileUnshadowed,
	noModFilter,
	noBg,
	noBorder,
	renderButton,
	onPress,
	style,
	showKnownFollowers,
}: {
	profile: bsky.profile.AnyProfileView;
	noModFilter?: boolean;
	noBg?: boolean;
	noBorder?: boolean;
	renderButton?: (profile: Shadow<bsky.profile.AnyProfileView>) => React.ReactNode;
	onPress?: () => void;
	style?: React.CSSProperties;
	showKnownFollowers?: boolean;
}) {
	const queryClient = useQueryClient();
	const pal = usePalette("default");
	const profile = useProfileShadow(profileUnshadowed);
	const moderationOpts = useModerationOpts();
	const isLabeler = profile?.associated?.labeler;

	const onBeforePress = React.useCallback(() => {
		onPress?.();
		precacheProfile(queryClient, profile);
	}, [onPress, profile, queryClient]);

	if (!moderationOpts) {
		return null;
	}
	const moderation = moderateProfile(profile, moderationOpts);
	const modui = moderation.ui("profileList");
	if (!noModFilter && modui.filter && !isJustAMute(modui)) {
		return null;
	}

	const knownFollowersVisible =
		showKnownFollowers && shouldShowKnownFollowers(profile.viewer?.knownFollowers) && moderationOpts;
	const hasDescription = "description" in profile;

	return (
		<Link
			style={{
				...styles.outer,
				...pal.border,
				...(noBorder && styles.outerNoBorder),
				...(!noBg && pal.view),
				...style,
			}}
			href={makeProfileLink(profile)}
			title={profile.handle}
			asAnchor
			onBeforePress={onBeforePress}
			anchorNoUnderline
		>
			<div style={styles.layout}>
				<div style={styles.layoutAvi}>
					<PreviewableUserAvatar
						size={40}
						profile={profile}
						moderation={moderation.ui("avatar")}
						type={isLabeler ? "labeler" : "user"}
					/>
				</div>
				<div style={styles.layoutContent}>
					<Text
						type="lg"
						style={{
							...s.bold,
							...pal.text,
							alignSelf: "flex-start",
						}}
						numberOfLines={1}
						lineHeight={1.2}
					>
						{sanitizeDisplayName(
							profile.displayName || sanitizeHandle(profile.handle),
							moderation.ui("displayName"),
						)}
					</Text>
					<Text type="md" style={pal.textLight} numberOfLines={1}>
						{sanitizeHandle(profile.handle, "@")}
					</Text>
					<ProfileCardPills followedBy={!!profile.viewer?.followedBy} moderation={moderation} />
					{!!profile.viewer?.followedBy && <div style={s.flexRow} />}
				</div>
				{renderButton && !isLabeler ? (
					<div style={styles.layoutButton}>{renderButton(profile)}</div>
				) : undefined}
			</div>
			{hasDescription || knownFollowersVisible ? (
				<div style={styles.details}>
					{hasDescription && profile.description ? (
						<Text style={pal.text} numberOfLines={4}>
							{profile.description as string}
						</Text>
					) : null}
					{knownFollowersVisible ? (
						<div
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								...(!!hasDescription && { marginTop: 12 }),
							}}
						>
							<KnownFollowers minimal profile={profile} moderationOpts={moderationOpts} />
						</div>
					) : null}
				</div>
			) : null}
		</Link>
	);
}

export function ProfileCardPills({
	followedBy,
	moderation,
}: {
	followedBy: boolean;
	moderation: ModerationDecision;
}) {
	const modui = moderation.ui("profileList");
	if (!followedBy && !modui.inform && !modui.alert) {
		return null;
	}

	return (
		<Pills.Row style={{ paddingTop: 4 }}>
			{followedBy && <Pills.FollowsYou />}
			{modui.alerts.map((alert) => (
				<Pills.Label key={getModerationCauseKey(alert)} cause={alert} />
			))}
			{modui.informs.map((inform) => (
				<Pills.Label key={getModerationCauseKey(inform)} cause={inform} />
			))}
		</Pills.Row>
	);
}

export function ProfileCardWithFollowBtn({
	profile,
	noBg,
	noBorder,
	onPress,
	onFollow,
	showKnownFollowers,
}: {
	profile: AppBskyActorDefs.ProfileView;
	noBg?: boolean;
	noBorder?: boolean;
	onPress?: () => void;
	onFollow?: () => void;
	showKnownFollowers?: boolean;
}) {
	const { currentAccount } = useSession();
	const isMe = profile.did === currentAccount?.did;

	return (
		<ProfileCard
			profile={profile}
			noBg={noBg}
			noBorder={noBorder}
			renderButton={
				isMe ? undefined : (profileShadow) => <FollowButton profile={profileShadow} onFollow={onFollow} />
			}
			onPress={onPress}
			showKnownFollowers={!isMe && showKnownFollowers}
		/>
	);
}

const styles = {
	outer: {
		borderTopWidth: 1,
		paddingLeft: 6,
		paddingRight: 6,
		paddingTop: 4,
		paddingBottom: 4,
	},
	outerNoBorder: {
		borderTopWidth: 0,
	},
	layout: {
		flexDirection: "row",
		alignItems: "center",
	},
	layoutAvi: {
		alignSelf: "flex-start",
		width: 54,
		paddingLeft: 4,
		paddingTop: 10,
	},
	avi: {
		width: 40,
		height: 40,
		borderRadius: 20,
		objectFit: "cover",
	},
	layoutContent: {
		flex: 1,
		paddingRight: 10,
		paddingTop: 10,
		paddingBottom: 10,
	},
	layoutButton: {
		paddingRight: 10,
	},
	details: {
		justifyContent: "center",
		paddingLeft: 54,
		paddingRight: 10,
		paddingBottom: 10,
	},
	pills: {
		alignItems: "flex-start",
		flexDirection: "row",
		flexWrap: "wrap",
		columnGap: 6,
		rowGap: 2,
	},
	pill: {
		borderRadius: 4,
		paddingLeft: 6,
		paddingRight: 6,
		paddingTop: 2,
		paddingBottom: 2,
		justifyContent: "center",
	},
	btn: {
		paddingTop: 7,
		paddingBottom: 7,
		borderRadius: 50,
		marginLeft: 6,
		paddingLeft: 14,
		paddingRight: 14,
	},

	followedBy: {
		flexDirection: "row",
		paddingLeft: 54,
		paddingRight: 20,
		marginBottom: 10,
		marginTop: -6,
	},
	followedByAviContainer: {
		width: 24,
		height: 36,
	},
	followedByAvi: {
		width: 36,
		height: 36,
		borderRadius: 18,
		padding: 2,
	},
	followsByDesc: {
		flex: 1,
		paddingRight: 10,
	},
} satisfies Record<string, React.CSSProperties>;
