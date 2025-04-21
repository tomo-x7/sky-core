import {
	AppBskyGraphDefs,
	AppBskyGraphStarterpack,
	AtUri,
	type ModerationOpts,
	RichText as RichTextAPI,
} from "@atproto/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { ListMaybePlaceholder } from "#/components/Lists";
import { Loader } from "#/components/Loader";
import * as Menu from "#/components/Menu";
import * as Prompt from "#/components/Prompt";
import { RichText } from "#/components/RichText";
import { FeedsList } from "#/components/StarterPack/Main/FeedsList";
import { PostsList } from "#/components/StarterPack/Main/PostsList";
import { ProfilesList } from "#/components/StarterPack/Main/ProfilesList";
import { QrCodeDialog } from "#/components/StarterPack/QrCodeDialog";
import { ShareDialog } from "#/components/StarterPack/ShareDialog";
import { Text } from "#/components/Typography";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as ArrowOutOfBox } from "#/components/icons/ArrowOutOfBox";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { DotGrid_Stroke2_Corner0_Rounded as Ellipsis } from "#/components/icons/DotGrid";
import { Pencil_Stroke2_Corner0_Rounded as Pencil } from "#/components/icons/Pencil";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { ReportDialog, useReportDialogControl } from "#/components/moderation/ReportDialog";
import { batchedUpdates } from "#/lib/batchedUpdates";
import { HITSLOP_20 } from "#/lib/constants";
import { isBlockedOrBlocking, isMuted } from "#/lib/moderation/blocked-and-muted";
import { prefetch } from "#/lib/prefetchImage";
import { makeProfileLink, makeStarterPackLink } from "#/lib/routes/links";
import type { RouteParam } from "#/lib/routes/types";
import { cleanError } from "#/lib/strings/errors";
import { getStarterPackOgCard } from "#/lib/strings/starter-pack";
import { bulkWriteFollows } from "#/screens/Onboarding/util";
import { updateProfileShadow } from "#/state/cache/profile-shadow";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { getAllListMembers } from "#/state/queries/list-members";
import { useResolvedStarterPackShortLink } from "#/state/queries/resolve-short-link";
import { useResolveDidQuery } from "#/state/queries/resolve-uri";
import { useShortenLink } from "#/state/queries/shorten-link";
import { useDeleteStarterPackMutation } from "#/state/queries/starter-packs";
import { useStarterPackQuery } from "#/state/queries/starter-packs";
import { useAgent, useSession } from "#/state/session";
import { useLoggedOutViewControls } from "#/state/shell/logged-out";
import { ProgressGuideAction, useProgressGuideControls } from "#/state/shell/progress-guide";
import { useSetActiveStarterPack } from "#/state/shell/starter-pack";
import * as bsky from "#/types/bsky";
import { PagerWithHeader } from "#/view/com/pager/PagerWithHeader";
import { ProfileSubpageHeader } from "#/view/com/profile/ProfileSubpageHeader";
import * as Toast from "#/view/com/util/Toast";

export function StarterPackScreen() {
	return (
		<Layout.Screen>
			<StarterPackScreenInner />
		</Layout.Screen>
	);
}

export function StarterPackScreenShort() {
	const { code } = useParams<RouteParam<"StarterPackShort">>();
	const { data: resolvedStarterPack, isLoading, isError } = useResolvedStarterPackShortLink({ code: code! });

	if (isLoading || isError || !resolvedStarterPack) {
		return (
			<Layout.Screen>
				<ListMaybePlaceholder
					isLoading={isLoading}
					isError={isError}
					errorMessage={"That starter pack could not be found."}
					emptyMessage={"That starter pack could not be found."}
				/>
			</Layout.Screen>
		);
	}
	return (
		<Layout.Screen>
			<StarterPackScreenInner />
		</Layout.Screen>
	);
}

