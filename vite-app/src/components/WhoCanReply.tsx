import { type AppBskyFeedDefs, AppBskyFeedPost, type AppBskyGraphDefs, AtUri } from "@atproto/api";
import React from "react";
import { Platform } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { useDialogControl } from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import {
	PostInteractionSettingsDialog,
	usePrefetchPostInteractionSettings,
} from "#/components/dialogs/PostInteractionSettingsDialog";
import { CircleBanSign_Stroke2_Corner0_Rounded as CircleBanSign } from "#/components/icons/CircleBanSign";
import { Earth_Stroke2_Corner0_Rounded as Earth } from "#/components/icons/Globe";
import { Group3_Stroke2_Corner0_Rounded as Group } from "#/components/icons/Group";
import { HITSLOP_10 } from "#/lib/constants";
import { makeListLink, makeProfileLink } from "#/lib/routes/links";
import { type ThreadgateAllowUISetting, threadgateViewToAllowUISetting } from "#/state/queries/threadgate";
import * as bsky from "#/types/bsky";
import { PencilLine_Stroke2_Corner0_Rounded as PencilLine } from "./icons/Pencil";

interface WhoCanReplyProps {
	post: AppBskyFeedDefs.PostView;
	isThreadAuthor: boolean;
	style?: React.CSSProperties;
}

export function WhoCanReply({ post, isThreadAuthor, style }: WhoCanReplyProps) {
	const t = useTheme();
	const infoDialogControl = useDialogControl();
	const editDialogControl = useDialogControl();

	/*
	 * `WhoCanReply` is only used for root posts atm, in case this changes
	 * unexpectedly, we should check to make sure it's for sure the root URI.
	 */
	const rootUri =
		bsky.dangerousIsType<AppBskyFeedPost.Record>(post.record, AppBskyFeedPost.isRecord) && post.record.reply?.root
			? post.record.reply.root.uri
			: post.uri;
	const settings = React.useMemo(() => {
		return threadgateViewToAllowUISetting(post.threadgate);
	}, [post.threadgate]);

	const prefetchPostInteractionSettings = usePrefetchPostInteractionSettings({
		postUri: post.uri,
		rootPostUri: rootUri,
	});

	const anyoneCanReply = settings.length === 1 && settings[0].type === "everybody";
	const noOneCanReply = settings.length === 1 && settings[0].type === "nobody";
	const description = anyoneCanReply
		? "Everybody can reply"
		: noOneCanReply
			? "Replies disabled"
			: "Some people can reply";

	const onPressOpen = () => {
		if (isThreadAuthor) {
			editDialogControl.open();
		} else {
			infoDialogControl.open();
		}
	};

	return (
		<>
			<Button
				label={isThreadAuthor ? "Edit who can reply" : "Who can reply"}
				onPress={onPressOpen}
				{...(isThreadAuthor
					? Platform.select({
							web: {
								onHoverIn: prefetchPostInteractionSettings,
							},
							native: {
								onPressIn: prefetchPostInteractionSettings,
							},
						})
					: {})}
				hitSlop={HITSLOP_10}
			>
				{({ hovered }) => (
					<div
						style={{
							...a.flex_row,
							...a.align_center,
							...a.gap_xs,
							...style,
						}}
					>
						<Icon color={t.palette.contrast_400} width={16} settings={settings} />
						<Text
							style={{
								...a.text_sm,
								...a.leading_tight,
								...t.atoms.text_contrast_medium,
								...(hovered && a.underline),
							}}
						>
							{description}
						</Text>

						{isThreadAuthor && <PencilLine width={12} fill={t.palette.primary_500} />}
					</div>
				)}
			</Button>
			{isThreadAuthor ? (
				<PostInteractionSettingsDialog
					postUri={post.uri}
					rootPostUri={rootUri}
					control={editDialogControl}
					initialThreadgateView={post.threadgate}
				/>
			) : (
				<WhoCanReplyDialog
					control={infoDialogControl}
					post={post}
					settings={settings}
					embeddingDisabled={Boolean(post.viewer?.embeddingDisabled)}
				/>
			)}
		</>
	);
}

