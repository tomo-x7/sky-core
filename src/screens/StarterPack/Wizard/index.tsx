import { type AppBskyActorDefs, type AppBskyGraphDefs, AtUri, type ModerationOpts } from "@atproto/api";
import type { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import * as Layout from "#/components/Layout";
import { ListMaybePlaceholder } from "#/components/Lists";
import { Loader } from "#/components/Loader";
import { WizardEditListDialog } from "#/components/StarterPack/Wizard/WizardEditListDialog";
import { Text } from "#/components/Typography";
import { Keyboard } from "#/lib/Keyboard";
import { STARTER_PACK_MAX_SIZE } from "#/lib/constants";
import { useEnableKeyboardControllerScreen } from "#/lib/hooks/useEnableKeyboardController";
import { createSanitizedDisplayName } from "#/lib/moderation/create-sanitized-display-name";
import { prefetch } from "#/lib/prefetchImage";
import type { RouteParam } from "#/lib/routes/types";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { enforceLen } from "#/lib/strings/helpers";
import { getStarterPackOgCard, parseStarterPackUri } from "#/lib/strings/starter-pack";
import { type WizardStep, useWizardState } from "#/screens/StarterPack/Wizard/State";
import { StepDetails } from "#/screens/StarterPack/Wizard/StepDetails";
import { StepFeeds } from "#/screens/StarterPack/Wizard/StepFeeds";
import { StepProfiles } from "#/screens/StarterPack/Wizard/StepProfiles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useAllListMembersQuery } from "#/state/queries/list-members";
import { useProfileQuery } from "#/state/queries/profile";
import {
	useCreateStarterPackMutation,
	useEditStarterPackMutation,
	useStarterPackQuery,
} from "#/state/queries/starter-packs";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import type * as bsky from "#/types/bsky";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { Provider } from "./State";

export function Wizard() {
	const { rkey } = useParams<RouteParam<"StarterPackEdit" | "StarterPackWizard">>();
	const { currentAccount } = useSession();
	const moderationOpts = useModerationOpts();

	const {
		data: starterPack,
		isLoading: isLoadingStarterPack,
		isError: isErrorStarterPack,
	} = useStarterPackQuery({ did: currentAccount!.did, rkey });
	const listUri = starterPack?.list?.uri;

	const { data: listItems, isLoading: isLoadingProfiles, isError: isErrorProfiles } = useAllListMembersQuery(listUri);

	const {
		data: profile,
		isLoading: isLoadingProfile,
		isError: isErrorProfile,
	} = useProfileQuery({ did: currentAccount?.did });

	const isEdit = Boolean(rkey);
	const isReady = (!isEdit || (isEdit && starterPack && listItems)) && profile && moderationOpts;

	if (!isReady) {
		return (
			<Layout.Screen>
				<ListMaybePlaceholder
					isLoading={isLoadingStarterPack || isLoadingProfiles || isLoadingProfile}
					isError={isErrorStarterPack || isErrorProfiles || isErrorProfile}
					errorMessage={"That starter pack could not be found."}
				/>
			</Layout.Screen>
		);
	} else if (isEdit && starterPack?.creator.did !== currentAccount?.did) {
		return (
			<Layout.Screen>
				<ListMaybePlaceholder
					isLoading={false}
					isError={true}
					errorMessage={"That starter pack could not be found."}
				/>
			</Layout.Screen>
		);
	}

	return (
		<Layout.Screen
			style={{
				...{ minHeight: 0 },
				flex: 1,
			}}
		>
			<Provider starterPack={starterPack} listItems={listItems}>
				<WizardInner
					currentStarterPack={starterPack}
					currentListItems={listItems}
					profile={profile}
					moderationOpts={moderationOpts}
				/>
			</Provider>
		</Layout.Screen>
	);
}

function WizardInner({
	currentStarterPack,
	currentListItems,
	profile,
	moderationOpts,
}: {
	currentStarterPack?: AppBskyGraphDefs.StarterPackView;
	currentListItems?: AppBskyGraphDefs.ListItemView[];
	profile: AppBskyActorDefs.ProfileViewDetailed;
	moderationOpts: ModerationOpts;
}) {
	const navigate = useNavigate();
	const setMinimalShellMode = useSetMinimalShellMode();
	const [state, dispatch] = useWizardState();
	const { currentAccount } = useSession();
	const { data: currentProfile } = useProfileQuery({
		did: currentAccount?.did,
		staleTime: 0,
	});
	const parsed = parseStarterPackUri(currentStarterPack?.uri);

	useEnableKeyboardControllerScreen(true);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(true);

			return () => {
				setMinimalShellMode(false);
			};
		}, [setMinimalShellMode]),
	);

	const getDefaultName = () => {
		const displayName = createSanitizedDisplayName(currentProfile!, true);
		return `${displayName}'s Starter Pack`.slice(0, 50);
	};

	const wizardUiStrings: Record<WizardStep, { header: string; nextBtn: string; subtitle?: string }> = {
		Details: {
			header: "Starter Pack",
			nextBtn: "Next",
		},
		Profiles: {
			header: "Choose People",
			nextBtn: "Next",
		},
		Feeds: {
			header: "Choose Feeds",
			nextBtn: state.feeds.length === 0 ? "Skip" : "Finish",
		},
	};
	const currUiStrings = wizardUiStrings[state.currentStep];

	const onSuccessCreate = (data: { uri: string; cid: string }) => {
		const rkey = new AtUri(data.uri).rkey;
		prefetch(getStarterPackOgCard(currentProfile!.did, rkey));
		dispatch({ type: "SetProcessing", processing: false });
		navigate(`/starter-pack/${currentAccount!.handle}/${rkey}`, { state: { new: true }, replace: true });
	};

	const onSuccessEdit = () => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate(`/starter-pack/${currentAccount?.handle}/${parsed?.rkey}`);
		}
	};

	const { mutate: createStarterPack } = useCreateStarterPackMutation({
		onSuccess: onSuccessCreate,
		onError: (e) => {
			console.error("Failed to create starter pack", { safeMessage: e });
			dispatch({ type: "SetProcessing", processing: false });
			Toast.show("Failed to create starter pack", "xmark");
		},
	});
	const { mutate: editStarterPack } = useEditStarterPackMutation({
		onSuccess: onSuccessEdit,
		onError: (e) => {
			console.error("Failed to edit starter pack", { safeMessage: e });
			dispatch({ type: "SetProcessing", processing: false });
			Toast.show("Failed to create starter pack", "xmark");
		},
	});

	const submit = async () => {
		dispatch({ type: "SetProcessing", processing: true });
		if (currentStarterPack && currentListItems) {
			editStarterPack({
				name: state.name?.trim() || getDefaultName(),
				description: state.description?.trim(),
				profiles: state.profiles,
				feeds: state.feeds,
				currentStarterPack: currentStarterPack,
				currentListItems: currentListItems,
			});
		} else {
			createStarterPack({
				name: state.name?.trim() || getDefaultName(),
				description: state.description?.trim(),
				profiles: state.profiles,
				feeds: state.feeds,
			});
		}
	};

	const onNext = () => {
		if (state.currentStep === "Feeds") {
			submit();
			return;
		}

		Keyboard.dismiss();
		setTimeout(() => {
			dispatch({ type: "Next" });
		}, 16);
	};

	return (
		<Layout.Center style={{ flex: 1 }}>
			<Layout.Header.Outer>
				<Layout.Header.BackButton
					label={"Back"}
					onPress={(evt) => {
						if (state.currentStep !== "Details") {
							evt.preventDefault();
							dispatch({ type: "Back" });
						}
					}}
				/>
				<Layout.Header.Content>
					<Layout.Header.TitleText>{currUiStrings.header}</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot />
			</Layout.Header.Outer>
			<Container>
				{state.currentStep === "Details" ? (
					<StepDetails />
				) : state.currentStep === "Profiles" ? (
					<StepProfiles moderationOpts={moderationOpts} />
				) : state.currentStep === "Feeds" ? (
					<StepFeeds moderationOpts={moderationOpts} />
				) : null}
			</Container>
			{state.currentStep !== "Details" && (
				<Footer
					onNext={onNext}
					nextBtnText={currUiStrings.nextBtn}
					moderationOpts={moderationOpts}
					profile={profile}
				/>
			)}
		</Layout.Center>
	);
}

