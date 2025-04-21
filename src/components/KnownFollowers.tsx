import { type AppBskyActorDefs, type ModerationOpts, moderateProfile } from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import { Link, type LinkProps } from "#/components/Link";
import { Text } from "#/components/Typography";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import type * as bsky from "#/types/bsky";
import { UserAvatar } from "#/view/com/util/UserAvatar";

const AVI_SIZE = 30;
const AVI_SIZE_SMALL = 20;
const AVI_BORDER = 1;

/**
 * Shared logic to determine if `KnownFollowers` should be shown.
 *
 * Checks the # of actual returned users instead of the `count` value, because
 * `count` includes blocked users and `followers` does not.
 */
export function shouldShowKnownFollowers(knownFollowers?: AppBskyActorDefs.KnownFollowers) {
	return knownFollowers && knownFollowers.followers.length > 0;
}

export function KnownFollowers({
	profile,
	moderationOpts,
	onLinkPress,
	minimal,
	showIfEmpty,
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	onLinkPress?: LinkProps["onPress"];
	minimal?: boolean;
	showIfEmpty?: boolean;
}) {
	const cache = React.useRef<Map<string, AppBskyActorDefs.KnownFollowers>>(new Map());

	/*
	 * Results for `knownFollowers` are not sorted consistently, so when
	 * revalidating we can see a flash of this data updating. This cache prevents
	 * this happening for screens that remain in memory. When pushing a new
	 * screen, or once this one is popped, this cache is empty, so new data is
	 * displayed.
	 */
	if (profile.viewer?.knownFollowers && !cache.current.has(profile.did)) {
		cache.current.set(profile.did, profile.viewer.knownFollowers);
	}

	const cachedKnownFollowers = cache.current.get(profile.did);

	if (cachedKnownFollowers && shouldShowKnownFollowers(cachedKnownFollowers)) {
		return (
			<KnownFollowersInner
				profile={profile}
				cachedKnownFollowers={cachedKnownFollowers}
				moderationOpts={moderationOpts}
				onLinkPress={onLinkPress}
				minimal={minimal}
				showIfEmpty={showIfEmpty}
			/>
		);
	}

	return <EmptyFallback show={showIfEmpty} />;
}

function KnownFollowersInner({
	profile,
	moderationOpts,
	cachedKnownFollowers,
	onLinkPress,
	minimal,
	showIfEmpty,
}: {
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	cachedKnownFollowers: AppBskyActorDefs.KnownFollowers;
	onLinkPress?: LinkProps["onPress"];
	minimal?: boolean;
	showIfEmpty?: boolean;
}) {
	const t = useTheme();

	const textStyle = { fontSize: 14, letterSpacing: 0, lineHeight: 1.3, ...t.atoms.text_contrast_medium };

	const slice = cachedKnownFollowers.followers.slice(0, 3).map((f) => {
		const moderation = moderateProfile(f, moderationOpts);
		return {
			profile: {
				...f,
				displayName: sanitizeDisplayName(f.displayName || f.handle, moderation.ui("displayName")),
			},
			moderation,
		};
	});

	// Does not have blocks applied. Always >= slices.length
	const serverCount = cachedKnownFollowers.count;

	/*
	 * We check above too, but here for clarity and a reminder to _check for
	 * valid indices_
	 */
	if (slice.length === 0) return <EmptyFallback show={showIfEmpty} />;

	const SIZE = minimal ? AVI_SIZE_SMALL : AVI_SIZE;

	return (
		<Link
			label={"Press to view followers of this account that you also follow"}
			onPress={onLinkPress}
			to={makeProfileLink(profile, "known-followers")}
			style={{
				flexDirection: "row",
				gap: minimal ? 8 : 12,
				alignItems: "center",
				marginLeft: -AVI_BORDER,
			}}
		>
			{({ hovered, pressed }) => (
				<>
					<div
						style={{
							height: SIZE,
							width: SIZE + (slice.length - 1) * 12,
							opacity: pressed ? 0.5 : undefined,
						}}
					>
						{slice.map(({ profile: prof, moderation }, i) => (
							<div
								key={prof.did}
								style={{
									position: "absolute",
									borderRadius: 999,

									borderWidth: AVI_BORDER,
									borderColor: t.atoms.bg.backgroundColor,
									width: SIZE + AVI_BORDER * 2,
									height: SIZE + AVI_BORDER * 2,
									left: i * 12,
									zIndex: AVI_BORDER - i,
								}}
							>
								<UserAvatar
									size={SIZE}
									avatar={prof.avatar}
									moderation={moderation.ui("avatar")}
									type={prof.associated?.labeler ? "labeler" : "user"}
								/>
							</div>
						))}
					</div>

					<Text
						style={{
							...textStyle,

							...(hovered
								? {
										textDecorationLine: "underline",
										textDecorationColor: t.atoms.text_contrast_medium.color,
									}
								: {}),

							...(pressed
								? {
										opacity: 0.5,
									}
								: {}),
						}}
						numberOfLines={2}
					>
						{slice.length >= 2 ? (
							// 2-n followers, including blocks
							serverCount > 2 ? (
								<>
									Followed by{" "}
									<Text key={slice[0].profile.did} style={textStyle}>
										{slice[0].profile.displayName}
									</Text>
									,{" "}
									<Text key={slice[1].profile.did} style={textStyle}>
										{slice[1].profile.displayName}
									</Text>
									, and {serverCount - 2} {serverCount - 2 === 1 ? "other" : "others"}
								</>
							) : (
								// only 2
								<>
									Followed by{" "}
									<Text key={slice[0].profile.did} style={textStyle}>
										{slice[0].profile.displayName}
									</Text>{" "}
									and{" "}
									<Text key={slice[1].profile.did} style={textStyle}>
										{slice[1].profile.displayName}
									</Text>
								</>
							)
						) : serverCount > 1 ? (
							// 1-n followers, including blocks
							<>
								Followed by{" "}
								<Text key={slice[0].profile.did} style={textStyle}>
									{slice[0].profile.displayName}
								</Text>{" "}
								and {serverCount - 1} {serverCount - 1 === 1 ? "other" : "others"}
							</>
						) : (
							// only 1
							<>
								Followed by{" "}
								<Text key={slice[0].profile.did} style={textStyle}>
									{slice[0].profile.displayName}
								</Text>
							</>
						)}
					</Text>
				</>
			)}
		</Link>
	);
}

function EmptyFallback({ show }: { show?: boolean }) {
	const t = useTheme();

	if (!show) return null;

	return (
		<Text
			style={{
				fontSize: 14,
				letterSpacing: 0,
				lineHeight: 1.3,
				...t.atoms.text_contrast_medium,
			}}
		>
			Not followed by anyone you're following
		</Text>
	);
}