function Icon({
	color,
	width,
	settings,
}: {
	color: string;
	width?: number;
	settings: ThreadgateAllowUISetting[];
}) {
	const isEverybody = settings.length === 0;
	const isNobody = !!settings.find((gate) => gate.type === "nobody");
	const IconComponent = isEverybody ? Earth : isNobody ? CircleBanSign : Group;
	return <IconComponent fill={color} width={width} />;
}

function WhoCanReplyDialog({
	control,
	post,
	settings,
	embeddingDisabled,
}: {
	control: Dialog.DialogControlProps;
	post: AppBskyFeedDefs.PostView;
	settings: ThreadgateAllowUISetting[];
	embeddingDisabled: boolean;
}) {
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<Dialog.ScrollableInner
				label={"Dialog: adjust who can interact with this post"}
				style={{ width: "auto", maxWidth: 400, minWidth: 200 }}
			>
				<div style={a.gap_sm}>
					<Text
						style={{
							...a.font_bold,
							...a.text_xl,
							...a.pb_sm,
						}}
					>
						Who can interact with this post?
					</Text>
					<Rules post={post} settings={settings} embeddingDisabled={embeddingDisabled} />
				</div>
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}

function Rules({
	post,
	settings,
	embeddingDisabled,
}: {
	post: AppBskyFeedDefs.PostView;
	settings: ThreadgateAllowUISetting[];
	embeddingDisabled: boolean;
}) {
	const t = useTheme();

	return (
		<>
			<Text
				style={{
					...a.text_sm,
					...a.leading_snug,
					...a.flex_wrap,
					...t.atoms.text_contrast_medium,
				}}
			>
				{settings.length === 0 ? (
					<>This post has an unknown type of threadgate on it. Your app may be out of date.</>
				) : settings[0].type === "everybody" ? (
					<>Everybody can reply to this post.</>
				) : settings[0].type === "nobody" ? (
					<>Replies to this post are disabled.</>
				) : (
					<>
						Only{" "}
						{settings.map((rule, i) => (
							<React.Fragment key={`rule-${i.toString()}`}>
								<Rule rule={rule} post={post} lists={post.threadgate?.lists} />
								<Separator i={i} length={settings.length} />
							</React.Fragment>
						))}{" "}
						can reply.
					</>
				)}{" "}
			</Text>
			{embeddingDisabled && (
				<Text
					style={{
						...a.text_sm,
						...a.leading_snug,
						...a.flex_wrap,
						...t.atoms.text_contrast_medium,
					}}
				>
					No one but the author can quote this post.
				</Text>
			)}
		</>
	);
}

function Rule({
	rule,
	post,
	lists,
}: {
	rule: ThreadgateAllowUISetting;
	post: AppBskyFeedDefs.PostView;
	lists: AppBskyGraphDefs.ListViewBasic[] | undefined;
}) {
	if (rule.type === "mention") {
		return <>mentioned users</>;
	}
	if (rule.type === "followers") {
		return (
			<>
				users following{" "}
				<InlineLinkText
					label={`@${post.author.handle}`}
					to={makeProfileLink(post.author)}
					style={{
						...a.text_sm,
						...a.leading_snug,
					}}
				>
					@{post.author.handle}
				</InlineLinkText>
			</>
		);
	}
	if (rule.type === "following") {
		return (
			<>
				users followed by{" "}
				<InlineLinkText
					label={`@${post.author.handle}`}
					to={makeProfileLink(post.author)}
					style={{
						...a.text_sm,
						...a.leading_snug,
					}}
				>
					@{post.author.handle}
				</InlineLinkText>
			</>
		);
	}
	if (rule.type === "list") {
		const list = lists?.find((l) => l.uri === rule.list);
		if (list) {
			const listUrip = new AtUri(list.uri);
			return (
				<>
					<InlineLinkText
						label={list.name}
						to={makeListLink(listUrip.hostname, listUrip.rkey)}
						style={{
							...a.text_sm,
							...a.leading_snug,
						}}
					>
						{list.name}
					</InlineLinkText>{" "}
					members
				</>
			);
		}
	}
}

function Separator({ i, length }: { i: number; length: number }) {
	if (length < 2 || i === length - 1) {
		return null;
	}
	if (i === length - 2) {
		return <>{length > 2 ? "," : ""} and </>;
	}
	return <>, </>;
}
