import { LABELS } from "@atproto/api";
import { Fragment, useCallback } from "react";

import { type ViewStyleProp, atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import * as LabelingService from "#/components/LabelingServiceCard";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import { ListMaybePlaceholder } from "#/components/Lists";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { BirthDateSettingsDialog } from "#/components/dialogs/BirthDateSettings";
import { useGlobalDialogsControlContext } from "#/components/dialogs/Context";
import * as Toggle from "#/components/forms/Toggle";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "#/components/icons/Chevron";
import { CircleBanSign_Stroke2_Corner0_Rounded as CircleBanSign } from "#/components/icons/CircleBanSign";
import { EditBig_Stroke2_Corner0_Rounded as EditBig } from "#/components/icons/EditBig";
import { Filter_Stroke2_Corner0_Rounded as Filter } from "#/components/icons/Filter";
import { Group3_Stroke2_Corner0_Rounded as Group } from "#/components/icons/Group";
import { Person_Stroke2_Corner0_Rounded as Person } from "#/components/icons/Person";
import type { Props as SVGIconProps } from "#/components/icons/common";
import { GlobalLabelPreference } from "#/components/moderation/LabelPreference";
import { getLabelingServiceTitle } from "#/lib/moderation";
import {
	type UsePreferencesQueryResponse,
	useMyLabelersQuery,
	usePreferencesQuery,
	usePreferencesSetAdultContentMutation,
} from "#/state/queries/preferences";
import { isNonConfigurableModerationAuthority } from "#/state/session/additional-moderation-authorities";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";

function ErrorState({ error }: { error: string }) {
	const t = useTheme();
	return (
		<div style={{ padding: 20 }}>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					lineHeight: 1.5,
					paddingBottom: 12,
					...t.atoms.text_contrast_medium,
				}}
			>
				Hmmmm, it seems we're having trouble loading this data. See below for more details. If this issue
				persists, please contact us.
			</Text>
			<div
				style={{
					position: "relative",
					paddingTop: 12,
					paddingBottom: 12,
					paddingLeft: 16,
					paddingRight: 16,
					borderRadius: 12,
					marginBottom: 24,
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.5,
					}}
				>
					{error}
				</Text>
			</div>
		</div>
	);
}

export function ModerationScreen() {
	const { isLoading: isPreferencesLoading, error: preferencesError, data: preferences } = usePreferencesQuery();

	const isLoading = isPreferencesLoading;
	const error = preferencesError;

	return (
		<Layout.Screen>
			<ViewHeader title={"Moderation"} showOnDesktop />
			<Layout.Content>
				{isLoading ? (
					<ListMaybePlaceholder isLoading={true} sideBorders={false} />
				) : error || !preferences ? (
					<ErrorState error={preferencesError?.toString() || "Something went wrong, please try again."} />
				) : (
					<ModerationScreenInner preferences={preferences} />
				)}
			</Layout.Content>
		</Layout.Screen>
	);
}

function SubItem({
	title,
	icon: Icon,
	style,
}: ViewStyleProp & {
	title: string;
	icon: React.ComponentType<SVGIconProps>;
}) {
	const t = useTheme();
	return (
		<div
			style={{
				width: "100%",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				padding: 16,
				gap: 8,
				...style,
			}}
		>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
				}}
			>
				<Icon size="md" style={t.atoms.text_contrast_medium} />
				<Text
					style={{
						fontSize: 14,
						letterSpacing: 0,
						fontWeight: "600",
					}}
				>
					{title}
				</Text>
			</div>
			<ChevronRight
				size="sm"
				style={{
					...t.atoms.text_contrast_low,
					alignSelf:"flex-end",
					...{ paddingBottom: 2 },
				}}
			/>
		</div>
	);
}

