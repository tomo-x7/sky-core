import type { ModerationCause } from "@atproto/api";

import { atoms as a, useGutters, useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import type { AppModerationCause } from "#/components/Pills";
import { Text } from "#/components/Typography";
import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import { useModerationCauseDescription } from "#/lib/moderation/useModerationCauseDescription";
import { makeProfileLink } from "#/lib/routes/links";
import { listUriToHref } from "#/lib/strings/url-helpers";
import { useSession } from "#/state/session";

export interface ModerationDetailsDialogProps {
	control: Dialog.DialogOuterProps["control"];
	modcause?: ModerationCause | AppModerationCause;
}

export function ModerationDetailsDialog(props: ModerationDetailsDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<ModerationDetailsDialogInner {...props} />
		</Dialog.Outer>
	);
}

function ModerationDetailsDialogInner({
	modcause,
	control,
}: ModerationDetailsDialogProps & {
	control: Dialog.DialogOuterProps["control"];
}) {
	const t = useTheme();
	const xGutters = useGutters([0, "base"]);
	const desc = useModerationCauseDescription(modcause);
	const { currentAccount } = useSession();
	const timeDiff = useGetTimeAgo({ future: true });

	let name: string;
	let description: React.ReactNode;
	if (!modcause) {
		name = "Content Warning";
		description = "Moderator has chosen to set a general warning on the content.";
	} else if (modcause.type === "blocking") {
		if (modcause.source.type === "list") {
			const list = modcause.source.list;
			name = "User Blocked by List";
			description = (
				<>
					This user is included in the{" "}
					<InlineLinkText label={list.name} to={listUriToHref(list.uri)} style={a.text_sm}>
						{list.name}
					</InlineLinkText>{" "}
					list which you have blocked.
				</>
			);
		} else {
			name = "User Blocked";
			description = "You have blocked this user. You cannot view their content.";
		}
	} else if (modcause.type === "blocked-by") {
		name = "User Blocks You";
		description = "This user has blocked you. You cannot view their content.";
	} else if (modcause.type === "block-other") {
		name = "Content Not Available";
		description = "This content is not available because one of the users involved has blocked the other.";
	} else if (modcause.type === "muted") {
		if (modcause.source.type === "list") {
			const list = modcause.source.list;
			name = "Account Muted by List";
			description = (
				<>
					This user is included in the{" "}
					<InlineLinkText label={list.name} to={listUriToHref(list.uri)} style={a.text_sm}>
						{list.name}
					</InlineLinkText>{" "}
					list which you have muted.
				</>
			);
		} else {
			name = "Account Muted";
			description = "You have muted this account.";
		}
	} else if (modcause.type === "mute-word") {
		name = "Post Hidden by Muted Word";
		description = `You've chosen to hide a word or tag within this post.`;
	} else if (modcause.type === "hidden") {
		name = "Post Hidden by You";
		description = "You have hidden this post.";
	} else if (modcause.type === "reply-hidden") {
		const isYou = currentAccount?.did === modcause.source.did;
		name = isYou ? "Reply Hidden by You" : "Reply Hidden by Thread Author";
		description = isYou ? "You hid this reply." : "The author of this thread has hidden this reply.";
	} else if (modcause.type === "label") {
		name = desc.name;
		description = (
			<Text
				style={{
					...t.atoms.text,
					...a.text_md,
					...a.leading_snug,
				}}
			>
				{desc.description}
			</Text>
		);
	} else {
		// should never happen
		name = "";
		description = "";
	}

	const sourceName = desc.source || desc.sourceDisplayName || "an unknown labeler";

	return (
		<Dialog.ScrollableInner
			label={"Moderation details"}
			contentContainerStyle={{
				paddingLeft: 0,
				paddingRight: 0,
				paddingBottom: 0,
			}}
		>
			<div
				style={{
					...xGutters,
					...a.pb_lg,
				}}
			>
				<Text
					style={{
						...t.atoms.text,
						...a.text_2xl,
						...a.font_heavy,
						...a.mb_sm,
					}}
				>
					{name}
				</Text>
				<Text
					style={{
						...t.atoms.text,
						...a.text_sm,
						...a.leading_snug,
					}}
				>
					{description}
				</Text>
			</div>
			{modcause?.type === "label" && (
				<div
					style={{
						...xGutters,
						...a.py_md,
						...a.border_t,
						...t.atoms.bg_contrast_25,
						...t.atoms.border_contrast_low,

						...{
							borderBottomLeftRadius: a.rounded_md.borderRadius,
							borderBottomRightRadius: a.rounded_md.borderRadius,
						},
					}}
				>
					{modcause.source.type === "user" ? (
						<Text
							style={{
								...t.atoms.text,
								...a.text_md,
								...a.leading_snug,
							}}
						>
							This label was applied by the author.
						</Text>
					) : (
						<>
							<div
								style={{
									...a.flex_row,
									...a.justify_between,
									...a.gap_xl,
									...{ paddingBottom: 1 },
								}}
							>
								<Text
									style={{
										...a.flex_1,
										...a.leading_snug,
										...t.atoms.text_contrast_medium,
									}}
									numberOfLines={1}
								>
									<>
										Source:{" "}
										<InlineLinkText
											label={sourceName}
											to={makeProfileLink({
												did: modcause.label.src,
												handle: "",
											})}
											onPress={() => void control.close()}
										>
											{sourceName}
										</InlineLinkText>
									</>
								</Text>
								{modcause.label.exp && (
									<div>
										<Text
											style={{
												...a.leading_snug,
												...a.text_sm,
												...a.italic,
												...t.atoms.text_contrast_medium,
											}}
										>
											<>Expires in {timeDiff(Date.now(), modcause.label.exp)}</>
										</Text>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			)}
			<Dialog.Close />
		</Dialog.ScrollableInner>
	);
}
