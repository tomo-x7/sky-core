import { type AppBskyActorDefs, type ModerationOpts, moderateProfile } from "@atproto/api";
import { flip, offset, shift, size, useFloating } from "@floating-ui/react-dom";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { KnownFollowers, shouldShowKnownFollowers } from "#/components/KnownFollowers";
import { InlineLinkText, Link } from "#/components/Link";
import { Loader } from "#/components/Loader";
import * as Pills from "#/components/Pills";
import { Portal } from "#/components/Portal";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { useFollowMethods } from "#/components/hooks/useFollowMethods";
import { useRichText } from "#/components/hooks/useRichText";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { isTouchDevice } from "#/lib/browser";
import { getModerationCauseKey } from "#/lib/moderation";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { ProfileHeaderHandle } from "#/screens/Profile/Header/Handle";
import { useProfileShadow } from "#/state/cache/profile-shadow";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { usePrefetchProfileQuery, useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { formatCount } from "#/view/com/util/numeric/format";
import type { ProfileHoverCardProps } from "./types";

const floatingMiddlewares = [
	offset(4),
	flip({ padding: 16 }),
	shift({ padding: 16 }),
	size({
		padding: 16,
		apply({ availableWidth, availableHeight, elements }) {
			Object.assign(elements.floating.style, {
				maxWidth: `${availableWidth}px`,
				maxHeight: `${availableHeight}px`,
			});
		},
	}),
];

export function ProfileHoverCard(props: ProfileHoverCardProps) {
	const prefetchProfileQuery = usePrefetchProfileQuery();
	const prefetchedProfile = React.useRef(false);
	const onPointerMove = () => {
		if (!prefetchedProfile.current) {
			prefetchedProfile.current = true;
			prefetchProfileQuery(props.did);
		}
	};

	if (props.disable || isTouchDevice) {
		return props.children;
	} else {
		return (
			<div className="text" onPointerMove={onPointerMove} style={{ ...a.flex_shrink }}>
				<ProfileHoverCardInner {...props} />
			</div>
		);
	}
}

type State =
	| {
			stage: "hidden" | "might-hide" | "hiding";
			effect?: () => () => any;
	  }
	| {
			stage: "might-show" | "showing";
			effect?: () => () => any;
			reason: "hovered-target" | "hovered-card";
	  };

type Action =
	| "pressed"
	| "scrolled-while-showing"
	| "hovered-target"
	| "unhovered-target"
	| "hovered-card"
	| "unhovered-card"
	| "hovered-long-enough"
	| "unhovered-long-enough"
	| "finished-animating-hide";

const SHOW_DELAY = 500;
const SHOW_DURATION = 300;
const HIDE_DELAY = 150;
const HIDE_DURATION = 200;

function ProfileHoverCardInner(props: ProfileHoverCardProps) {
	const { refs, floatingStyles } = useFloating({
		middleware: floatingMiddlewares,
	});

	const [currentState, dispatch] = React.useReducer(
		// Tip: console.log(state, action) when debugging.
		(state: State, action: Action): State => {
			// Pressing within a card should always hide it.
			// No matter which stage we're in.
			if (action === "pressed") {
				return hidden();
			}

			// --- Hidden ---
			// In the beginning, the card is not displayed.
			function hidden(): State {
				return { stage: "hidden" };
			}
			if (state.stage === "hidden") {
				// The user can kick things off by hovering a target.
				if (action === "hovered-target") {
					return mightShow({
						reason: action,
					});
				}
			}

			// --- Might Show ---
			// The card is not visible yet but we're considering showing it.
			function mightShow({
				waitMs = SHOW_DELAY,
				reason,
			}: {
				waitMs?: number;
				reason: "hovered-target" | "hovered-card";
			}): State {
				return {
					stage: "might-show",
					reason,
					effect() {
						const id = setTimeout(() => dispatch("hovered-long-enough"), waitMs);
						return () => {
							clearTimeout(id);
						};
					},
				};
			}
			if (state.stage === "might-show") {
				// We'll make a decision at the end of a grace period timeout.
				if (action === "unhovered-target" || action === "unhovered-card") {
					return hidden();
				}
				if (action === "hovered-long-enough") {
					return showing({
						reason: state.reason,
					});
				}
			}

			// --- Showing ---
			// The card is beginning to show up and then will remain visible.
			function showing({
				reason,
			}: {
				reason: "hovered-target" | "hovered-card";
			}): State {
				return {
					stage: "showing",
					reason,
					effect() {
						function onScroll() {
							dispatch("scrolled-while-showing");
						}
						window.addEventListener("scroll", onScroll);
						return () => window.removeEventListener("scroll", onScroll);
					},
				};
			}
			if (state.stage === "showing") {
				// If the user moves the pointer away, we'll begin to consider hiding it.
				if (action === "unhovered-target" || action === "unhovered-card") {
					return mightHide();
				}
				// Scrolling away if the hover is on the target instantly hides without a delay.
				// If the hover is already on the card, we won't this.
				if (state.reason === "hovered-target" && action === "scrolled-while-showing") {
					return hiding();
				}
			}

			// --- Might Hide ---
			// The user has moved hover away from a visible card.
			function mightHide({ waitMs = HIDE_DELAY }: { waitMs?: number } = {}): State {
				return {
					stage: "might-hide",
					effect() {
						const id = setTimeout(() => dispatch("unhovered-long-enough"), waitMs);
						return () => clearTimeout(id);
					},
				};
			}
			if (state.stage === "might-hide") {
				// We'll make a decision based on whether it received hover again in time.
				if (action === "hovered-target" || action === "hovered-card") {
					return showing({
						reason: action,
					});
				}
				if (action === "unhovered-long-enough") {
					return hiding();
				}
			}

			// --- Hiding ---
			// The user waited enough outside that we're hiding the card.
			function hiding({
				animationDurationMs = HIDE_DURATION,
			}: {
				animationDurationMs?: number;
			} = {}): State {
				return {
					stage: "hiding",
					effect() {
						const id = setTimeout(() => dispatch("finished-animating-hide"), animationDurationMs);
						return () => clearTimeout(id);
					},
				};
			}
			if (state.stage === "hiding") {
				// While hiding, we don't want to be interrupted by anything else.
				// When the animation finishes, we loop back to the initial hidden state.
				if (action === "finished-animating-hide") {
					return hidden();
				}
			}

			return state;
		},
		{ stage: "hidden" },
	);

	React.useEffect(() => {
		if (currentState.effect) {
			const effect = currentState.effect;
			return effect();
		}
	}, [currentState]);

	const prefetchProfileQuery = usePrefetchProfileQuery();
	const prefetchedProfile = React.useRef(false);
	const prefetchIfNeeded = React.useCallback(async () => {
		if (!prefetchedProfile.current) {
			prefetchedProfile.current = true;
			prefetchProfileQuery(props.did);
		}
	}, [prefetchProfileQuery, props.did]);

	const didFireHover = React.useRef(false);
	const onPointerMoveTarget = React.useCallback(() => {
		prefetchIfNeeded();
		// Conceptually we want something like onPointerEnter,
		// but we want to ignore entering only due to scrolling.
		// So instead we hover on the first onPointerMove.
		if (!didFireHover.current) {
			didFireHover.current = true;
			dispatch("hovered-target");
		}
	}, [prefetchIfNeeded]);

	const onPointerLeaveTarget = React.useCallback(() => {
		didFireHover.current = false;
		dispatch("unhovered-target");
	}, []);

	const onPointerEnterCard = React.useCallback(() => {
		dispatch("hovered-card");
	}, []);

	const onPointerLeaveCard = React.useCallback(() => {
		dispatch("unhovered-card");
	}, []);

	const onPress = React.useCallback(() => {
		dispatch("pressed");
	}, []);

	const isVisible =
		currentState.stage === "showing" || currentState.stage === "might-hide" || currentState.stage === "hiding";

	const animationStyle = {
		animation:
			currentState.stage === "hiding" ? `fadeOut ${HIDE_DURATION}ms both` : `fadeIn ${SHOW_DURATION}ms both`,
	};

	return (
		<div
			ref={refs.setReference}
			onPointerMove={onPointerMoveTarget}
			onPointerLeave={onPointerLeaveTarget}
			onMouseUp={onPress}
			style={{ flexShrink: 1, display: "inline" }}
		>
			{props.children}
			{isVisible && (
				<Portal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						onPointerEnter={onPointerEnterCard}
						onPointerLeave={onPointerLeaveCard}
					>
						<div style={{ willChange: "transform", ...animationStyle }}>
							<Card did={props.did} hide={onPress} />
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}

let Card = ({ did, hide }: { did: string; hide: () => void }): React.ReactNode => {
	const t = useTheme();

	const profile = useProfileQuery({ did });
	const moderationOpts = useModerationOpts();

	const data = profile.data;

	return (
		<div
			style={{
				padding: 16,
				border: "1px solid black",
				borderWidth: 1,
				borderRadius: 12,
				overflow: "hidden",
				...t.atoms.bg,
				...t.atoms.border_contrast_low,
				...t.atoms.shadow_lg,

				...{
					width: 300,
				},
			}}
		>
			{data && moderationOpts ? (
				<Inner profile={data} moderationOpts={moderationOpts} hide={hide} />
			) : (
				<div style={{ ...a.justify_center }}>
					<Loader size="xl" />
				</div>
			)}
		</div>
	);
};
Card = React.memo(Card);

function Inner({
	profile,
	moderationOpts,
	hide,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	moderationOpts: ModerationOpts;
	hide: () => void;
}) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const moderation = React.useMemo(() => moderateProfile(profile, moderationOpts), [profile, moderationOpts]);
	const [descriptionRT] = useRichText(profile.description ?? "");
	const profileShadow = useProfileShadow(profile);
	const { follow, unfollow } = useFollowMethods({
		profile: profileShadow,
	});
	const isBlockedUser = profile.viewer?.blocking || profile.viewer?.blockedBy || profile.viewer?.blockingByList;
	const following = formatCount(profile.followsCount || 0);
	const followers = formatCount(profile.followersCount || 0);
	const pluralizedFollowers = profile.followersCount === 1 ? "follower" : "followers";
	const pluralizedFollowings = profile.followsCount === 1 ? "follower" : "followers";
	const profileURL = makeProfileLink({
		did: profile.did,
		handle: profile.handle,
	});
	const isMe = React.useMemo(() => currentAccount?.did === profile.did, [currentAccount, profile]);
	const isLabeler = profile.associated?.labeler;

	return (
		<div>
			<div
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<Link to={profileURL} label={"View profile"} onPress={hide}>
					<UserAvatar
						size={64}
						avatar={profile.avatar}
						type={isLabeler ? "labeler" : "user"}
						moderation={moderation.ui("avatar")}
					/>
				</Link>

				{!isMe &&
					!isLabeler &&
					(isBlockedUser ? (
						<Link
							to={profileURL}
							label={`View blocked user's profile`}
							onPress={hide}
							size="small"
							color="secondary"
							variant="solid"
							style={{ ...a.rounded_full }}
						>
							<ButtonText>{"View profile"}</ButtonText>
						</Link>
					) : (
						<Button
							size="small"
							color={profileShadow.viewer?.following ? "secondary" : "primary"}
							variant="solid"
							label={profileShadow.viewer?.following ? "Following" : "Follow"}
							style={{ ...a.rounded_full }}
							onPress={profileShadow.viewer?.following ? unfollow : follow}
						>
							<ButtonIcon position="left" icon={profileShadow.viewer?.following ? Check : Plus} />
							<ButtonText>{profileShadow.viewer?.following ? "Following" : "Follow"}</ButtonText>
						</Button>
					))}
			</div>
			<Link to={profileURL} label={"View profile"} onPress={hide}>
				<div
					style={{
						paddingBottom: 8,
						flex: 1,
					}}
				>
					<Text
						style={{
							paddingTop: 12,
							paddingBottom: 4,
							fontSize: 18,
							letterSpacing: 0,
							fontWeight: "600",
							alignSelf: "flex-start",
						}}
					>
						{sanitizeDisplayName(
							profile.displayName || sanitizeHandle(profile.handle),
							moderation.ui("displayName"),
						)}
					</Text>

					<ProfileHeaderHandle profile={profileShadow} disableTaps />
				</div>
			</Link>
			{isBlockedUser && (
				<div
					style={{
						flexDirection: "row",
						flexWrap: "wrap",
						gap: 4,
					}}
				>
					{moderation.ui("profileView").alerts.map((cause) => (
						<Pills.Label key={getModerationCauseKey(cause)} size="lg" cause={cause} disableDetailsDialog />
					))}
				</div>
			)}
			{!isBlockedUser && (
				<>
					<div
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							gap: 12,
							paddingTop: 4,
						}}
					>
						<InlineLinkText
							to={makeProfileLink(profile, "followers")}
							label={`${followers} ${pluralizedFollowers}`}
							style={t.atoms.text}
							onPress={hide}
						>
							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									fontWeight: "600",
								}}
							>
								{followers}{" "}
							</Text>
							<Text style={t.atoms.text_contrast_medium}>{pluralizedFollowers}</Text>
						</InlineLinkText>
						<InlineLinkText
							to={makeProfileLink(profile, "follows")}
							label={`${following} following`}
							style={t.atoms.text}
							onPress={hide}
						>
							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									fontWeight: "600",
								}}
							>
								{following}{" "}
							</Text>
							<Text style={t.atoms.text_contrast_medium}>{pluralizedFollowings}</Text>
						</InlineLinkText>
					</div>

					{profile.description?.trim() && !moderation.ui("profileView").blur ? (
						<div style={{ ...a.pt_md }}>
							<RichText numberOfLines={8} value={descriptionRT} onLinkPress={hide} />
						</div>
					) : undefined}

					{!isMe && shouldShowKnownFollowers(profile.viewer?.knownFollowers) && (
						<div
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								paddingTop: 12,
							}}
						>
							<KnownFollowers profile={profile} moderationOpts={moderationOpts} onLinkPress={hide} />
						</div>
					)}
				</>
			)}
		</div>
	);
}