export function StarterPackScreenInner() {
	const { name, rkey } = useParams<RouteParam<"StarterPack">>();
	const nw: boolean | undefined = useLocation().state.new;
	const { currentAccount } = useSession();

	const moderationOpts = useModerationOpts();
	const { data: did, isLoading: isLoadingDid, isError: isErrorDid } = useResolveDidQuery(name);
	const {
		data: starterPack,
		isLoading: isLoadingStarterPack,
		isError: isErrorStarterPack,
	} = useStarterPackQuery({ did, rkey });

	const isValid =
		starterPack &&
		(starterPack.list || starterPack?.creator?.did === currentAccount?.did) &&
		AppBskyGraphDefs.validateStarterPackView(starterPack) &&
		AppBskyGraphStarterpack.validateRecord(starterPack.record);

	if (!did || !starterPack || !isValid || !moderationOpts) {
		return (
			<ListMaybePlaceholder
				isLoading={isLoadingDid || isLoadingStarterPack || !moderationOpts}
				isError={isErrorDid || isErrorStarterPack || !isValid}
				errorMessage={"That starter pack could not be found."}
				emptyMessage={"That starter pack could not be found."}
			/>
		);
	}

	if (!starterPack.list && starterPack.creator.did === currentAccount?.did) {
		return <InvalidStarterPack rkey={rkey!} />;
	}

	return <StarterPackScreenLoaded starterPack={starterPack} rkey={rkey!} nw={nw} moderationOpts={moderationOpts} />;
}

function StarterPackScreenLoaded({
	starterPack,
	nw,
	rkey,
	moderationOpts,
}: {
	starterPack: AppBskyGraphDefs.StarterPackView;
	nw?: boolean;
	rkey: string;
	moderationOpts: ModerationOpts;
}) {
	const showPeopleTab = Boolean(starterPack.list);
	const showFeedsTab = Boolean(starterPack.feeds?.length);
	const showPostsTab = Boolean(starterPack.list);

	const tabs = [
		...(showPeopleTab ? ["People"] : []),
		...(showFeedsTab ? ["Feeds"] : []),
		...(showPostsTab ? ["Posts"] : []),
	];

	const qrCodeDialogControl = useDialogControl();
	const shareDialogControl = useDialogControl();

	const shortenLink = useShortenLink();
	const [link, setLink] = React.useState<string>();
	const [imageLoaded, setImageLoaded] = React.useState(false);

	const onOpenShareDialog = React.useCallback(() => {
		const rkey = new AtUri(starterPack.uri).rkey;
		shortenLink(makeStarterPackLink(starterPack.creator.did, rkey)).then((res) => {
			setLink(res.url);
		});
		prefetch(getStarterPackOgCard(starterPack))
			.then(() => {
				setImageLoaded(true);
			})
			.catch(() => {
				setImageLoaded(true);
			});
		shareDialogControl.open();
	}, [shareDialogControl, shortenLink, starterPack]);

	React.useEffect(() => {
		if (nw) {
			onOpenShareDialog();
		}
	}, [onOpenShareDialog, nw]);

	return (
		<>
			<PagerWithHeader
				items={tabs}
				isHeaderReady={true}
				renderHeader={() => (
					<Header starterPack={starterPack} rkey={rkey} onOpenShareDialog={onOpenShareDialog} />
				)}
			>
				{showPeopleTab
					? ({ headerHeight, scrollElRef }) => (
							<ProfilesList
								// Validated above
								listUri={starterPack!.list!.uri}
								headerHeight={headerHeight}
								scrollElRef={scrollElRef}
								moderationOpts={moderationOpts}
								// @ts-expect-error
								listMembersQuery={undefined}
							/>
						)
					: null}
				{showFeedsTab
					? ({ headerHeight, scrollElRef }) => (
							<FeedsList
								// @ts-expect-error ?
								feeds={starterPack?.feeds}
								headerHeight={headerHeight}
								scrollElRef={scrollElRef}
							/>
						)
					: null}
				{showPostsTab
					? ({ headerHeight, scrollElRef }) => (
							<PostsList
								// Validated above
								listUri={starterPack!.list!.uri}
								headerHeight={headerHeight}
								scrollElRef={scrollElRef}
								// moderationOpts={moderationOpts}
							/>
						)
					: null}
			</PagerWithHeader>

			<QrCodeDialog control={qrCodeDialogControl} starterPack={starterPack} link={link} />
			<ShareDialog
				control={shareDialogControl}
				qrDialogControl={qrCodeDialogControl}
				starterPack={starterPack}
				link={link}
				imageLoaded={imageLoaded}
			/>
		</>
	);
}

