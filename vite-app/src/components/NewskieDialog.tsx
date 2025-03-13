import { type AppBskyActorDefs, moderateProfile } from "@atproto/api";
import { differenceInSeconds } from "date-fns";
import React from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { useDialogControl } from "#/components/Dialog";
import * as StarterPackCard from "#/components/StarterPack/StarterPackCard";
import { Text } from "#/components/Typography";
import { Newskie } from "#/components/icons/Newskie";
import { HITSLOP_10 } from "#/lib/constants";
import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useSession } from "#/state/session";

export function NewskieDialog({
	profile,
	disabled,
}: {
	profile: AppBskyActorDefs.ProfileViewDetailed;
	disabled?: boolean;
}) {
	const t = useTheme();
	const moderationOpts = useModerationOpts();
	const { currentAccount } = useSession();
	const timeAgo = useGetTimeAgo();
	const control = useDialogControl();

	const isMe = profile.did === currentAccount?.did;
	const createdAt = profile.createdAt as string | undefined;

	const profileName = React.useMemo(() => {
		const name = profile.displayName || profile.handle;

		if (isMe) {
			return "You";
		}

		if (!moderationOpts) return name;
		const moderation = moderateProfile(profile, moderationOpts);

		return sanitizeDisplayName(name, moderation.ui("displayName"));
	}, [isMe, moderationOpts, profile]);

	const [now] = React.useState(() => Date.now());
	const daysOld = React.useMemo(() => {
		if (!createdAt) return Number.POSITIVE_INFINITY;
		return differenceInSeconds(now, new Date(createdAt)) / 86400;
	}, [createdAt, now]);

	if (!createdAt || daysOld > 7) return null;

	return (
		<View style={[a.pr_2xs]}>
			<Button
				disabled={disabled}
				label={"This user is new here. Press for more info about when they joined."}
				hitSlop={HITSLOP_10}
				onPress={control.open}
			>
				{({ hovered, pressed }) => (
					<Newskie
						size="lg"
						fill="#FFC404"
						style={{
							opacity: hovered || pressed ? 0.5 : 1,
						}}
					/>
				)}
			</Button>

			<Dialog.Outer control={control}>
				<Dialog.Handle />
				<Dialog.ScrollableInner
					label={"New user info dialog"}
					style={[{ width: "auto", maxWidth: 400, minWidth: 200 }]}
				>
					<View style={[a.gap_md]}>
						<View style={[a.align_center]}>
							<View
								style={[
									{
										height: 60,
										width: 64,
									},
								]}
							>
								<Newskie width={64} height={64} fill="#FFC404" style={[a.absolute, a.inset_0]} />
							</View>
							<Text style={[a.font_bold, a.text_xl]}>
								{isMe ? <>Welcome, friend!</> : <>Say hello!</>}
							</Text>
						</View>
						<Text style={[a.text_md, a.text_center, a.leading_snug]}>
							{profile.joinedViaStarterPack ? (
								<>
									{profileName} joined Bluesky using a starter pack{" "}
									{timeAgo(createdAt, now, { format: "long" })} ago
								</>
							) : (
								<>
									{profileName} joined Bluesky {timeAgo(createdAt, now, { format: "long" })} ago
								</>
							)}
						</Text>
						{profile.joinedViaStarterPack ? (
							<StarterPackCard.Link
								starterPack={profile.joinedViaStarterPack}
								onPress={() => {
									control.close();
								}}
							>
								<View
									style={[
										a.w_full,
										a.mt_sm,
										a.p_lg,
										a.border,
										a.rounded_sm,
										t.atoms.border_contrast_low,
									]}
								>
									<StarterPackCard.Card starterPack={profile.joinedViaStarterPack} />
								</View>
							</StarterPackCard.Link>
						) : null}
					</View>

					<Dialog.Close />
				</Dialog.ScrollableInner>
			</Dialog.Outer>
		</View>
	);
}
