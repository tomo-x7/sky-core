import { type AppBskyFeedDefs, type AppBskyGraphDefs, AtUri, RichText as RichTextApi } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Link as InternalLink, type LinkProps } from "#/components/Link";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { RichText, type RichTextProps } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "#/components/icons/Plus";
import { Trash_Stroke2_Corner0_Rounded as Trash } from "#/components/icons/Trash";
import { sanitizeHandle } from "#/lib/strings/handles";
import { precacheFeedFromGeneratorView } from "#/state/queries/feed";
import { useAddSavedFeedsMutation, usePreferencesQuery, useRemoveFeedMutation } from "#/state/queries/preferences";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import * as Toast from "#/view/com/util/Toast";
import { UserAvatar } from "#/view/com/util/UserAvatar";

type Props = {
	view: AppBskyFeedDefs.GeneratorView;
};

export function Default(props: Props) {
	const { view } = props;
	return (
		<Link {...props}>
			<Outer>
				<Header>
					<Avatar src={view.avatar} />
					<TitleAndByline title={view.displayName} creator={view.creator} />
					<SaveButton view={view} pin />
				</Header>
				<Description description={view.description} />
				<Likes count={view.likeCount || 0} />
			</Outer>
		</Link>
	);
}

export function Link({ view, children, ...props }: Props & Omit<LinkProps, "to" | "label">) {
	const queryClient = useQueryClient();

	const href = React.useMemo(() => {
		return createProfileFeedHref({ feed: view });
	}, [view]);

	React.useEffect(() => {
		precacheFeedFromGeneratorView(queryClient, view);
	}, [view, queryClient]);

	return (
		<InternalLink label={view.displayName} to={href} style={{ flexDirection: "column" }} {...props}>
			{children}
		</InternalLink>
	);
}

export function Outer({ children }: { children: React.ReactNode }) {
	return <div style={{ width: "100%", gap: 12 }}>{children}</div>;
}

export function Header({ children }: { children: React.ReactNode }) {
	return <div style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>{children}</div>;
}

export type AvatarProps = { src: string | undefined; size?: number };

export function Avatar({ src, size = 40 }: AvatarProps) {
	return <UserAvatar type="algo" size={size} avatar={src} />;
}

export function AvatarPlaceholder({ size = 40 }: Omit<AvatarProps, "src">) {
	const t = useTheme();
	return (
		<div
			style={{
				...t.atoms.bg_contrast_25,

				width: size,
				height: size,
				borderRadius: 8,
			}}
		/>
	);
}