function Header({
	starterPack,
	rkey,
	onOpenShareDialog,
}: {
	starterPack: AppBskyGraphDefs.StarterPackView;
	rkey: string;
	onOpenShareDialog: () => void;
}) {
	const t = useTheme();
	const { currentAccount, hasSession } = useSession();
	const agent = useAgent();
	const queryClient = useQueryClient();
	const setActiveStarterPack = useSetActiveStarterPack();
	const { requestSwitchToAccount } = useLoggedOutViewControls();
	const { captureAction } = useProgressGuideControls();

	const [isProcessing, setIsProcessing] = React.useState(false);

	const { record, creator } = starterPack;
	const isOwn = creator?.did === currentAccount?.did;
	const joinedAllTimeCount = starterPack.joinedAllTimeCount ?? 0;

	// const navigation = useNavigation<NavigationProp>();
	const navigate = useNavigate();

	// React.useEffect(() => {
	// 	const onFocus = () => {
	// 		if (hasSession) return;
	// 		setActiveStarterPack({
	// 			uri: starterPack.uri,
	// 		});
	// 	};
	// 	const onBeforeRemove = () => {
	// 		if (hasSession) return;
	// 		setActiveStarterPack(undefined);
	// 	};

	// 	navigation.addListener("focus", onFocus);
	// 	navigation.addListener("beforeRemove", onBeforeRemove);

	// 	return () => {
	// 		navigation.removeListener("focus", onFocus);
	// 		navigation.removeListener("beforeRemove", onBeforeRemove);
	// 	};
	// }, [hasSession, navigation, setActiveStarterPack, starterPack.uri]);

	const onFollowAll = async () => {
		if (!starterPack.list) return;

		setIsProcessing(true);

		let listItems: AppBskyGraphDefs.ListItemView[] = [];
		try {
			listItems = await getAllListMembers(agent, starterPack.list.uri);
		} catch (e) {
			setIsProcessing(false);
			Toast.show("An error occurred while trying to follow all", "xmark");
			console.error("Failed to get list members for starter pack", {
				safeMessage: e,
			});
			return;
		}

		const dids = listItems
			.filter(
				(li) =>
					li.subject.did !== currentAccount?.did &&
					!isBlockedOrBlocking(li.subject) &&
					!isMuted(li.subject) &&
					!li.subject.viewer?.following,
			)
			.map((li) => li.subject.did);

		let followUris: Map<string, string>;
		try {
			followUris = await bulkWriteFollows(agent, dids);
		} catch (e) {
			setIsProcessing(false);
			Toast.show("An error occurred while trying to follow all", "xmark");
			console.error("Failed to follow all accounts", { safeMessage: e });
		}

		setIsProcessing(false);
		batchedUpdates(() => {
			for (const did of dids) {
				updateProfileShadow(queryClient, did, {
					followingUri: followUris.get(did),
				});
			}
		});
		Toast.show("All accounts have been followed!");
		captureAction(ProgressGuideAction.Follow, dids.length);
	};

	if (!bsky.dangerousIsType<AppBskyGraphStarterpack.Record>(record, AppBskyGraphStarterpack.isRecord)) {
		return null;
	}

	const richText = record.description
		? new RichTextAPI({
				text: record.description,
				facets: record.descriptionFacets,
			})
		: undefined;

	return (
		<>
			<ProfileSubpageHeader
				isLoading={false}
				href={makeProfileLink(creator)}
				title={record.name}
				isOwner={isOwn}
				avatar={undefined}
				creator={creator}
				purpose="app.bsky.graph.defs#referencelist"
				avatarType="starter-pack"
			>
				{hasSession ? (
					<div
						style={{
							flexDirection: "row",
							gap: 8,
							alignItems: "center",
						}}
					>
						{isOwn ? (
							<Button
								label={"Share this starter pack"}
								hitSlop={HITSLOP_20}
								variant="solid"
								color="primary"
								size="small"
								onPress={onOpenShareDialog}
							>
								<ButtonText>Share</ButtonText>
							</Button>
						) : (
							<Button
								label={"Follow all"}
								variant="solid"
								color="primary"
								size="small"
								disabled={isProcessing}
								onPress={onFollowAll}
								style={{
									flexDirection: "row",
									gap: 4,
									alignItems: "center",
								}}
							>
								<ButtonText>Follow all</ButtonText>
								{isProcessing && <Loader size="xs" />}
							</Button>
						)}
						<OverflowMenu rkey={rkey} starterPack={starterPack} onOpenShareDialog={onOpenShareDialog} />
					</div>
				) : null}
			</ProfileSubpageHeader>
			{!hasSession || richText || joinedAllTimeCount >= 25 ? (
				<div
					style={{
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 12,
						paddingBottom: 8,
						gap: 12,
					}}
				>
					{richText ? (
						<RichText
							value={richText}
							style={{
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						/>
					) : null}
					{!hasSession ? (
						<Button
							label={"Join Bluesky"}
							onPress={() => {
								setActiveStarterPack({
									uri: starterPack.uri,
								});
								requestSwitchToAccount({ requestedAccount: "new" });
							}}
							variant="solid"
							color="primary"
							size="large"
						>
							<ButtonText style={{ ...a.text_lg }}>Join Bluesky</ButtonText>
						</Button>
					) : null}
					{joinedAllTimeCount >= 25 ? (
						<div
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
							}}
						>
							<FontAwesomeIcon
								icon="arrow-trend-up"
								// size={12}
								size="xl"
								color={t.atoms.text_contrast_medium.color}
							/>
							<Text
								style={{
									fontWeight: "600",
									fontSize: 14,
									letterSpacing: 0,
									...t.atoms.text_contrast_medium,
								}}
							>
								<>{starterPack.joinedAllTimeCount || 0} people have used this starter pack!</>
							</Text>
						</div>
					) : null}
				</div>
			) : null}
		</>
	);
}

