import type { AppBskyGraphDefs } from "@atproto/api";
import React, { useCallback, useImperativeHandle, useState } from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { LinearGradientBackground } from "#/components/LinearGradientBackground";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Default as StarterPackCard } from "#/components/StarterPack/StarterPackCard";
import { Text } from "#/components/Typography";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { PlusSmall_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { useGenerateStarterPackMutation } from "#/lib/generate-starterpack";
import { useBottomBarOffset } from "#/lib/hooks/useBottomBarOffset";
import { useEmail } from "#/lib/hooks/useEmail";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { parseStarterPackUri } from "#/lib/strings/starter-pack";
import { useActorStarterPacksQuery } from "#/state/queries/actor-starter-packs";
import type { ListRenderItemInfo } from "#/temp";
import { List, type ListRef } from "#/view/com/util/List";
import { FeedLoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";

interface SectionRef {
	scrollToTop: () => void;
}

interface ProfileFeedgensProps {
	scrollElRef: ListRef;
	did: string;
	headerOffset: number;
	enabled?: boolean;
	style?: React.CSSProperties;
	isMe: boolean;
}

function keyExtractor(item: AppBskyGraphDefs.StarterPackView) {
	return item.uri;
}

export const ProfileStarterPacks = React.forwardRef<SectionRef, ProfileFeedgensProps>(function ProfileFeedgensImpl(
	{ scrollElRef, did, headerOffset, enabled, style, isMe },
	ref,
) {
	const t = useTheme();
	const bottomBarOffset = useBottomBarOffset(100);
	const [isPTRing, setIsPTRing] = useState(false);
	const { data, refetch, isFetching, hasNextPage, fetchNextPage } = useActorStarterPacksQuery({ did, enabled });
	const { isTabletOrDesktop } = useWebMediaQueries();

	const items = data?.pages.flatMap((page) => page.starterPacks);

	useImperativeHandle(ref, () => ({
		scrollToTop: () => {},
	}));

	const onRefresh = useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh starter packs", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	const onEndReached = useCallback(async () => {
		if (isFetching || !hasNextPage) return;

		try {
			await fetchNextPage();
		} catch (err) {
			console.error("Failed to load more starter packs", { message: err });
		}
	}, [isFetching, hasNextPage, fetchNextPage]);

	const renderItem = ({ item, index }: ListRenderItemInfo<AppBskyGraphDefs.StarterPackView>) => {
		return (
			<div
				style={{
					padding: 16,
					...((isTabletOrDesktop || index !== 0) && { borderTop: "1px solid black" }),
					...t.atoms.border_contrast_low,
				}}
			>
				<StarterPackCard starterPack={item} />
			</div>
		);
	};

	return (
		<div style={style}>
			<List
				ref={scrollElRef}
				data={items}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				refreshing={isPTRing}
				headerOffset={headerOffset}
				contentContainerStyle={{ paddingBottom: headerOffset + bottomBarOffset }}
				removeClippedSubviews={true}
				desktopFixedHeight
				onEndReached={onEndReached}
				onRefresh={onRefresh}
				ListEmptyComponent={data ? (isMe ? Empty : undefined) : FeedLoadingPlaceholder}
				ListFooterComponent={!!data && items?.length !== 0 && isMe ? CreateAnother : undefined}
			/>
		</div>
	);
});

