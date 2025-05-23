import {
	type AppBskyActorDefs,
	type AppBskyFeedDefs,
	type ModerationOpts,
	type ModerationUI,
	moderateFeedGenerator,
	moderateProfile,
} from "@atproto/api";
import type { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import * as Toggle from "#/components/forms/Toggle";
import { Checkbox } from "#/components/forms/Toggle";
import { Keyboard } from "#/lib/Keyboard";
import { DISCOVER_FEED_URI, STARTER_PACK_MAX_SIZE } from "#/lib/constants";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import type { WizardAction, WizardState } from "#/screens/StarterPack/Wizard/State";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import { UserAvatar } from "#/view/com/util/UserAvatar";

function WizardListCard({
	type,
	btnType,
	displayName,
	subtitle,
	onPress,
	avatar,
	included,
	disabled,
	moderationUi,
}: {
	type: "user" | "algo";
	btnType: "checkbox" | "remove";
	profile?: AppBskyActorDefs.ProfileViewBasic;
	feed?: AppBskyFeedDefs.GeneratorView;
	displayName: string;
	subtitle: string;
	onPress: () => void;
	avatar?: string;
	included?: boolean;
	disabled?: boolean;
	moderationUi: ModerationUI;
}) {
	const t = useTheme();

	return (
		<Toggle.Item
			name={type === "user" ? "Person toggle" : "Feed toggle"}
			label={included ? `Remove ${displayName} from starter pack` : `Add ${displayName} to starter pack`}
			value={included}
			disabled={btnType === "remove" || disabled}
			onChange={onPress}
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 12,
				paddingBottom: 12,
				gap: 12,
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
			}}
		>
			<UserAvatar size={45} avatar={avatar} moderation={moderationUi} type={type} />
			<div
				style={{
					flex: 1,
					gap: 2,
				}}
			>
				<Text
					style={{
						flex: 1,
						fontWeight: "600",
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.15,
						alignSelf: "flex-start",
					}}
					numberOfLines={1}
				>
					{displayName}
				</Text>
				<Text
					style={{
						flex: 1,
						lineHeight: 1.15,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={1}
				>
					{subtitle}
				</Text>
			</div>
			{btnType === "checkbox" ? (
				<Checkbox />
			) : !disabled ? (
				<Button
					label={"Remove"}
					variant="solid"
					color="secondary"
					size="small"
					style={{
						alignSelf: "center",
						...{ marginLeft: "auto" },
					}}
					onPress={onPress}
				>
					<ButtonText>Remove</ButtonText>
				</Button>
			) : null}
		</Toggle.Item>
	);
}

export function WizardProfileCard({
	btnType,
	state,
	dispatch,
	profile,
	moderationOpts,
}: {
	btnType: "checkbox" | "remove";
	state: WizardState;
	dispatch: (action: WizardAction) => void;
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
}) {
	const { currentAccount } = useSession();

	const isMe = profile.did === currentAccount?.did;
	const included = isMe || state.profiles.some((p) => p.did === profile.did);
	const disabled = isMe || (!included && state.profiles.length >= STARTER_PACK_MAX_SIZE - 1);
	const moderationUi = moderateProfile(profile, moderationOpts).ui("avatar");
	const displayName = profile.displayName
		? sanitizeDisplayName(profile.displayName)
		: `@${sanitizeHandle(profile.handle)}`;

	const onPress = () => {
		if (disabled) return;

		Keyboard.dismiss();
		if (profile.did === currentAccount?.did) return;

		if (!included) {
			dispatch({ type: "AddProfile", profile });
		} else {
			dispatch({ type: "RemoveProfile", profileDid: profile.did });
		}
	};

	return (
		<WizardListCard
			type="user"
			btnType={btnType}
			displayName={displayName}
			subtitle={`@${sanitizeHandle(profile.handle)}`}
			onPress={onPress}
			avatar={profile.avatar}
			included={included}
			disabled={disabled}
			moderationUi={moderationUi}
		/>
	);
}

export function WizardFeedCard({
	btnType,
	generator,
	state,
	dispatch,
	moderationOpts,
}: {
	btnType: "checkbox" | "remove";
	generator: GeneratorView;
	state: WizardState;
	dispatch: (action: WizardAction) => void;
	moderationOpts: ModerationOpts;
}) {
	const isDiscover = generator.uri === DISCOVER_FEED_URI;
	const included = isDiscover || state.feeds.some((f) => f.uri === generator.uri);
	const disabled = isDiscover || (!included && state.feeds.length >= 3);
	const moderationUi = moderateFeedGenerator(generator, moderationOpts).ui("avatar");

	const onPress = () => {
		if (disabled) return;

		Keyboard.dismiss();
		if (included) {
			dispatch({ type: "RemoveFeed", feedUri: generator.uri });
		} else {
			dispatch({ type: "AddFeed", feed: generator });
		}
	};

	return (
		<WizardListCard
			type="algo"
			btnType={btnType}
			displayName={sanitizeDisplayName(generator.displayName)}
			subtitle={`Feed by @${sanitizeHandle(generator.creator.handle)}`}
			onPress={onPress}
			avatar={generator.avatar}
			included={included}
			disabled={disabled}
			moderationUi={moderationUi}
		/>
	);
}