export function TitleAndByline({
	title,
	creator,
}: {
	title: string;
	creator?: bsky.profile.AnyProfileView;
}) {
	const t = useTheme();

	return (
		<div style={{ flex: 1 }}>
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
			{creator && (
				<Text
					style={{
						lineHeight: 1.3,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={1}
				>
					<>Feed by {sanitizeHandle(creator.handle, "@")}</>
				</Text>
			)}
		</div>
	);
}

export function TitleAndBylinePlaceholder({ creator }: { creator?: boolean }) {
	const t = useTheme();

	return (
		<div style={{ flex: 1, gap: 4 }}>
			<div
				style={{
					borderRadius: 4,
					...t.atoms.bg_contrast_50,

					width: "60%",
					height: 14,
				}}
			/>
			{creator && (
				<div
					style={{
						borderRadius: 4,
						...t.atoms.bg_contrast_25,

						width: "40%",
						height: 10,
					}}
				/>
			)}
		</div>
	);
}

export function Description({ description, ...rest }: { description?: string } & Partial<RichTextProps>) {
	const rt = React.useMemo(() => {
		if (!description) return;
		const rt = new RichTextApi({ text: description || "" });
		rt.detectFacetsWithoutResolution();
		return rt;
	}, [description]);
	if (!rt) return null;
	return <RichText value={rt} style={{ lineHeight: 1.3 }} disableLinks {...rest} />;
}

export function DescriptionPlaceholder() {
	const t = useTheme();
	return (
		<div style={{ gap: 4 }}>
			<div style={{ borderRadius: 4, width: "100%", ...t.atoms.bg_contrast_50, height: 12 }} />
			<div style={{ borderRadius: 4, width: "100%", ...t.atoms.bg_contrast_50, height: 12 }} />
			<div style={{ borderRadius: 4, ...t.atoms.bg_contrast_50, height: 12, width: 100 }} />
		</div>
	);
}

export function Likes({ count }: { count: number }) {
	const t = useTheme();
	return (
		<Text
			style={{
				fontSize: 14,
				letterSpacing: 0,
				...t.atoms.text_contrast_medium,
			}}
		>
			<>
				Liked by {count || 0} {count === 1 ? "user" : "users"}
			</>
		</Text>
	);
}

export function SaveButton({
	view,
	pin,
}: {
	view: AppBskyFeedDefs.GeneratorView | AppBskyGraphDefs.ListView;
	pin?: boolean;
}) {
	const { hasSession } = useSession();
	if (!hasSession) return null;
	return <SaveButtonInner view={view} pin={pin} />;
}

function SaveButtonInner({
	view,
	pin,
}: {
	view: AppBskyFeedDefs.GeneratorView | AppBskyGraphDefs.ListView;
	pin?: boolean;
}) {
	const { data: preferences } = usePreferencesQuery();
	const { isPending: isAddSavedFeedPending, mutateAsync: saveFeeds } = useAddSavedFeedsMutation();
	const { isPending: isRemovePending, mutateAsync: removeFeed } = useRemoveFeedMutation();

	const uri = view.uri;
	const type = view.uri.includes("app.bsky.feed.generator") ? "feed" : "list";

	const savedFeedConfig = React.useMemo(() => {
		return preferences?.savedFeeds?.find((feed) => feed.value === uri);
	}, [preferences?.savedFeeds, uri]);
	const removePromptControl = Prompt.usePromptControl();
	const isPending = isAddSavedFeedPending || isRemovePending;

	const toggleSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			e.stopPropagation();

			try {
				if (savedFeedConfig) {
					await removeFeed(savedFeedConfig);
				} else {
					await saveFeeds([
						{
							type,
							value: uri,
							pinned: pin || false,
						},
					]);
				}
				Toast.show("Feeds updated!");
			} catch (err) {
				console.error(err, { message: "FeedCard: failed to update feeds", pin });
				Toast.show("Failed to update feeds", "xmark");
			}
		},
		[pin, saveFeeds, removeFeed, uri, savedFeedConfig, type],
	);

	const onPrompRemoveFeed = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			e.stopPropagation();

			removePromptControl.open();
		},
		[removePromptControl],
	);

	return (
		<>
			<Button
				disabled={isPending}
				label={"Add this feed to your feeds"}
				size="small"
				variant="ghost"
				color="secondary"
				shape="square"
				onPress={savedFeedConfig ? onPrompRemoveFeed : toggleSave}
			>
				{savedFeedConfig ? (
					<ButtonIcon size="md" icon={isPending ? Loader : Trash} />
				) : (
					<ButtonIcon size="md" icon={isPending ? Loader : Plus} />
				)}
			</Button>

			<Prompt.Basic
				control={removePromptControl}
				title={"Remove from your feeds?"}
				description={"Are you sure you want to remove this from your feeds?"}
				onConfirm={toggleSave}
				confirmButtonCta={"Remove"}
				confirmButtonColor="negative"
			/>
		</>
	);
}

export function createProfileFeedHref({
	feed,
}: {
	feed: AppBskyFeedDefs.GeneratorView;
}) {
	const urip = new AtUri(feed.uri);
	const handleOrDid = feed.creator.handle || feed.creator.did;
	return `/profile/${handleOrDid}/feed/${urip.rkey}`;
}
