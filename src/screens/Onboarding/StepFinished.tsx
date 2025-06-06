import type { AppBskyActorProfile, AppBskyGraphDefs, Un$Typed } from "@atproto/api";
import type { SavedFeed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { TID } from "@atproto/common-web";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { IconCircle } from "#/components/IconCircle";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { Check_Stroke2_Corner0_Rounded as Check } from "#/components/icons/Check";
import { Growth_Stroke2_Corner0_Rounded as Growth } from "#/components/icons/Growth";
import { News2_Stroke2_Corner0_Rounded as News } from "#/components/icons/News2";
import { Trending2_Stroke2_Corner2_Rounded as Trending } from "#/components/icons/Trending2";
import { uploadBlob } from "#/lib/api";
import { BSKY_APP_ACCOUNT_DID, DISCOVER_SAVED_FEED, TIMELINE_SAVED_FEED } from "#/lib/constants";
import { DescriptionText, OnboardingControls, TitleText } from "#/screens/Onboarding/Layout";
import { Context } from "#/screens/Onboarding/state";
import { bulkWriteFollows } from "#/screens/Onboarding/util";
import { useSetHasCheckedForStarterPack } from "#/state/preferences/used-starter-packs";
import { preferencesQueryKey } from "#/state/queries/preferences";
import { RQKEY as profileRQKey } from "#/state/queries/profile";
import { useAgent } from "#/state/session";
import { useOnboardingDispatch } from "#/state/shell";
import { useProgressGuideControls } from "#/state/shell/progress-guide";
import { useActiveStarterPack, useSetActiveStarterPack } from "#/state/shell/starter-pack";

export function StepFinished() {
	const t = useTheme();
	const { state, dispatch } = React.useContext(Context);
	const onboardDispatch = useOnboardingDispatch();
	const [saving, setSaving] = React.useState(false);
	const queryClient = useQueryClient();
	const agent = useAgent();
	const activeStarterPack = useActiveStarterPack();
	const setActiveStarterPack = useSetActiveStarterPack();
	const setHasCheckedForStarterPack = useSetHasCheckedForStarterPack();
	const { startProgressGuide } = useProgressGuideControls();

	const finishOnboarding = React.useCallback(async () => {
		setSaving(true);

		let starterPack: AppBskyGraphDefs.StarterPackView | undefined;
		let listItems: AppBskyGraphDefs.ListItemView[] | undefined;

		try {
			const { interestsStepResults, profileStepResults } = state;
			const { selectedInterests } = interestsStepResults;

			await Promise.all([
				bulkWriteFollows(agent, [BSKY_APP_ACCOUNT_DID, ...(listItems?.map((i) => i.subject.did) ?? [])]),
				(async () => {
					// Interests need to get saved first, then we can write the feeds to prefs
					await agent.setInterestsPref({ tags: selectedInterests });

					// Default feeds that every user should have pinned when landing in the app
					const feedsToSave: SavedFeed[] = [
						{
							...DISCOVER_SAVED_FEED,
							id: TID.nextStr(),
						},
						{
							...TIMELINE_SAVED_FEED,
							id: TID.nextStr(),
						},
					];

					// Any starter pack feeds will be pinned _after_ the defaults
					if (starterPack?.feeds?.length) {
						feedsToSave.push(
							...starterPack.feeds.map((f) => ({
								type: "feed",
								value: f.uri,
								pinned: true,
								id: TID.nextStr(),
							})),
						);
					}

					await agent.overwriteSavedFeeds(feedsToSave);
				})(),
				(async () => {
					const { imageUri, imageMime } = profileStepResults;
					const blobPromise = imageUri && imageMime ? uploadBlob(agent, imageUri, imageMime) : undefined;

					await agent.upsertProfile(async (existing) => {
						const next: Un$Typed<AppBskyActorProfile.Record> = existing ?? {};

						if (blobPromise) {
							const res = await blobPromise;
							if (res.data.blob) {
								next.avatar = res.data.blob;
							}
						}

						if (starterPack) {
							next.joinedViaStarterPack = {
								uri: starterPack.uri,
								cid: starterPack.cid,
							};
						}

						next.displayName = "";
						// HACKFIX
						// creating a bunch of identical profile objects is breaking the relay
						// tossing this unspecced field onto it to reduce the size of the problem
						// -prf
						next.createdAt = new Date().toISOString();
						return next;
					});
				})(),
			]);
		} catch (e: any) {
			console.error(e);
			// don't alert the user, just let them into their account
		}

		// Try to ensure that prefs and profile are up-to-date by the time we render Home.
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: preferencesQueryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: profileRQKey(agent.session?.did ?? ""),
			}),
		]).catch((e) => {
			console.error(e);
			// Keep going.
		});

		setSaving(false);
		setActiveStarterPack(undefined);
		setHasCheckedForStarterPack(true);
		startProgressGuide("follow-10");
		dispatch({ type: "finish" });
		onboardDispatch({ type: "finish" });
	}, [
		queryClient,
		agent,
		dispatch,
		onboardDispatch,
		state,
		setActiveStarterPack,
		setHasCheckedForStarterPack,
		startProgressGuide,
	]);

	return (
		<div style={{ alignItems: "flex-start" }}>
			<IconCircle icon={Check} style={{ marginBottom: 24 }} />
			<TitleText>You're ready to go!</TitleText>
			<DescriptionText>We hope you have a wonderful time. Remember, Bluesky is:</DescriptionText>
			<div
				style={{
					paddingTop: 40,
					gap: 28,
				}}
			>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						width: "100%",
						gap: 16,
					}}
				>
					<IconCircle icon={Growth} size="lg" style={{ width: 48, height: 48 }} />
					<div
						style={{
							flex: 1,
							gap: 4,
						}}
					>
						<Text
							style={{
								fontWeight: "600",
								fontSize: 18,
								letterSpacing: 0,
							}}
						>
							Public
						</Text>
						<Text
							style={{
								...t.atoms.text_contrast_medium,
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							Your posts, likes, and blocks are public. Mutes are private.
						</Text>
					</div>
				</div>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						width: "100%",
						gap: 16,
					}}
				>
					<IconCircle icon={News} size="lg" style={{ width: 48, height: 48 }} />
					<div
						style={{
							flex: 1,
							gap: 4,
						}}
					>
						<Text
							style={{
								fontWeight: "600",
								fontSize: 18,
								letterSpacing: 0,
							}}
						>
							Open
						</Text>
						<Text
							style={{
								...t.atoms.text_contrast_medium,
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							Never lose access to your followers or data.
						</Text>
					</div>
				</div>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						width: "100%",
						gap: 16,
					}}
				>
					<IconCircle icon={Trending} size="lg" style={{ width: 48, height: 48 }} />
					<div
						style={{
							flex: 1,
							gap: 4,
						}}
					>
						<Text
							style={{
								fontWeight: "600",
								fontSize: 18,
								letterSpacing: 0,
							}}
						>
							Flexible
						</Text>
						<Text
							style={{
								...t.atoms.text_contrast_medium,
								fontSize: 16,
								letterSpacing: 0,
								lineHeight: 1.3,
							}}
						>
							Choose the algorithms that power your custom feeds.
						</Text>
					</div>
				</div>
			</div>
			<OnboardingControls.Portal>
				<Button
					disabled={saving}
					key={state.activeStep} // remove focus state on nav
					variant="gradient"
					color="gradient_sky"
					size="large"
					label={"Complete onboarding and start using your account"}
					onPress={finishOnboarding}
				>
					<ButtonText>{saving ? <>Finalizing</> : <>Let's go!</>}</ButtonText>
					{saving && <ButtonIcon icon={Loader} position="right" />}
				</Button>
			</OnboardingControls.Portal>
		</div>
	);
}
