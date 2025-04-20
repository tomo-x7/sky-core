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
				width: "100%",
				gap: 12,
			}}
		>
			<div
				style={{
					flexDirection: "row",
					gap: 8,
					width: "100%",
				}}
			>
				{!noIcon ? <StarterPackIcon width={40} gradient="sky" /> : null}
				<div style={{ flex: 1 }}>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							lineHeight: 1.3,
						}}
						numberOfLines={2}
					>
						{record.name}
					</Text>
					<Text
						style={{
							lineHeight: 1.3,
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
				<Text numberOfLines={3} style={{ ...a.leading_snug }}>
					{record.description}
				</Text>
			) : null}
			{!!joinedAllTimeCount && joinedAllTimeCount >= 50 && (
				<Text
					style={{
						fontWeight: "600",
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
	onPress,
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
			action="navigate"
			to={`/starter-pack/${handleOrDid}/${rkey}`}
			label={`Navigate to ${record.name}`}
			onPress={() => {
				onPress?.();
				precacheResolvedUri(queryClient, starterPack.creator.handle, starterPack.creator.did);
				precacheStarterPack(queryClient, starterPack);
			}}
			style={{
				flexDirection: "column",
				alignItems: "flex-start",
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
				border: "1px solid black",
				borderWidth: 1,
				borderRadius: 8,
				overflow: "hidden",
				...t.atoms.border_contrast_low,
			}}
		>
			<Link starterPack={starterPack}>
				<img
					src={imageUri}
					style={{
						width: "100%",
						aspectRatio: 1.91,
					}}
				/>
				<div
					style={{
						paddingLeft: 8,
						paddingRight: 8,
						paddingTop: 12,
						paddingBottom: 12,
					}}
				>
					<Card starterPack={starterPack} />
				</div>
			</Link>
		</div>
	);
}
