import { type $Typed, ComAtprotoLabelDefs } from "@atproto/api";
import { useLingui } from "@lingui/react";
import React from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { useProfileQuery, useProfileUpdateMutation } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import * as bsky from "#/types/bsky";

export function PwiOptOut() {
	const t = useTheme();
	const { _ } = useLingui();
	const { currentAccount } = useSession();
	const { data: profile } = useProfileQuery({ did: currentAccount?.did });
	const updateProfile = useProfileUpdateMutation();

	const isOptedOut = profile?.labels?.some((l) => l.val === "!no-unauthenticated") || false;
	const canToggle = profile && !updateProfile.isPending;

	const onToggleOptOut = React.useCallback(() => {
		if (!profile) {
			return;
		}
		let wasAdded = false;
		updateProfile.mutate({
			profile,
			updates: (existing) => {
				// create labels attr if needed
				const labels: $Typed<ComAtprotoLabelDefs.SelfLabels> = bsky.validate(
					existing.labels,
					ComAtprotoLabelDefs.validateSelfLabels,
				)
					? existing.labels
					: {
							$type: "com.atproto.label.defs#selfLabels",
							values: [],
						};

				// toggle the label
				const hasLabel = labels.values.some((l) => l.val === "!no-unauthenticated");
				if (hasLabel) {
					wasAdded = false;
					labels.values = labels.values.filter((l) => l.val !== "!no-unauthenticated");
				} else {
					wasAdded = true;
					labels.values.push({ val: "!no-unauthenticated" });
				}

				// delete if no longer needed
				if (labels.values.length === 0) {
					delete existing.labels;
				} else {
					existing.labels = labels;
				}

				return existing;
			},
			checkCommitted: (res) => {
				const exists = !!res.data.labels?.some((l) => l.val === "!no-unauthenticated");
				return exists === wasAdded;
			},
		});
	}, [updateProfile, profile]);

	return (
		<View style={[a.flex_1, a.gap_sm]}>
			<Toggle.Item
				name="logged_out_visibility"
				disabled={!canToggle || updateProfile.isPending}
				value={isOptedOut}
				onChange={onToggleOptOut}
				label={"Discourage apps from showing my account to logged-out users"}
				style={[a.w_full]}
			>
				<Toggle.LabelText style={[a.flex_1]}>
					Discourage apps from showing my account to logged-out users
				</Toggle.LabelText>
				<Toggle.Platform />
			</Toggle.Item>

			<Text style={[a.leading_snug, t.atoms.text_contrast_high]}>
				Bluesky will not show your profile and posts to logged-out users. Other apps may not honor this request.
				This does not make your account private.
			</Text>
		</View>
	);
}
