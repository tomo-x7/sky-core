import type { AppBskyActorDefs } from "@atproto/api";
import React, { useCallback } from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
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
		<View
			pointerEvents={pendingDid ? "none" : "auto"}
			style={{
				...a.rounded_md,
				...a.overflow_hidden,
				...{ borderWidth: 1 },
				...t.atoms.border_contrast_low,
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
				testID="chooseAddAccountBtn"
				style={a.flex_1}
				onPress={pendingDid ? undefined : onPressAddAccount}
				label={"Sign in to account that is not listed"}
			>
				{({ hovered, pressed }) => (
					<View
						style={{
							...a.flex_1,
							...a.flex_row,
							...a.align_center,
							...{ height: 48 },
							...((hovered || pressed) && t.atoms.bg_contrast_25),
						}}
					>
						<Text
							style={{
								...a.align_baseline,
								...a.flex_1,
								...a.flex_row,
								...a.py_sm,
								...{ paddingLeft: 48 },
							}}
						>
							{otherLabel ?? "Other account"}
						</Text>
						<Chevron
							size="sm"
							style={{
								...t.atoms.text,
								...a.mr_md,
							}}
						/>
					</View>
				)}
			</Button>
		</View>
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
			testID={`chooseAccountBtn-${account.handle}`}
			key={account.did}
			style={a.flex_1}
			onPress={onPress}
			label={
				isCurrentAccount
					? `Continue as ${account.handle} (currently signed in)`
					: `Sign in as ${account.handle}`
			}
		>
			{({ hovered, pressed }) => (
				<View
					style={{
						...a.flex_1,
						...a.flex_row,
						...a.align_center,
						...{ height: 48 },
						...((hovered || pressed || isPendingAccount) && t.atoms.bg_contrast_25),
					}}
				>
					<div style={a.p_md}>
						<UserAvatar
							avatar={profile?.avatar}
							size={24}
							type={profile?.associated?.labeler ? "labeler" : "user"}
						/>
					</div>
					<Text
						style={{
							...a.align_baseline,
							...a.flex_1,
							...a.flex_row,
							...a.py_sm,
						}}
					>
						<Text emoji style={a.font_bold}>
							{sanitizeDisplayName(profile?.displayName || profile?.handle || account.handle)}
						</Text>{" "}
						<Text emoji style={t.atoms.text_contrast_medium}>
							{sanitizeHandle(account.handle)}
						</Text>
					</Text>
					{isCurrentAccount ? (
						<Check
							size="sm"
							style={{
								...{ color: t.palette.positive_600 },
								...a.mr_md,
							}}
						/>
					) : (
						<Chevron
							size="sm"
							style={{
								...t.atoms.text,
								...a.mr_md,
							}}
						/>
					)}
				</View>
			)}
		</Button>
	);
}