function CreateAnother() {
	const t = useTheme();
	const navigate = useNavigate();

	return (
		<div
			style={{
				paddingRight: 12,
				paddingTop: 16,
				gap: 16,
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
			}}
		>
			<Button
				label={"Create a starter pack"}
				variant="solid"
				color="secondary"
				size="small"
				style={{ ...a.self_center }}
				onPress={() => navigate("/starter-pack/create")}
			>
				<ButtonText>Create another</ButtonText>
				<ButtonIcon icon={Plus} position="right" />
			</Button>
		</div>
	);
}
const className = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(6))));
function Empty() {
	const confirmDialogControl = useDialogControl();
	const followersDialogControl = useDialogControl();
	const errorDialogControl = useDialogControl();
	const navigate = useNavigate();

	const { needsEmailVerification } = useEmail();
	const verifyEmailControl = useDialogControl();

	const [isGenerating, setIsGenerating] = useState(false);

	const { mutate: generateStarterPack } = useGenerateStarterPackMutation({
		onSuccess: ({ uri }) => {
			const parsed = parseStarterPackUri(uri);
			if (parsed) {
				navigate(`/starter-pack/${parsed.name}/${parsed.rkey}`);
			}
			setIsGenerating(false);
		},
		onError: (e) => {
			console.error("Failed to generate starter pack", { safeMessage: e });
			setIsGenerating(false);
			if (e.name === "NOT_ENOUGH_FOLLOWERS") {
				followersDialogControl.open();
			} else {
				errorDialogControl.open();
			}
		},
	});

	const generate = () => {
		setIsGenerating(true);
		generateStarterPack();
	};

	return (
		<LinearGradientBackground
			style={{
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 16,
				paddingBottom: 16,
				justifyContent: "space-between",
				gap: 16,
				marginTop: 1,
				...a.shadow_lg,
			}}
		>
			<div style={{ gap: 4 }}>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 18,
						letterSpacing: 0,
						...{ color: "white" },
					}}
				>
					You haven't created a starter pack yet!
				</Text>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...{ color: "white" },
					}}
				>
					Starter packs let you easily share your favorite feeds and people with your friends.
				</Text>
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					...{ marginLeft: "auto" },
				}}
			>
				<Button
					label={"Create a starter pack for me"}
					variant="ghost"
					color="primary"
					size="small"
					disabled={isGenerating}
					onPress={() => {
						if (needsEmailVerification) {
							verifyEmailControl.open();
						} else {
							confirmDialogControl.open();
						}
					}}
					style={{ backgroundColor: "transparent" }}
				>
					<ButtonText style={{ color: "white" }}>Make one for me</ButtonText>
					{isGenerating && <Loader size="md" />}
				</Button>
				<Button
					label={"Create a starter pack"}
					variant="ghost"
					color="primary"
					size="small"
					disabled={isGenerating}
					onPress={() => {
						if (needsEmailVerification) {
							verifyEmailControl.open();
						} else {
							navigate("/starter-pack/create");
						}
					}}
					style={{
						backgroundColor: "white",
						borderColor: "white",
						width: 100,
					}}
					className={className}
				>
					<style>{`.${className}::hover{background-color:#dfdfdf}`}</style>
					<ButtonText>Create</ButtonText>
				</Button>
			</div>
			<Prompt.Outer control={confirmDialogControl}>
				<Prompt.TitleText>Generate a starter pack</Prompt.TitleText>
				<Prompt.DescriptionText>
					Bluesky will choose a set of recommended accounts from people in your network.
				</Prompt.DescriptionText>
				<Prompt.Actions>
					<Prompt.Action color="primary" cta={"Choose for me"} onPress={generate} />
					<Prompt.Action
						color="secondary"
						cta={"Let me choose"}
						onPress={() => {
							navigate("/starter-pack/create");
						}}
					/>
				</Prompt.Actions>
			</Prompt.Outer>
			<Prompt.Basic
				control={followersDialogControl}
				title={"Oops!"}
				description={"You must be following at least seven other people to generate a starter pack."}
				onConfirm={() => {}}
				showCancel={false}
			/>
			<Prompt.Basic
				control={errorDialogControl}
				title={"Oops!"}
				description={"An error occurred while generating your starter pack. Want to try again?"}
				onConfirm={generate}
				confirmButtonCta={"Retry"}
			/>
			<VerifyEmailDialog
				reasonText={"Before creating a starter pack, you must first verify your email."}
				control={verifyEmailControl}
			/>
		</LinearGradientBackground>
	);
}