function OverflowMenu({
	starterPack,
	rkey,
	onOpenShareDialog,
}: {
	starterPack: AppBskyGraphDefs.StarterPackView;
	rkey: string;
	onOpenShareDialog: () => void;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const { currentAccount } = useSession();
	const reportDialogControl = useReportDialogControl();
	const deleteDialogControl = useDialogControl();
	const navigate = useNavigate();

	const {
		mutate: deleteStarterPack,
		isPending: isDeletePending,
		error: deleteError,
	} = useDeleteStarterPackMutation({
		onSuccess: () => {
			deleteDialogControl.close(() => {
				if (history.length > 1) {
					// navigation.popToTop();
					navigate(-1);
				} else {
					navigate("/");
				}
			});
		},
		onError: (e) => {
			console.error("Failed to delete starter pack", { safeMessage: e });
		},
	});

	const isOwn = starterPack.creator.did === currentAccount?.did;

	const onDeleteStarterPack = async () => {
		if (!starterPack.list) {
			console.error("Unable to delete starterpack because list is missing");
			return;
		}

		deleteStarterPack({
			rkey,
			listUri: starterPack.list.uri,
		});
	};

	return (
		<>
			<Menu.Root>
				<Menu.Trigger label={"Repost or quote post"}>
					{({ props }) => (
						<Button
							{...props}
							label={"Open starter pack menu"}
							hitSlop={HITSLOP_20}
							variant="solid"
							color="secondary"
							size="small"
							shape="round"
						>
							<ButtonIcon icon={Ellipsis} />
						</Button>
					)}
				</Menu.Trigger>
				<Menu.Outer style={{ minWidth: 170 }}>
					{isOwn ? (
						<>
							<Menu.Item
								label={"Edit starter pack"}
								onPress={() => {
									navigate(`/starter-pack/edit/${rkey}`);
								}}
							>
								<Menu.ItemText>Edit</Menu.ItemText>
								<Menu.ItemIcon icon={Pencil} position="right" />
							</Menu.Item>
							<Menu.Item
								label={"Delete starter pack"}
								onPress={() => {
									deleteDialogControl.open();
								}}
							>
								<Menu.ItemText>Delete</Menu.ItemText>
								<Menu.ItemIcon icon={Trash} position="right" />
							</Menu.Item>
						</>
					) : (
						<>
							<Menu.Group>
								<Menu.Item label={"Share"} onPress={onOpenShareDialog}>
									<Menu.ItemText>Share link</Menu.ItemText>
									<Menu.ItemIcon icon={ArrowOutOfBox} position="right" />
								</Menu.Item>
							</Menu.Group>

							<Menu.Item label={"Report starter pack"} onPress={() => reportDialogControl.open()}>
								<Menu.ItemText>Report starter pack</Menu.ItemText>
								<Menu.ItemIcon icon={CircleInfo} position="right" />
							</Menu.Item>
						</>
					)}
				</Menu.Outer>
			</Menu.Root>
			{starterPack.list && (
				<ReportDialog
					control={reportDialogControl}
					subject={{
						...starterPack,
						$type: "app.bsky.graph.defs#starterPackView",
					}}
				/>
			)}
			<Prompt.Outer control={deleteDialogControl}>
				<Prompt.TitleText>Delete starter pack?</Prompt.TitleText>
				<Prompt.DescriptionText>Are you sure you want to delete this starter pack?</Prompt.DescriptionText>
				{deleteError && (
					<div
						style={{
							flexDirection: "row",
							gap: 8,
							borderRadius: 8,
							padding: 12,
							marginBottom: 16,
							border: "1px solid black",
							borderWidth: 1,
							...t.atoms.border_contrast_medium,
							...t.atoms.bg_contrast_25,
						}}
					>
						<div
							style={{
								flex: 1,
								gap: 2,
							}}
						>
							<Text style={{ ...a.font_bold }}>Unable to delete</Text>
							<Text style={{ lineHeight: 1.3 }}>{cleanError(deleteError)}</Text>
						</div>
						<CircleInfo size="sm" fill={t.palette.negative_400} />
					</div>
				)}
				<Prompt.Actions>
					<Button
						variant="solid"
						color="negative"
						size={gtMobile ? "small" : "large"}
						label={"Yes, delete this starter pack"}
						onPress={onDeleteStarterPack}
					>
						<ButtonText>Delete</ButtonText>
						{isDeletePending && <ButtonIcon icon={Loader} />}
					</Button>
					<Prompt.Cancel />
				</Prompt.Actions>
			</Prompt.Outer>
		</>
	);
}

function InvalidStarterPack({ rkey }: { rkey: string }) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const [isProcessing, setIsProcessing] = React.useState(false);
	const navigate = useNavigate();
	const goBack = () => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/", { replace: true });
		}
	};

	const { mutate: deleteStarterPack } = useDeleteStarterPackMutation({
		onSuccess: () => {
			setIsProcessing(false);
			goBack();
		},
		onError: (e) => {
			setIsProcessing(false);
			console.error("Failed to delete invalid starter pack", { safeMessage: e });
			Toast.show("Failed to delete starter pack", "xmark");
		},
	});

	return (
		<Layout.Content
		// centerContent
		>
			<div
				style={{
					paddingTop: 32,
					paddingBottom: 32,
					paddingLeft: 20,
					paddingRight: 20,
					alignItems: "center",
					gap: 40,
				}}
			>
				<div
					style={{
						width: "100%",
						alignItems: "center",
						gap: 16,
					}}
				>
					<Text
						style={{
							fontWeight: "600",
							fontSize: 26,
							letterSpacing: 0,
						}}
					>
						Starter pack is invalid
					</Text>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							textAlign: "center",
							...t.atoms.text_contrast_high,
							lineHeight: 1.4,
							...(gtMobile ? { width: 450 } : flatten([a.w_full, a.px_lg])),
						}}
					>
						The starter pack that you are trying to view is invalid. You may delete this starter pack
						instead.
					</Text>
				</div>
				<div
					style={{
						gap: 12,
						...(gtMobile ? { width: 350 } : flatten([a.w_full, a.px_lg])),
					}}
				>
					<Button
						variant="solid"
						color="primary"
						label={"Delete starter pack"}
						size="large"
						style={{
							borderRadius: 8,
							overflow: "hidden",
							...{ paddingTop: 10, paddingBottom: 10 },
						}}
						disabled={isProcessing}
						onPress={() => {
							setIsProcessing(true);
							deleteStarterPack({ rkey });
						}}
					>
						<ButtonText>Delete</ButtonText>
						{isProcessing && <Loader size="xs" color="white" />}
					</Button>
					<Button
						variant="solid"
						color="secondary"
						label={"Return to previous page"}
						size="large"
						style={{
							borderRadius: 8,
							overflow: "hidden",
							...{ paddingTop: 10, paddingBottom: 10 },
						}}
						disabled={isProcessing}
						onPress={goBack}
					>
						<ButtonText>Go Back</ButtonText>
					</Button>
				</div>
			</div>
		</Layout.Content>
	);
}
