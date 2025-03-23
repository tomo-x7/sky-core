import type { AppBskyActorDefs, ModerationCause, ModerationDecision } from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Link } from "#/components/Link";
import { Text } from "#/components/Typography";
import { ConvoMenu } from "#/components/dms/ConvoMenu";
import { Bell2Off_Filled_Corner0_Rounded as BellStroke } from "#/components/icons/Bell2";
import { PostAlerts } from "#/components/moderation/PostAlerts";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import type { Shadow } from "#/state/cache/profile-shadow";
import { isConvoActive, useConvo } from "#/state/messages/convo";
import type { ConvoItem } from "#/state/messages/convo/types";
import { PreviewableUserAvatar } from "#/view/com/util/UserAvatar";

const PFP_SIZE = 40;

export let MessagesListHeader = ({
	profile,
	moderation,
}: {
	profile?: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	moderation?: ModerationDecision;
}): React.ReactNode => {
	const t = useTheme();
	const { gtTablet } = useBreakpoints();
	const navigate = useNavigate();

	const blockInfo = React.useMemo(() => {
		if (!moderation) return;
		const modui = moderation.ui("profileView");
		const blocks = modui.alerts.filter((alert) => alert.type === "blocking");
		const listBlocks = blocks.filter((alert) => alert.source.type === "list");
		const userBlock = blocks.find((alert) => alert.source.type === "user");
		return {
			listBlocks,
			userBlock,
		};
	}, [moderation]);

	const onPressBack = useCallback(() => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/messages");
		}
	}, [navigate]);

	return (
		<div
			style={{
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				...a.border_b,
				...a.flex_row,
				...a.align_start,
				...a.gap_sm,
				...(gtTablet ? a.pl_lg : a.pl_xl),
				...a.pr_lg,
				...a.py_sm,
			}}
		>
			<button
				type="button"
				onClick={onPressBack}
				// TODO
				// hitSlop={BACK_HITSLOP}
				style={{ width: 30, height: 30, marginTop: 6 }}
			>
				<FontAwesomeIcon
					size="3x" //TODO もともと18だったので大きさ見て調整
					icon="angle-left"
					style={{
						marginTop: 6,
					}}
					color={t.atoms.text.color}
				/>
			</button>
			{profile && moderation && blockInfo ? (
				<HeaderReady profile={profile} moderation={moderation} blockInfo={blockInfo} />
			) : (
				<>
					<div
						style={{
							...a.flex_row,
							...a.align_center,
							...a.gap_md,
							...a.flex_1,
						}}
					>
						<div
							style={{
								...{ width: PFP_SIZE, height: PFP_SIZE },
								...a.rounded_full,
								...t.atoms.bg_contrast_25,
							}}
						/>
						<div style={a.gap_xs}>
							<div
								style={{
									...{ width: 120, height: 16 },
									...a.rounded_xs,
									...t.atoms.bg_contrast_25,
									...a.mt_xs,
								}}
							/>
							<div
								style={{
									...{ width: 175, height: 12 },
									...a.rounded_xs,
									...t.atoms.bg_contrast_25,
								}}
							/>
						</div>
					</div>

					<div style={{ width: 30 }} />
				</>
			)}
		</div>
	);
};
MessagesListHeader = React.memo(MessagesListHeader);

function HeaderReady({
	profile,
	moderation,
	blockInfo,
}: {
	profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	moderation: ModerationDecision;
	blockInfo: {
		listBlocks: ModerationCause[];
		userBlock?: ModerationCause;
	};
}) {
	const t = useTheme();
	const convoState = useConvo();

	const isDeletedAccount = profile?.handle === "missing.invalid";
	const displayName = isDeletedAccount
		? "Deleted Account"
		: sanitizeDisplayName(profile.displayName || profile.handle, moderation.ui("displayName"));

	// @ts-expect-error findLast is polyfilled - esb
	const latestMessageFromOther = convoState.items.findLast(
		(item: ConvoItem) => item.type === "message" && item.message.sender.did === profile.did,
	);

	const latestReportableMessage =
		latestMessageFromOther?.type === "message" ? latestMessageFromOther.message : undefined;

	return (
		<div style={a.flex_1}>
			<div
				style={{
					...a.w_full,
					...a.flex_row,
					...a.align_center,
					...a.justify_between,
				}}
			>
				<Link
					label={`View ${displayName}'s profile`}
					style={{
						...a.flex_row,
						...a.align_start,
						...a.gap_md,
						...a.flex_1,
						...a.pr_md,
					}}
					to={makeProfileLink(profile)}
				>
					<div style={a.pt_2xs}>
						<PreviewableUserAvatar
							size={PFP_SIZE}
							profile={profile}
							moderation={moderation.ui("avatar")}
							disableHoverCard={moderation.blocked}
						/>
					</div>
					<div style={a.flex_1}>
						<Text
							emoji
							style={{
								...a.text_md,
								...a.font_bold,
								...a.self_start,
								...a.leading_normal,
							}}
							numberOfLines={1}
						>
							{displayName}
						</Text>
						{!isDeletedAccount && (
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									...a.text_sm,
									...a.leading_normal,
									marginTop: -2,
								}}
								numberOfLines={1}
							>
								@{profile.handle}
								{convoState.convo?.muted && (
									<>
										{" "}
										&middot; <BellStroke size="xs" style={t.atoms.text_contrast_medium} />
									</>
								)}
							</Text>
						)}
					</div>
				</Link>

				{isConvoActive(convoState) && (
					<ConvoMenu
						convo={convoState.convo}
						profile={profile}
						currentScreen="conversation"
						blockInfo={blockInfo}
						latestReportableMessage={latestReportableMessage}
					/>
				)}
			</div>
			<div
				style={{
					paddingLeft: PFP_SIZE + a.gap_md.gap,
				}}
			>
				<PostAlerts modui={moderation.ui("contentList")} size="lg" style={a.pt_xs} />
			</div>
		</div>
	);
}