function Container({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useWizardState();

	if (state.currentStep === "Profiles" || state.currentStep === "Feeds") {
		return <div style={{ flex: 1 }}>{children}</div>;
	}

	return (
		<div
			// KeyboardAwareScrollView
			style={{ flex: 1 }}
			// keyboardShouldPersistTaps="handled"
		>
			{children}
			{state.currentStep === "Details" && (
				<Button
					label={"Next"}
					variant="solid"
					color="primary"
					size="large"
					style={{
						marginLeft: 20,
						marginRight: 20,
						marginBottom: 16,
						...{ marginTop: 35 },
					}}
					onPress={() => dispatch({ type: "Next" })}
				>
					<ButtonText>Next</ButtonText>
				</Button>
			)}
		</div>
	);
}

function Footer({
	onNext,
	nextBtnText,
	moderationOpts,
	profile,
}: {
	onNext: () => void;
	nextBtnText: string;
	moderationOpts: ModerationOpts;
	profile: AppBskyActorDefs.ProfileViewDetailed;
}) {
	const t = useTheme();
	const [state, dispatch] = useWizardState();
	const editDialogControl = useDialogControl();

	const items = state.currentStep === "Profiles" ? [profile, ...state.profiles] : state.feeds;

	const isEditEnabled =
		(state.currentStep === "Profiles" && items.length > 1) || (state.currentStep === "Feeds" && items.length > 0);

	const minimumItems = state.currentStep === "Profiles" ? 8 : 0;

	const textStyles = { fontSize: 16, letterSpacing: 0 } satisfies React.CSSProperties;

	return (
		<div
			style={{
				borderTop: "1px solid black",
				borderTopWidth: 1,
				alignItems: "center",
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 20,
				gap: 12,
				...t.atoms.bg,
				...t.atoms.border_contrast_medium,
				paddingBottom: 16,
			}}
		>
			{items.length > minimumItems && (
				<div
					style={{
						position: "absolute",
						...{ right: 14, top: 31 },
					}}
				>
					<Text style={{ fontWeight: "600" }}>
						{items.length}/{state.currentStep === "Profiles" ? STARTER_PACK_MAX_SIZE : 3}
					</Text>
				</div>
			)}
			<div
				style={{
					flexDirection: "row",
					gap: 4,
				}}
			>
				{items.slice(0, 6).map((p, index) => (
					<UserAvatar
						key={index.toString()}
						avatar={p.avatar}
						size={32}
						type={state.currentStep === "Profiles" ? "user" : "algo"}
					/>
				))}
			</div>
			{
				state.currentStep === "Profiles" ? (
					<Text
						style={{
							textAlign: "center",
							...textStyles,
						}}
					>
						{
							items.length < 2 ? (
								<>It's just you right now! Add more people to your starter pack by searching above.</>
							) : items.length === 2 ? (
								<>
									<Text
										style={{
											fontWeight: "600",
											...textStyles,
										}}
									>
										You
									</Text>{" "}
									and
									<Text> </Text>
									<Text
										style={{
											fontWeight: "600",
											...textStyles,
										}}
									>
										{getName(items[1] /* [0] is self, skip it */)}{" "}
									</Text>
									are included in your starter pack
								</>
							) : items.length > 2 ? (
								<>
									<Text
										style={{
											fontWeight: "600",
											...textStyles,
										}}
									>
										{getName(items[1] /* [0] is self, skip it */)},{" "}
									</Text>
									<Text
										style={{
											fontWeight: "600",
											...textStyles,
										}}
									>
										{getName(items[2])},{" "}
									</Text>
									and {items.length - 2} {items.length - 2 === 1 ? "other" : "others"} are included in
									your starter pack
								</>
							) : null /* Should not happen. */
						}
					</Text>
				) : state.currentStep === "Feeds" ? (
					items.length === 0 ? (
						<div style={{ gap: 8 }}>
							<Text
								style={{
									fontWeight: "600",
									textAlign: "center",
									...textStyles,
								}}
							>
								Add some feeds to your starter pack!
							</Text>
							<Text
								style={{
									textAlign: "center",
									...textStyles,
								}}
							>
								Search for feeds that you want to suggest to others.
							</Text>
						</div>
					) : (
						<Text
							style={{
								textAlign: "center",
								...textStyles,
							}}
						>
							{
								items.length === 1 ? (
									<>
										<Text
											style={{
												fontWeight: "600",
												...textStyles,
											}}
										>
											{getName(items[0])}
										</Text>{" "}
										is included in your starter pack
									</>
								) : items.length === 2 ? (
									<>
										<Text
											style={{
												fontWeight: "600",
												...textStyles,
											}}
										>
											{getName(items[0])}
										</Text>{" "}
										and
										<Text> </Text>
										<Text
											style={{
												fontWeight: "600",
												...textStyles,
											}}
										>
											{getName(items[1])}{" "}
										</Text>
										are included in your starter pack
									</>
								) : items.length > 2 ? (
									<>
										<Text
											style={{
												fontWeight: "600",
												...textStyles,
											}}
										>
											{getName(items[0])},{" "}
										</Text>
										<Text
											style={{
												fontWeight: "600",
												...textStyles,
											}}
										>
											{getName(items[1])},{" "}
										</Text>
										and {items.length - 2} {items.length - 2 === 1 ? "other" : "others"} are
										included in your starter pack
									</>
								) : null /* Should not happen. */
							}
						</Text>
					)
				) : null /* Should not happen. */
			}
			<div
				style={{
					flexDirection: "row",
					width: "100%",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 12,
				}}
			>
				{isEditEnabled ? (
					<Button
						label={"Edit"}
						variant="solid"
						color="secondary"
						size="small"
						style={{ width: 70 }}
						onPress={editDialogControl.open}
					>
						<ButtonText>Edit</ButtonText>
					</Button>
				) : (
					<div style={{ width: 70, height: 35 }} />
				)}
				{state.currentStep === "Profiles" && items.length < 8 ? (
					<>
						<Text
							style={{
								fontWeight: "600",
								...textStyles,
								...t.atoms.text_contrast_medium,
							}}
						>
							<>Add {8 - items.length} more to continue</>
						</Text>
						<div style={{ width: 70 }} />
					</>
				) : (
					<Button
						label={nextBtnText}
						variant="solid"
						color="primary"
						size="small"
						onPress={onNext}
						disabled={!state.canNext || state.processing}
					>
						<ButtonText>{nextBtnText}</ButtonText>
						{state.processing && <Loader size="xs" style={{ color: "white" }} />}
					</Button>
				)}
			</div>
			<WizardEditListDialog
				control={editDialogControl}
				state={state}
				dispatch={dispatch}
				moderationOpts={moderationOpts}
				profile={profile}
			/>
		</div>
	);
}

function getName(item: bsky.profile.AnyProfileView | GeneratorView) {
	if (typeof item.displayName === "string") {
		return enforceLen(sanitizeDisplayName(item.displayName), 28, true);
	} else if ("handle" in item && typeof item.handle === "string") {
		return enforceLen(sanitizeHandle(item.handle), 28, true);
	}
	return "";
}
