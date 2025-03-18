import { type AppBskyActorDefs, AppBskyFeedGetAuthorFeed, AtUri } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React from "react";

import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import type { NavigationProp } from "#/lib/routes/types";
import { cleanError } from "#/lib/strings/errors";
import type { FeedDescriptor } from "#/state/queries/post-feed";
import { useRemoveFeedMutation } from "#/state/queries/preferences";
import { EmptyState } from "../util/EmptyState";
import * as Toast from "../util/Toast";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Button } from "../util/forms/Button";

export enum KnownError {
	Block = "Block",
	FeedgenDoesNotExist = "FeedgenDoesNotExist",
	FeedgenMisconfigured = "FeedgenMisconfigured",
	FeedgenBadResponse = "FeedgenBadResponse",
	FeedgenOffline = "FeedgenOffline",
	FeedgenUnknown = "FeedgenUnknown",
	FeedSignedInOnly = "FeedSignedInOnly",
	FeedTooManyRequests = "FeedTooManyRequests",
	Unknown = "Unknown",
}

export function PostFeedErrorMessage({
	feedDesc,
	error,
	onPressTryAgain,
	savedFeedConfig,
}: {
	feedDesc: FeedDescriptor;
	error?: Error;
	onPressTryAgain: () => void;
	savedFeedConfig?: AppBskyActorDefs.SavedFeed;
}) {
	const knownError = React.useMemo(() => detectKnownError(feedDesc, error), [feedDesc, error]);
	if (typeof knownError !== "undefined" && knownError !== KnownError.Unknown && feedDesc.startsWith("feedgen")) {
		return (
			<FeedgenErrorMessage
				feedDesc={feedDesc}
				knownError={knownError}
				rawError={error}
				savedFeedConfig={savedFeedConfig}
			/>
		);
	}

	if (knownError === KnownError.Block) {
		return <EmptyState icon="ban" message={"Posts hidden"} style={{ paddingTop: 40, paddingBottom: 40 }} />;
	}

	return <ErrorMessage message={cleanError(error)} onPressTryAgain={onPressTryAgain} />;
}

function FeedgenErrorMessage({
	feedDesc,
	knownError,
	rawError,
	savedFeedConfig,
}: {
	feedDesc: FeedDescriptor;
	knownError: KnownError;
	rawError?: Error;
	savedFeedConfig?: AppBskyActorDefs.SavedFeed;
}) {
	const pal = usePalette("default");
	const navigation = useNavigation<NavigationProp>();
	const msg = React.useMemo(
		() =>
			({
				[KnownError.Unknown]: "",
				[KnownError.Block]: "",
				[KnownError.FeedgenDoesNotExist]: `Hmm, we're having trouble finding this feed. It may have been deleted.`,
				[KnownError.FeedgenMisconfigured]:
					"Hmm, the feed server appears to be misconfigured. Please let the feed owner know about this issue.",
				[KnownError.FeedgenBadResponse]:
					"Hmm, the feed server gave a bad response. Please let the feed owner know about this issue.",
				[KnownError.FeedgenOffline]:
					"Hmm, the feed server appears to be offline. Please let the feed owner know about this issue.",
				[KnownError.FeedSignedInOnly]: "This content is not viewable without a Bluesky account.",
				[KnownError.FeedgenUnknown]:
					"Hmm, some kind of issue occurred when contacting the feed server. Please let the feed owner know about this issue.",
				[KnownError.FeedTooManyRequests]:
					"This feed is currently receiving high traffic and is temporarily unavailable. Please try again later.",
			})[knownError],
		[knownError],
	);
	const [uri] = feedDesc.split("|");
	const [ownerDid] = safeParseFeedgenUri(uri);
	const removePromptControl = Prompt.usePromptControl();
	const { mutateAsync: removeFeed } = useRemoveFeedMutation();

	const onViewProfile = React.useCallback(() => {
		navigation.navigate("Profile", { name: ownerDid });
	}, [navigation, ownerDid]);

	const onPressRemoveFeed = React.useCallback(() => {
		removePromptControl.open();
	}, [removePromptControl]);

	const onRemoveFeed = React.useCallback(async () => {
		try {
			if (!savedFeedConfig) return;
			await removeFeed(savedFeedConfig);
		} catch (err) {
			Toast.show(
				"There was an issue removing this feed. Please check your internet connection and try again.",
				"exclamation-circle",
			);
			console.error("Failed to remove feed", { message: err });
		}
	}, [removeFeed, savedFeedConfig]);

	const cta = React.useMemo(() => {
		switch (knownError) {
			case KnownError.FeedSignedInOnly: {
				return null;
			}
			case KnownError.FeedgenDoesNotExist:
			case KnownError.FeedgenMisconfigured:
			case KnownError.FeedgenBadResponse:
			case KnownError.FeedgenOffline:
			case KnownError.FeedgenUnknown: {
				return (
					<div style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
						{knownError === KnownError.FeedgenDoesNotExist && savedFeedConfig && (
							<Button type="inverted" label={"Remove feed"} onPress={onRemoveFeed} />
						)}
						<Button type="default-light" label={"View profile"} onPress={onViewProfile} />
					</div>
				);
			}
		}
	}, [knownError, onViewProfile, onRemoveFeed, savedFeedConfig]);

	return (
		<>
			<div
				style={{
					...pal.border,
					...pal.viewLight,

					...{
						borderTopWidth: 1,
						paddingHorizontal: 20,
						paddingVertical: 18,
						gap: 12,
					},
				}}
			>
				<Text style={pal.text}>{msg}</Text>

				{rawError?.message && (
					<Text style={pal.textLight}>
						<>Message from server: {rawError.message}</>
					</Text>
				)}

				{cta}
			</div>
			<Prompt.Basic
				control={removePromptControl}
				title={"Remove feed?"}
				description={"Remove this feed from your saved feeds"}
				onConfirm={onPressRemoveFeed}
				confirmButtonCta={"Remove"}
				confirmButtonColor="negative"
			/>
		</>
	);
}

function safeParseFeedgenUri(uri: string): [string, string] {
	try {
		const urip = new AtUri(uri);
		return [urip.hostname, urip.rkey];
	} catch {
		return ["", ""];
	}
}

function detectKnownError(feedDesc: FeedDescriptor, error: any): KnownError | undefined {
	if (!error) {
		return undefined;
	}
	if (
		error instanceof AppBskyFeedGetAuthorFeed.BlockedActorError ||
		error instanceof AppBskyFeedGetAuthorFeed.BlockedByActorError
	) {
		return KnownError.Block;
	}

	// check status codes
	if (error?.status === 429) {
		return KnownError.FeedTooManyRequests;
	}

	// convert error to string and continue
	if (typeof error !== "string") {
		error = error.toString();
	}
	if (error.includes(KnownError.FeedSignedInOnly)) {
		return KnownError.FeedSignedInOnly;
	}
	if (!feedDesc.startsWith("feedgen")) {
		return KnownError.Unknown;
	}
	if (error.includes("could not find feed")) {
		return KnownError.FeedgenDoesNotExist;
	}
	if (error.includes("feed unavailable")) {
		return KnownError.FeedgenOffline;
	}
	if (error.includes("invalid did document")) {
		return KnownError.FeedgenMisconfigured;
	}
	if (error.includes("could not resolve did document")) {
		return KnownError.FeedgenMisconfigured;
	}
	if (error.includes("invalid feed generator service details in did document")) {
		return KnownError.FeedgenMisconfigured;
	}
	if (error.includes("invalid response")) {
		return KnownError.FeedgenBadResponse;
	}
	return KnownError.FeedgenUnknown;
}
