import type { QueryClient } from "@tanstack/react-query";
import EventEmitter from "eventemitter3";
import { useEffect, useMemo, useState } from "react";

import { batchedUpdates } from "#/lib/batchedUpdates";
import type * as bsky from "#/types/bsky";
import { findAllProfilesInQueryData as findAllProfilesInActorSearchQueryData } from "../queries/actor-search";
import { findAllProfilesInQueryData as findAllProfilesInKnownFollowersQueryData } from "../queries/known-followers";
import { findAllProfilesInQueryData as findAllProfilesInListMembersQueryData } from "../queries/list-members";
import { findAllProfilesInQueryData as findAllProfilesInListConvosQueryData } from "../queries/messages/list-conversations";
import { findAllProfilesInQueryData as findAllProfilesInMyBlockedAccountsQueryData } from "../queries/my-blocked-accounts";
import { findAllProfilesInQueryData as findAllProfilesInMyMutedAccountsQueryData } from "../queries/my-muted-accounts";
import { findAllProfilesInQueryData as findAllProfilesInFeedsQueryData } from "../queries/post-feed";
import { findAllProfilesInQueryData as findAllProfilesInPostLikedByQueryData } from "../queries/post-liked-by";
import { findAllProfilesInQueryData as findAllProfilesInPostQuotesQueryData } from "../queries/post-quotes";
import { findAllProfilesInQueryData as findAllProfilesInPostRepostedByQueryData } from "../queries/post-reposted-by";
import { findAllProfilesInQueryData as findAllProfilesInPostThreadQueryData } from "../queries/post-thread";
import { findAllProfilesInQueryData as findAllProfilesInProfileQueryData } from "../queries/profile";
import { findAllProfilesInQueryData as findAllProfilesInProfileFollowersQueryData } from "../queries/profile-followers";
import { findAllProfilesInQueryData as findAllProfilesInProfileFollowsQueryData } from "../queries/profile-follows";
import { findAllProfilesInQueryData as findAllProfilesInSuggestedFollowsQueryData } from "../queries/suggested-follows";
import { type Shadow, castAsShadow } from "./types";

export type { Shadow } from "./types";

export interface ProfileShadow {
	followingUri: string | undefined;
	muted: boolean | undefined;
	blockingUri: string | undefined;
}

const shadows: WeakMap<bsky.profile.AnyProfileView, Partial<ProfileShadow>> = new WeakMap();
const emitter = new EventEmitter();

export function useProfileShadow<TProfileView extends bsky.profile.AnyProfileView>(
	profile: TProfileView,
): Shadow<TProfileView> {
	const [shadow, setShadow] = useState(() => shadows.get(profile));
	const [prevPost, setPrevPost] = useState(profile);
	if (profile !== prevPost) {
		setPrevPost(profile);
		setShadow(shadows.get(profile));
	}

	useEffect(() => {
		function onUpdate() {
			setShadow(shadows.get(profile));
		}
		emitter.addListener(profile.did, onUpdate);
		return () => {
			emitter.removeListener(profile.did, onUpdate);
		};
	}, [profile]);

	return useMemo(() => {
		if (shadow) {
			return mergeShadow(profile, shadow);
		} else {
			return castAsShadow(profile);
		}
	}, [profile, shadow]);
}

/**
 * Same as useProfileShadow, but allows for the profile to be undefined.
 * This is useful for when the profile is not guaranteed to be loaded yet.
 */
export function useMaybeProfileShadow<TProfileView extends bsky.profile.AnyProfileView>(
	profile?: TProfileView,
): Shadow<TProfileView> | undefined {
	const [shadow, setShadow] = useState(() => (profile ? shadows.get(profile) : undefined));
	const [prevPost, setPrevPost] = useState(profile);
	if (profile !== prevPost) {
		setPrevPost(profile);
		setShadow(profile ? shadows.get(profile) : undefined);
	}

	useEffect(() => {
		if (!profile) return;
		function onUpdate() {
			if (!profile) return;
			setShadow(shadows.get(profile));
		}
		emitter.addListener(profile.did, onUpdate);
		return () => {
			emitter.removeListener(profile.did, onUpdate);
		};
	}, [profile]);

	return useMemo(() => {
		if (!profile) return undefined;
		if (shadow) {
			return mergeShadow(profile, shadow);
		} else {
			return castAsShadow(profile);
		}
	}, [profile, shadow]);
}

export function updateProfileShadow(queryClient: QueryClient, did: string, value: Partial<ProfileShadow>) {
	const cachedProfiles = findProfilesInCache(queryClient, did);
	for (const post of cachedProfiles) {
		shadows.set(post, { ...shadows.get(post), ...value });
	}
	batchedUpdates(() => {
		emitter.emit(did, value);
	});
}

function mergeShadow<TProfileView extends bsky.profile.AnyProfileView>(
	profile: TProfileView,
	shadow: Partial<ProfileShadow>,
): Shadow<TProfileView> {
	return castAsShadow({
		...profile,
		viewer: {
			...(profile.viewer || {}),
			following: "followingUri" in shadow ? shadow.followingUri : profile.viewer?.following,
			muted: "muted" in shadow ? shadow.muted : profile.viewer?.muted,
			blocking: "blockingUri" in shadow ? shadow.blockingUri : profile.viewer?.blocking,
		},
	});
}

function* findProfilesInCache(queryClient: QueryClient, did: string): Generator<bsky.profile.AnyProfileView, void> {
	yield* findAllProfilesInListMembersQueryData(queryClient, did);
	yield* findAllProfilesInMyBlockedAccountsQueryData(queryClient, did);
	yield* findAllProfilesInMyMutedAccountsQueryData(queryClient, did);
	yield* findAllProfilesInPostLikedByQueryData(queryClient, did);
	yield* findAllProfilesInPostRepostedByQueryData(queryClient, did);
	yield* findAllProfilesInPostQuotesQueryData(queryClient, did);
	yield* findAllProfilesInProfileQueryData(queryClient, did);
	yield* findAllProfilesInProfileFollowersQueryData(queryClient, did);
	yield* findAllProfilesInProfileFollowsQueryData(queryClient, did);
	yield* findAllProfilesInSuggestedFollowsQueryData(queryClient, did);
	yield* findAllProfilesInActorSearchQueryData(queryClient, did);
	yield* findAllProfilesInListConvosQueryData(queryClient, did);
	yield* findAllProfilesInFeedsQueryData(queryClient, did);
	yield* findAllProfilesInPostThreadQueryData(queryClient, did);
	yield* findAllProfilesInKnownFollowersQueryData(queryClient, did);
}