export function ModerationScreenInner({
	preferences,
}: {
	preferences: UsePreferencesQueryResponse;
}) {
	const t = useTheme();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { gtMobile } = useBreakpoints();
	const { mutedWordsDialogControl } = useGlobalDialogsControlContext();
	const birthdateDialogControl = Dialog.useDialogControl();
	const { isLoading: isLabelersLoading, data: labelers, error: labelersError } = useMyLabelersQuery();

	useFocusEffect(
		useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const { mutateAsync: setAdultContentPref, variables: optimisticAdultContent } =
		usePreferencesSetAdultContentMutation();
	const adultContentEnabled = !!(
		optimisticAdultContent?.enabled ||
		(!optimisticAdultContent && preferences.moderationPrefs.adultContentEnabled)
	);
	const ageNotSet = !preferences.userAge;
	const isUnderage = (preferences.userAge || 0) < 18;

	const onToggleAdultContentEnabled = useCallback(
		async (selected: boolean) => {
			try {
				await setAdultContentPref({
					enabled: selected,
				});
			} catch (e: any) {
				console.error("Failed to set adult content pref", {
					message: e.message,
				});
			}
		},
		[setAdultContentPref],
	);

	const disabledOnIOS = false;

	return (
		<div
			style={{
				paddingTop: 24,
				paddingLeft: gtMobile ? 24 : 16,
				paddingRight: gtMobile ? 24 : 16,
			}}
		>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					fontWeight: "600",
					paddingBottom: 12,
					...t.atoms.text_contrast_high,
				}}
			>
				Moderation tools
			</Text>
			<div
				style={{
					width: "100%",
					borderRadius: 12,
					overflow: "hidden",
					...t.atoms.bg_contrast_25,
				}}
			>
				<Link label={"View your default post interaction settings"} to="/moderation/interaction-settings">
					{(state) => (
						<SubItem
							title={"Interaction settings"}
							icon={EditBig}
							style={state.hovered || state.pressed ? t.atoms.bg_contrast_50 : undefined}
						/>
					)}
				</Link>
				<Divider />
				<Button label={"Open muted words and tags settings"} onPress={() => mutedWordsDialogControl.open()}>
					{(state) => (
						<SubItem
							title={"Muted words & tags"}
							icon={Filter}
							style={state.hovered || state.pressed ? t.atoms.bg_contrast_50 : undefined}
						/>
					)}
				</Button>
				<Divider />
				<Link label={"View your moderation lists"} to="/moderation/modlists">
					{(state) => (
						<SubItem
							title={"Moderation lists"}
							icon={Group}
							style={state.hovered || state.pressed ? t.atoms.bg_contrast_50 : undefined}
						/>
					)}
				</Link>
				<Divider />
				<Link label={"View your muted accounts"} to="/moderation/muted-accounts">
					{(state) => (
						<SubItem
							title={"Muted accounts"}
							icon={Person}
							style={state.hovered || state.pressed ? t.atoms.bg_contrast_50 : undefined}
						/>
					)}
				</Link>
				<Divider />
				<Link label={"View your blocked accounts"} to="/moderation/blocked-accounts">
					{(state) => (
						<SubItem
							title={"Blocked accounts"}
							icon={CircleBanSign}
							style={state.hovered || state.pressed ? t.atoms.bg_contrast_50 : undefined}
						/>
					)}
				</Link>
			</div>
			<Text
				style={{
					paddingTop: 24,
					paddingBottom: 12,
					fontSize: 16,
					letterSpacing: 0,
					fontWeight: "600",
					...t.atoms.text_contrast_high,
				}}
			>
				Content filters
			</Text>
			<div style={{ gap: 12 }}>
				{ageNotSet && (
					<>
						<Button
							label={"Confirm your birthdate"}
							size="small"
							variant="solid"
							color="secondary"
							onPress={() => {
								birthdateDialogControl.open();
							}}
							style={{
								justifyContent: "space-between",
								borderRadius: 12,
								paddingLeft: 16,
								paddingRight: 16,
								paddingTop: 16,
								paddingBottom: 16,
							}}
						>
							<ButtonText>Confirm your age:</ButtonText>
							<ButtonText>Set birthdate</ButtonText>
						</Button>

						<BirthDateSettingsDialog control={birthdateDialogControl} />
					</>
				)}
				<div
					style={{
						width: "100%",
						borderRadius: 12,
						overflow: "hidden",
						...t.atoms.bg_contrast_25,
					}}
				>
					{!ageNotSet && !isUnderage && (
						<>
							<div
								style={{
									paddingTop: 16,
									paddingBottom: 16,
									paddingLeft: 16,
									paddingRight: 16,
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									...(disabledOnIOS ? { opacity: 0.5 } : undefined),
								}}
							>
								<Text
									style={{
										fontWeight: "600",
										...t.atoms.text_contrast_high,
									}}
								>
									Enable adult content
								</Text>
								<Toggle.Item
									label={"Toggle to enable or disable adult content"}
									disabled={disabledOnIOS}
									name="adultContent"
									value={adultContentEnabled}
									onChange={onToggleAdultContentEnabled}
								>
									<div
										style={{
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
										}}
									>
										<Text style={t.atoms.text_contrast_medium}>
											{adultContentEnabled ? <>Enabled</> : <>Disabled</>}
										</Text>
										<Toggle.Switch />
									</div>
								</Toggle.Item>
							</div>
							<Divider />
						</>
					)}
					{!isUnderage && adultContentEnabled && (
						<>
							<GlobalLabelPreference labelDefinition={LABELS.porn} />
							<Divider />
							<GlobalLabelPreference labelDefinition={LABELS.sexual} />
							<Divider />
							<GlobalLabelPreference labelDefinition={LABELS["graphic-media"]} />
							<Divider />
						</>
					)}
					<GlobalLabelPreference labelDefinition={LABELS.nudity} />
				</div>
			</div>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					fontWeight: "600",
					paddingTop: 24,
					paddingBottom: 12,
					...t.atoms.text_contrast_high,
				}}
			>
				Advanced
			</Text>
			{isLabelersLoading ? (
				<div
					style={{
						width: "100%",
						alignItems: "center",
						padding: 16,
					}}
				>
					<Loader size="xl" />
				</div>
			) : labelersError || !labelers ? (
				<div
					style={{
						padding: 16,
						borderRadius: 8,
						...t.atoms.bg_contrast_25,
					}}
				>
					<Text>We were unable to load your configured labelers at this time.</Text>
				</div>
			) : (
				<div
					style={{
						borderRadius: 8,
						...t.atoms.bg_contrast_25,
					}}
				>
					{labelers.map((labeler, i) => {
						return (
							<Fragment key={labeler.creator.did}>
								{i !== 0 && <Divider />}
								<LabelingService.Link labeler={labeler}>
									{(state) => (
										<LabelingService.Outer
											style={{
												...(i === 0 && {
													borderTopLeftRadius: 8,
													borderTopRightRadius: 8,
												}),

												...(i === labelers.length - 1 && {
													borderBottomLeftRadius: 8,
													borderBottomRightRadius: 8,
												}),

												...(state.hovered || state.pressed
													? t.atoms.bg_contrast_50
													: undefined),
											}}
										>
											<LabelingService.Avatar avatar={labeler.creator.avatar} />
											<LabelingService.Content>
												<LabelingService.Title
													value={getLabelingServiceTitle({
														displayName: labeler.creator.displayName,
														handle: labeler.creator.handle,
													})}
												/>
												<LabelingService.Description
													value={labeler.creator.description}
													handle={labeler.creator.handle}
												/>
												{isNonConfigurableModerationAuthority(labeler.creator.did) && (
													<LabelingService.RegionalNotice />
												)}
											</LabelingService.Content>
										</LabelingService.Outer>
									)}
								</LabelingService.Link>
							</Fragment>
						);
					})}
				</div>
			)}
			<div style={{ height: 150 }} />
		</div>
	);
}
