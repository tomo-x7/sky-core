import { AppBskyGraphStarterpack, AtUri } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Link as BaseLink, type LinkProps as BaseLinkProps } from "#/components/Link";
import { Text } from "#/components/Typography";
import { StarterPack as StarterPackIcon } from "#/components/icons/StarterPack";
import { sanitizeHandle } from "#/lib/strings/handles";
import { getStarterPackOgCard } from "#/lib/strings/starter-pack";
import { precacheResolvedUri } from "#/state/queries/resolve-uri";
import { precacheStarterPack } from "#/state/queries/starter-packs";
import { useSession } from "#/state/session";
import * as bsky from "#/types/bsky";

export function Default({
	starterPack,
}: {
	starterPack?: bsky.starterPack.AnyStarterPackView;
}) {
	if (!starterPack) return null;
	return (
		<Link starterPack={starterPack}>
			<Card starterPack={starterPack} />
		</Link>
	);
}

export function Notification({
	starterPack,
}: {
	starterPack?: bsky.starterPack.AnyStarterPackView;
}) {
	if (!starterPack) return null;
	return (
		<Link starterPack={starterPack}>
			<Card starterPack={starterPack} noIcon={true} noDescription={true} />
		</Link>
	);
}

export function Card({
	starterPack,
	noIcon,
	noDescription,
}: {
	starterPack: bsky.starterPack.AnyStarterPackView;
	noIcon?: boolean;
	noDescription?: boolean;
}) {
	const { record, creator, joinedAllTimeCount } = starterPack;

	const t = useTheme();
	const { currentAccount } = useSession();

	if (!bsky.dangerousIsType<AppBskyGraphStarterpack.Record>(record, AppBskyGraphStarterpack.isRecord)) {
		return null;
	}

	return (
		<div
			style={{
				...a.w_full,
				...a.gap_md,
			}}
		>
			<div
				style={{
					...a.flex_row,
					...a.gap_sm,
					...a.w_full,
				}}
			>
				{!noIcon ? <StarterPackIcon width={40} gradient="sky" /> : null}
				<div style={a.flex_1}>
					<Text
						emoji
						style={{
							...a.text_md,
							...a.font_bold,
							...a.leading_snug,
						}}
						numberOfLines={2}
					>
						{record.name}
					</Text>
					<Text
						emoji
						style={{
							...a.leading_snug,
							...t.atoms.text_contrast_medium,
						}}
						numberOfLines={1}
					>
						{creator?.did === currentAccount?.did
							? "Starter pack by you"
							: `Starter pack by ${sanitizeHandle(creator.handle, "@")}`}
					</Text>
				</div>
			</div>
			{!noDescription && record.description ? (
				<Text emoji numberOfLines={3} style={a.leading_snug}>
					{record.description}
				</Text>
			) : null}
			{!!joinedAllTimeCount && joinedAllTimeCount >= 50 && (
				<Text
					style={{
						...a.font_bold,
						...t.atoms.text_contrast_medium,
					}}
				>
					{joinedAllTimeCount} users have joined!
				</Text>
			)}
		</div>
	);
}

export function Link({
	starterPack,
	children,
}: {
	starterPack: bsky.starterPack.AnyStarterPackView;
	onPress?: () => void;
	children: BaseLinkProps["children"];
}) {
	const queryClient = useQueryClient();
	const { record } = starterPack;
	const { rkey, handleOrDid } = React.useMemo(() => {
		const rkey = new AtUri(starterPack.uri).rkey;
		const { creator } = starterPack;
		return { rkey, handleOrDid: creator.handle || creator.did };
	}, [starterPack]);

	if (!AppBskyGraphStarterpack.isRecord(record)) {
		return null;
	}

	return (
		<BaseLink
			action="push"
			to={`/starter-pack/${handleOrDid}/${rkey}`}
			label={`Navigate to ${record.name}`}
			onPress={() => {
				precacheResolvedUri(queryClient, starterPack.creator.handle, starterPack.creator.did);
				precacheStarterPack(queryClient, starterPack);
			}}
			style={{
				...a.flex_col,
				...a.align_start,
			}}
		>
			{children}
		</BaseLink>
	);
}

export function Embed({
	starterPack,
}: {
	starterPack: bsky.starterPack.AnyStarterPackView;
}) {
	const t = useTheme();
	const imageUri = getStarterPackOgCard(starterPack);

	return (
		<div
			style={{
				...a.border,
				...a.rounded_sm,
				...a.overflow_hidden,
				...t.atoms.border_contrast_low,
			}}
		>
			<Link starterPack={starterPack}>
				<img
					src={imageUri}
					style={{
						...a.w_full,
						aspectRatio: 1.91,
					}}
				/>
				<div
					style={{
						...a.px_sm,
						...a.py_md,
					}}
				>
					<Card starterPack={starterPack} />
				</div>
			</Link>
		</div>
	);
}
