import type { AppBskyActorDefs, ModerationDecision } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { memo, useCallback } from "react";

import { atoms as a, useTheme } from "#/alf";
import { WebOnlyInlineLinkText } from "#/components/Link";
import { ProfileHoverCard } from "#/components/ProfileHoverCard";
import { Text } from "#/components/Typography";
import { makeProfileLink } from "#/lib/routes/links";
import { forceLTR } from "#/lib/strings/bidi";
import { NON_BREAKING_SPACE } from "#/lib/strings/constants";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { niceDate } from "#/lib/strings/time";
import { precacheProfile } from "#/state/queries/profile";
import { TimeElapsed } from "./TimeElapsed";
import { PreviewableUserAvatar } from "./UserAvatar";

interface PostMetaOpts {
	author: AppBskyActorDefs.ProfileViewBasic;
	moderation: ModerationDecision | undefined;
	postHref: string;
	timestamp: string;
	showAvatar?: boolean;
	avatarSize?: number;
	onOpenAuthor?: () => void;
	style?: React.CSSProperties;
}

let PostMeta = (opts: PostMetaOpts): React.ReactNode => {
	const t = useTheme();

	const displayName = opts.author.displayName || opts.author.handle;
	const handle = opts.author.handle;
	const profileLink = makeProfileLink(opts.author);
	const queryClient = useQueryClient();
	const onOpenAuthor = opts.onOpenAuthor;
	const onBeforePressAuthor = useCallback(() => {
		precacheProfile(queryClient, opts.author);
		onOpenAuthor?.();
	}, [queryClient, opts.author, onOpenAuthor]);
	const onBeforePressPost = useCallback(() => {
		precacheProfile(queryClient, opts.author);
	}, [queryClient, opts.author]);

	const timestampLabel = niceDate(opts.timestamp);

	return (
		<div
			style={{
				flex: 1,
				flexDirection: "row",
				alignItems: "center",
				paddingBottom: 2,
				gap: 4,
				zIndex: 10,
				...opts.style,
			}}
		>
			{opts.showAvatar && (
				<div
					style={{
						alignSelf: "center",
						marginRight: 2,
					}}
				>
					<PreviewableUserAvatar
						size={opts.avatarSize || 16}
						profile={opts.author}
						moderation={opts.moderation?.ui("avatar")}
						type={opts.author.associated?.labeler ? "labeler" : "user"}
					/>
				</div>
			)}
			<ProfileHoverCard inline did={opts.author.did}>
				<Text numberOfLines={1} style={{ ...a.flex_shrink }}>
					<WebOnlyInlineLinkText
						to={profileLink}
						label={"View profile"}
						disableMismatchWarning
						onPress={onBeforePressAuthor}
						style={t.atoms.text}
					>
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								fontWeight: "600",
								lineHeight: 1.3,
							}}
						>
							{forceLTR(sanitizeDisplayName(displayName, opts.moderation?.ui("displayName")))}
						</Text>
					</WebOnlyInlineLinkText>
					<WebOnlyInlineLinkText
						to={profileLink}
						label={"View profile"}
						disableMismatchWarning
						disableUnderline
						onPress={onBeforePressAuthor}
						style={{
							fontSize: 16,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
							lineHeight: 1.3,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								letterSpacing: 0,
								...t.atoms.text_contrast_medium,
								lineHeight: 1.3,
							}}
						>
							{NON_BREAKING_SPACE + sanitizeHandle(handle, "@")}
						</Text>
					</WebOnlyInlineLinkText>
				</Text>
			</ProfileHoverCard>
			{
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
				>
					&middot;
				</Text>
			}
			<TimeElapsed timestamp={opts.timestamp}>
				{({ timeElapsed }) => (
					<WebOnlyInlineLinkText
						to={opts.postHref}
						label={timestampLabel}
						title={timestampLabel}
						disableMismatchWarning
						disableUnderline
						onPress={onBeforePressPost}
						style={{
							fontSize: 16,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
							lineHeight: 1.3,

							whiteSpace: "nowrap",
						}}
					>
						{timeElapsed}
					</WebOnlyInlineLinkText>
				)}
			</TimeElapsed>
		</div>
	);
};
PostMeta = memo(PostMeta);
export { PostMeta };
