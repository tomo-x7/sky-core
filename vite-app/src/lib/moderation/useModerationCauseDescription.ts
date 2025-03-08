import { BSKY_LABELER_DID, type ModerationCause, type ModerationCauseSource } from "@atproto/api";
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import React from "react";

import type { AppModerationCause } from "#/components/Pills";
import { CircleBanSign_Stroke2_Corner0_Rounded as CircleBanSign } from "#/components/icons/CircleBanSign";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { EyeSlash_Stroke2_Corner0_Rounded as EyeSlash } from "#/components/icons/EyeSlash";
import { Warning_Stroke2_Corner0_Rounded as Warning } from "#/components/icons/Warning";
import type { Props as SVGIconProps } from "#/components/icons/common";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useLabelDefinitions } from "#/state/preferences";
import { useSession } from "#/state/session";
import { useGlobalLabelStrings } from "./useGlobalLabelStrings";
import { getDefinition, getLabelStrings } from "./useLabelInfo";

export interface ModerationCauseDescription {
	icon: React.ComponentType<SVGIconProps>;
	name: string;
	description: string;
	source?: string;
	sourceDisplayName?: string;
	sourceType?: ModerationCauseSource["type"];
	sourceAvi?: string;
	sourceDid?: string;
}

export function useModerationCauseDescription(
	cause: ModerationCause | AppModerationCause | undefined,
): ModerationCauseDescription {
	const { currentAccount } = useSession();
	const { _, i18n } = useLingui();
	const { labelDefs, labelers } = useLabelDefinitions();
	const globalLabelStrings = useGlobalLabelStrings();

	return React.useMemo(() => {
		if (!cause) {
			return {
				icon: Warning,
				name: "Content Warning",
				description: "Moderator has chosen to set a general warning on the content.",
			};
		}
		if (cause.type === "blocking") {
			if (cause.source.type === "list") {
				return {
					icon: CircleBanSign,
					name: `User Blocked by "${cause.source.list.name}"`,
					description: "You have blocked this user. You cannot view their content.",
				};
			} else {
				return {
					icon: CircleBanSign,
					name: "User Blocked",
					description: "You have blocked this user. You cannot view their content.",
				};
			}
		}
		if (cause.type === "blocked-by") {
			return {
				icon: CircleBanSign,
				name: "User Blocking You",
				description: "This user has blocked you. You cannot view their content.",
			};
		}
		if (cause.type === "block-other") {
			return {
				icon: CircleBanSign,
				name: "Content Not Available",
				description: _(
					msg`This content is not available because one of the users involved has blocked the other.`,
				),
			};
		}
		if (cause.type === "muted") {
			if (cause.source.type === "list") {
				return {
					icon: EyeSlash,
					name: `Muted by "${cause.source.list.name}"`,
					description: "You have muted this user",
				};
			} else {
				return {
					icon: EyeSlash,
					name: "Account Muted",
					description: "You have muted this account.",
				};
			}
		}
		if (cause.type === "mute-word") {
			return {
				icon: EyeSlash,
				name: "Post Hidden by Muted Word",
				description: `You've chosen to hide a word or tag within this post.`,
			};
		}
		if (cause.type === "hidden") {
			return {
				icon: EyeSlash,
				name: "Post Hidden by You",
				description: "You have hidden this post",
			};
		}
		if (cause.type === "reply-hidden") {
			const isMe = currentAccount?.did === cause.source.did;
			return {
				icon: EyeSlash,
				name: isMe ? "Reply Hidden by You" : "Reply Hidden by Thread Author",
				description: isMe ? "You hid this reply." : "The author of this thread has hidden this reply.",
			};
		}
		if (cause.type === "label") {
			const def = cause.labelDef || getDefinition(labelDefs, cause.label);
			const strings = getLabelStrings(i18n.locale, globalLabelStrings, def);
			const labeler = labelers.find((l) => l.creator.did === cause.label.src);
			let source = labeler ? sanitizeHandle(labeler.creator.handle, "@") : undefined;
			let sourceDisplayName = labeler?.creator.displayName;
			if (!source) {
				if (cause.label.src === BSKY_LABELER_DID) {
					source = "moderation.bsky.app";
					sourceDisplayName = "Bluesky Moderation Service";
				} else {
					source = "an unknown labeler";
				}
			}
			if (def.identifier === "porn" || def.identifier === "sexual") {
				strings.name = "Adult Content";
			}

			return {
				icon:
					def.identifier === "!no-unauthenticated"
						? EyeSlash
						: def.severity === "alert"
							? Warning
							: CircleInfo,
				name: strings.name,
				description: strings.description,
				source,
				sourceDisplayName,
				sourceType: cause.source.type,
				sourceAvi: labeler?.creator.avatar,
				sourceDid: cause.label.src,
			};
		}
		// should never happen
		return {
			icon: CircleInfo,
			name: "",
			description: "",
		};
	}, [labelDefs, labelers, globalLabelStrings, cause, _, i18n.locale, currentAccount?.did]);
}
