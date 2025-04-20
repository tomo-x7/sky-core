import { type AppBskyActorDefs, type ModerationDecision, moderateProfile } from "@atproto/api";
import React, { useCallback } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useBreakpoints, useTheme } from "#/alf";
import { useDialogControl } from "#/components/Dialog";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Error } from "#/components/Error";
import * as Layout from "#/components/Layout";
import { Loader } from "#/components/Loader";
import { VerifyEmailDialog } from "#/components/dialogs/VerifyEmailDialog";
import { MessagesListBlockedFooter } from "#/components/dms/MessagesListBlockedFooter";
import { MessagesListHeader } from "#/components/dms/MessagesListHeader";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { useEmail } from "#/lib/hooks/useEmail";
import { useEnableKeyboardControllerScreen } from "#/lib/hooks/useEnableKeyboardController";
import type { RouteParam } from "#/lib/routes/types";
import { MessagesList } from "#/screens/Messages/components/MessagesList";
import { type Shadow, useMaybeProfileShadow } from "#/state/cache/profile-shadow";
import { ConvoProvider, isConvoActive, useConvo } from "#/state/messages/convo";
import { ConvoStatus } from "#/state/messages/convo/types";
import { useCurrentConvoId } from "#/state/messages/current-convo-id";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useProfileQuery } from "#/state/queries/profile";
import { useSetMinimalShellMode } from "#/state/shell";

export function MessagesConversationScreen() {
	const { gtMobile } = useBreakpoints();
	const setMinimalShellMode = useSetMinimalShellMode();

	const convoId = useParams<RouteParam<"MessagesConversation">>().conversation!;
	const { setCurrentConvoId } = useCurrentConvoId();

	useEnableKeyboardControllerScreen(true);

	useFocusEffect(
		useCallback(() => {
			setCurrentConvoId(convoId);

			if (!gtMobile) {
				setMinimalShellMode(true);
			} else {
				setMinimalShellMode(false);
			}

			return () => {
				setCurrentConvoId(undefined);
				setMinimalShellMode(false);
			};
		}, [gtMobile, convoId, setCurrentConvoId, setMinimalShellMode]),
	);

	return (
		<Layout.Screen
			style={{
				...{ minHeight: 0 },
				flex: 1,
			}}
		>
			<ConvoProvider key={convoId} convoId={convoId}>
				<Inner />
			</ConvoProvider>
		</Layout.Screen>
	);
}

function Inner() {
	const t = useTheme();
	const convoState = useConvo();

	const moderationOpts = useModerationOpts();
	const { data: recipientUnshadowed } = useProfileQuery({
		did: convoState.recipients?.[0].did,
	});
	const recipient = useMaybeProfileShadow(recipientUnshadowed);

	const moderation = React.useMemo(() => {
		if (!recipient || !moderationOpts) return null;
		return moderateProfile(recipient, moderationOpts);
	}, [recipient, moderationOpts]);

	// Because we want to give the list a chance to asynchronously scroll to the end before it is visible to the user,
	// we use `hasScrolled` to determine when to render. With that said however, there is a chance that the chat will be
	// empty. So, we also check for that possible state as well and render once we can.
	const [hasScrolled, setHasScrolled] = React.useState(false);
	const readyToShow =
		hasScrolled || (isConvoActive(convoState) && !convoState.isFetchingHistory && convoState.items.length === 0);

	// Any time that we re-render the `Initializing` state, we have to reset `hasScrolled` to false. After entering this
	// state, we know that we're resetting the list of messages and need to re-scroll to the bottom when they get added.
	React.useEffect(() => {
		if (convoState.status === ConvoStatus.Initializing) {
			setHasScrolled(false);
		}
	}, [convoState.status]);

	if (convoState.status === ConvoStatus.Error) {
		return (
			<Layout.Center style={{ flex: 1 }}>
				<MessagesListHeader />
				<Error
					title={"Something went wrong"}
					message={`We couldn't load this conversation`}
					onRetry={() => convoState.error.retry()}
					sideBorders={false}
				/>
			</Layout.Center>
		);
	}

	return (
		<Layout.Center style={{ flex: 1 }}>
			{!readyToShow &&
				(moderation ? (
					<MessagesListHeader moderation={moderation} profile={recipient} />
				) : (
					<MessagesListHeader />
				))}
			<div style={{ flex: 1 }}>
				{moderation && recipient ? (
					<InnerReady
						moderation={moderation}
						recipient={recipient}
						hasScrolled={hasScrolled}
						setHasScrolled={setHasScrolled}
					/>
				) : (
					<div
						style={{
							alignItems: "center",
							gap: 8,
							flex: 1,
						}}
					/>
				)}
				{!readyToShow && (
					<div
						style={{
							position: "absolute",
							zIndex: 10,
							width: "100%",
							height: "100%",
							justifyContent: "center",
							alignItems: "center",
							...t.atoms.bg,
						}}
					>
						<div style={{ marginBottom: 75 }}>
							<Loader size="xl" />
						</div>
					</div>
				)}
			</div>
		</Layout.Center>
	);
}

function InnerReady({
	moderation,
	recipient,
	hasScrolled,
	setHasScrolled,
}: {
	moderation: ModerationDecision;
	recipient: Shadow<AppBskyActorDefs.ProfileViewDetailed>;
	hasScrolled: boolean;
	setHasScrolled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const convoState = useConvo();
	const { conversation } = useParams<RouteParam<"MessagesConversation">>();
	const { embed, accept }: { embed?: string; accept?: string } = useLocation().state;
	const verifyEmailControl = useDialogControl();
	const { needsEmailVerification } = useEmail();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (needsEmailVerification) {
			verifyEmailControl.open();
		}
	}, [needsEmailVerification, verifyEmailControl]);

	return (
		<>
			<MessagesListHeader profile={recipient} moderation={moderation} />
			{isConvoActive(convoState) && (
				<MessagesList
					hasScrolled={hasScrolled}
					setHasScrolled={setHasScrolled}
					blocked={moderation?.blocked}
					hasAcceptOverride={!!accept}
					footer={
						<MessagesListBlockedFooter
							recipient={recipient}
							convoId={convoState.convo.id}
							hasMessages={convoState.items.length > 0}
							moderation={moderation}
						/>
					}
				/>
			)}
			<VerifyEmailDialog
				reasonText={"Before you may message another user, you must first verify your email."}
				control={verifyEmailControl}
				onCloseWithoutVerifying={() => {
					navigate(-1);
				}}
			/>
		</>
	);
}
