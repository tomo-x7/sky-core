import type { AppBskyActorDefs } from "@atproto/api";
import React, { useCallback } from "react";

import { useTheme } from "#/alf";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { ChevronRight_Stroke2_Corner0_Rounded as Chevron } from "#/components/icons/Chevron";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useProfilesQuery } from "#/state/queries/profile";
import { type SessionAccount, useSession } from "#/state/session";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { Button } from "./Button";
import { Text } from "./Typography";

export function AccountList({
	onSelectAccount,
	onSelectOther,
	otherLabel,
	pendingDid,
}: {
	onSelectAccount: (account: SessionAccount) => void;
	onSelectOther: () => void;
	otherLabel?: string;
	pendingDid: string | null;
}) {
	const { currentAccount, accounts } = useSession();
	const t = useTheme();
	const { data: profiles } = useProfilesQuery({
		handles: accounts.map((acc) => acc.did),
	});

	const onPressAddAccount = useCallback(() => {
		onSelectOther();
	}, [onSelectOther]);

	return (
		<div
			style={{
				borderRadius: 12,
				overflow: "hidden",
				borderWidth: 1,
				...t.atoms.border_contrast_low,
				pointerEvents: pendingDid ? "none" : "auto",
			}}
		>
			{accounts.map((account) => (
				<React.Fragment key={account.did}>
					<AccountItem
						profile={profiles?.profiles.find((p) => p.did === account.did)}
						account={account}
						onSelect={onSelectAccount}
						isCurrentAccount={account.did === currentAccount?.did}
						isPendingAccount={account.did === pendingDid}
					/>
					<div style={{ borderBottomWidth: 1, ...t.atoms.border_contrast_low }} />
				</React.Fragment>
			))}
			<Button
				style={{ flex: 1 }}
				onPress={pendingDid ? undefined : onPressAddAccount}
				label={"Sign in to account that is not listed"}
			>
				{({ hovered, pressed }) => (
					<div
						style={{
							flex: 1,
							flexDirection: "row",
							alignItems: "center",
							height: 48,
							...((hovered || pressed) && t.atoms.bg_contrast_25),
						}}
					>
						<Text
							style={{
								alignItems: "baseline",
								flex: 1,
								flexDirection: "row",
								paddingTop: 8,
								paddingBottom: 8,
								paddingLeft: 48,
							}}
						>
							{otherLabel ?? "Other account"}
						</Text>
						<Chevron
							size="sm"
							style={{
								...t.atoms.text,
								marginRight: 12,
							}}
						/>
					</div>
				)}
			</Button>
		</div>
	);
}

function AccountItem({
	profile,
	account,
	onSelect,
	isCurrentAccount,
	isPendingAccount,
}: {
	profile?: AppBskyActorDefs.ProfileViewDetailed;
	account: SessionAccount;
	onSelect: (account: SessionAccount) => void;
	isCurrentAccount: boolean;
	isPendingAccount: boolean;
}) {
	const t = useTheme();

	const onPress = useCallback(() => {
		onSelect(account);
	}, [account, onSelect]);

	return (
		<Button
			key={account.did}
			style={{ flex: 1 }}
			onPress={onPress}
			label={
				isCurrentAccount
					? `Continue as ${account.handle} (currently signed in)`
					: `Sign in as ${account.handle}`
			}
		>
			{({ hovered, pressed }) => (
				<div
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						height: 48,
						...((hovered || pressed || isPendingAccount) && t.atoms.bg_contrast_25),
					}}
				>
					<div style={{ padding: 12 }}>
						<UserAvatar
							avatar={profile?.avatar}
							size={24}
							type={profile?.associated?.labeler ? "labeler" : "user"}
						/>
					</div>
					<Text
						style={{
							alignItems: "baseline",
							flex: 1,
							flexDirection: "row",
							paddingTop: 8,
							paddingBottom: 8,
						}}
					>
						<Text style={{ fontWeight: "600" }}>
							{sanitizeDisplayName(profile?.displayName || profile?.handle || account.handle)}
						</Text>{" "}
						<Text style={t.atoms.text_contrast_medium}>{sanitizeHandle(account.handle)}</Text>
					</Text>
					{isCurrentAccount ? (
						<Check
							size="sm"
							style={{
								color: t.palette.positive_600,
								marginRight: 12,
							}}
						/>
					) : (
						<Chevron
							size="sm"
							style={{
								...t.atoms.text,
								marginRight: 12,
							}}
						/>
					)}
				</div>
			)}
		</Button>
	);
}
