import { AppBskyGraphDefs } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { EyeSlash_Stroke2_Corner0_Rounded as EyeSlash } from "#/components/icons/EyeSlash";
import { useHider } from "#/components/moderation/Hider";
import { useGoBack } from "#/lib/hooks/useGoBack";
import { sanitizeHandle } from "#/lib/strings/handles";
import { RQKEY_ROOT as listQueryRoot } from "#/state/queries/list";
import { useListBlockMutation, useListMuteMutation } from "#/state/queries/list";
import { type UsePreferencesQueryResponse, useRemoveFeedMutation } from "#/state/queries/preferences";
import { useSession } from "#/state/session";
import * as Toast from "#/view/com/util/Toast";
import { CenteredView } from "#/view/com/util/Views";

export function ListHiddenScreen({
	list,
	preferences,
}: {
	list: AppBskyGraphDefs.ListView;
	preferences: UsePreferencesQueryResponse;
}) {
	const t = useTheme();
	const { currentAccount } = useSession();
	const { gtMobile } = useBreakpoints();
	const isOwner = currentAccount?.did === list.creator.did;
	const goBack = useGoBack();
	const queryClient = useQueryClient();

	const isModList = list.purpose === AppBskyGraphDefs.MODLIST;

	const [isProcessing, setIsProcessing] = React.useState(false);
	const listBlockMutation = useListBlockMutation();
	const listMuteMutation = useListMuteMutation();
	const { mutateAsync: removeSavedFeed } = useRemoveFeedMutation();

	const { setIsContentVisible } = useHider();

	const savedFeedConfig = preferences.savedFeeds.find((f) => f.value === list.uri);

	const onUnsubscribe = async () => {
		setIsProcessing(true);
		if (list.viewer?.muted) {
			try {
				await listMuteMutation.mutateAsync({ uri: list.uri, mute: false });
			} catch (e) {
				setIsProcessing(false);
				console.error("Failed to unmute list", { message: e });
				Toast.show("There was an issue. Please check your internet connection and try again.");
				return;
			}
		}
		if (list.viewer?.blocked) {
			try {
				await listBlockMutation.mutateAsync({ uri: list.uri, block: false });
			} catch (e) {
				setIsProcessing(false);
				console.error("Failed to unblock list", { message: e });
				Toast.show("There was an issue. Please check your internet connection and try again.");
				return;
			}
		}
		queryClient.invalidateQueries({
			queryKey: [listQueryRoot],
		});
		Toast.show("Unsubscribed from list");
		setIsProcessing(false);
	};

	const onRemoveList = async () => {
		if (!savedFeedConfig) return;
		try {
			await removeSavedFeed(savedFeedConfig);
			Toast.show("Removed from saved feeds");
		} catch (e) {
			console.error("Failed to remove list from saved feeds", { message: e });
			Toast.show("There was an issue. Please check your internet connection and try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<CenteredView
			style={{
				flex: 1,
				alignItems: "center",
				gap: 40,
				...(!gtMobile && { justifyContent: "space-between" }),
				...t.atoms.border_contrast_low,
				...{ paddingTop: 175, paddingBottom: 110 },
			}}
			sideBorders={true}
		>
			<div
				style={{
					width: "100%",
					alignItems: "center",
					gap: 16,
				}}
			>
				<EyeSlash style={{ color: t.atoms.text_contrast_medium.color }} height={42} width={42} />
				<div
					style={{
						gap: 8,
						alignItems: "center",
					}}
				>
					<Text
						style={{
							fontWeight: "600",
							fontSize: 26,
							letterSpacing: 0,
						}}
					>
						{list.creator.viewer?.blocking || list.creator.viewer?.blockedBy ? (
							<>Creator has been blocked</>
						) : (
							<>List has been hidden</>
						)}
					</Text>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							textAlign: "center",
							paddingLeft: 12,
							paddingRight: 12,
							...t.atoms.text_contrast_high,
							...{ lineHeight: 1.4 },
						}}
					>
						{list.creator.viewer?.blocking || list.creator.viewer?.blockedBy ? (
							<>Either the creator of this list has blocked you or you have blocked the creator.</>
						) : isOwner ? (
							<>
								This list – created by you – contains possible violations of Bluesky's community
								guidelines in its name or description.
							</>
						) : (
							<>
								This list – created by{" "}
								<Text style={{ fontWeight:"600" }}>{sanitizeHandle(list.creator.handle, "@")}</Text> –
								contains possible violations of Bluesky's community guidelines in its name or
								description.
							</>
						)}
					</Text>
				</div>
			</div>
			<div
				style={{
					gap: 12,
					...(gtMobile ? { width: 350 } : { width: "100%", paddingLeft: 16, paddingRight: 16 }),
				}}
			>
				<div style={{ gap: 12 }}>
					{savedFeedConfig ? (
						<Button
							variant="solid"
							color="secondary"
							size="large"
							label={"Remove from saved feeds"}
							onPress={onRemoveList}
							disabled={isProcessing}
						>
							<ButtonText>Removed from saved feeds</ButtonText>
							{isProcessing ? <ButtonIcon icon={Loader} position="right" /> : null}
						</Button>
					) : null}
					{isOwner ? (
						<Button
							variant="solid"
							color="secondary"
							size="large"
							label={"Show list anyway"}
							onPress={() => setIsContentVisible(true)}
							disabled={isProcessing}
						>
							<ButtonText>Show anyway</ButtonText>
						</Button>
					) : list.viewer?.muted || list.viewer?.blocked ? (
						<Button
							variant="solid"
							color="secondary"
							size="large"
							label={"Unsubscribe from list"}
							onPress={() => {
								if (isModList) {
									onUnsubscribe();
								} else {
									onRemoveList();
								}
							}}
							disabled={isProcessing}
						>
							<ButtonText>Unsubscribe from list</ButtonText>
							{isProcessing ? <ButtonIcon icon={Loader} position="right" /> : null}
						</Button>
					) : null}
				</div>
				<Button
					variant="solid"
					color="primary"
					label={"Return to previous page"}
					onPress={goBack}
					size="large"
					disabled={isProcessing}
				>
					<ButtonText>Go Back</ButtonText>
				</Button>
			</div>
		</CenteredView>
	);
}
