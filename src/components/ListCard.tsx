import { type AppBskyGraphDefs, AtUri, type ModerationUI, moderateUserList } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { Avatar, Description, Header, Outer, SaveButton } from "#/components/FeedCard";
import { Link as InternalLink, type LinkProps } from "#/components/Link";
import { Text } from "#/components/Typography";
import * as Hider from "#/components/moderation/Hider";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { precacheList } from "#/state/queries/feed";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";

/*
 * This component is based on `FeedCard` and is tightly coupled with that
 * component. Please refer to `FeedCard` for more context.
 */

export {
	Avatar,
	AvatarPlaceholder,
	Description,
	Header,
	Outer,
	SaveButton,
	TitleAndBylinePlaceholder,
} from "#/components/FeedCard";

const CURATELIST = "app.bsky.graph.defs#curatelist";
const MODLIST = "app.bsky.graph.defs#modlist";

type Props = {
	view: AppBskyGraphDefs.ListView;
	showPinButton?: boolean;
};

export function Default(props: Props) {
	const { view, showPinButton } = props;
	const moderationOpts = useModerationOpts();
	const moderation = moderationOpts ? moderateUserList(view, moderationOpts) : undefined;

	return (
		<Link {...props}>
			<Outer>
				<Header>
					<Avatar src={view.avatar} />
					<TitleAndByline
						title={view.name}
						creator={view.creator}
						purpose={view.purpose}
						modUi={moderation?.ui("contentView")}
					/>
					{showPinButton && view.purpose === CURATELIST && <SaveButton view={view} pin />}
				</Header>
				<Description description={view.description} />
			</Outer>
		</Link>
	);
}

export function Link({ view, children, ...props }: Props & Omit<LinkProps, "to" | "label">) {
	const queryClient = useQueryClient();

	const href = React.useMemo(() => {
		return createProfileListHref({ list: view });
	}, [view]);

	React.useEffect(() => {
		precacheList(queryClient, view);
	}, [view, queryClient]);

	return (
		<InternalLink label={view.name} to={href} {...props}>
			{children}
		</InternalLink>
	);
}

export function TitleAndByline({
	title,
	creator,
	purpose = CURATELIST,
	modUi,
}: {
	title: string;
	creator?: bsky.profile.AnyProfileView;
	purpose?: AppBskyGraphDefs.ListView["purpose"];
	modUi?: ModerationUI;
}) {
	const t = useTheme();
	const { currentAccount } = useSession();

	return (
		<div style={{ flex: 1 }}>
			<Hider.Outer
				modui={modUi}
				isContentVisibleInitialState={creator && currentAccount?.did === creator.did}
				allowOverride={creator && currentAccount?.did === creator.did}
			>
				<Hider.Mask>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							lineHeight: 1.3,
							fontStyle: "italic",
						}}
						numberOfLines={1}
					>
						Hidden list
					</Text>
				</Hider.Mask>
				<Hider.Content>
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							lineHeight: 1.3,
						}}
						numberOfLines={1}
					>
						{title}
					</Text>
				</Hider.Content>
			</Hider.Outer>
			{creator && (
				<Text
					style={{
						lineHeight: 1.3,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={1}
				>
					{purpose === MODLIST
						? `Moderation list by ${sanitizeHandle(creator.handle, "@")}`
						: `List by ${sanitizeHandle(creator.handle, "@")}`}
				</Text>
			)}
		</div>
	);
}

export function createProfileListHref({
	list,
}: {
	list: AppBskyGraphDefs.ListView;
}) {
	const urip = new AtUri(list.uri);
	const handleOrDid = list.creator.handle || list.creator.did;
	return `/profile/${handleOrDid}/lists/${urip.rkey}`;
}
