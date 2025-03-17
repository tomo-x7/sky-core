import { type AppBskyActorDefs, type AppBskyFeedPost, AtUri } from "@atproto/api";
import { memo, useEffect, useMemo, useState } from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { Check_Stroke2_Corner0_Rounded as CheckIcon } from "#/components/icons/Check";
import {
	ChevronBottom_Stroke2_Corner0_Rounded as ChevronBottomIcon,
	ChevronRight_Stroke2_Corner0_Rounded as ChevronRightIcon,
} from "#/components/icons/Chevron";
import { CodeBrackets_Stroke2_Corner0_Rounded as CodeBracketsIcon } from "#/components/icons/CodeBrackets";
import { EMBED_SCRIPT } from "#/lib/constants";
import { niceDate } from "#/lib/strings/time";
import { toShareUrl } from "#/lib/strings/url-helpers";

export type ColorModeValues = "system" | "light" | "dark";

type EmbedDialogProps = {
	control: Dialog.DialogControlProps;
	postAuthor: AppBskyActorDefs.ProfileViewBasic;
	postCid: string;
	postUri: string;
	record: AppBskyFeedPost.Record;
	timestamp: string;
};

let EmbedDialog = ({ control, ...rest }: EmbedDialogProps): React.ReactNode => {
	return (
		<Dialog.Outer control={control}>
			<Dialog.Handle />
			<EmbedDialogInner {...rest} />
		</Dialog.Outer>
	);
};
EmbedDialog = memo(EmbedDialog);
export { EmbedDialog };

function EmbedDialogInner({ postAuthor, postCid, postUri, record, timestamp }: Omit<EmbedDialogProps, "control">) {
	const t = useTheme();
	const [copied, setCopied] = useState(false);
	const [showCustomisation, setShowCustomisation] = useState(false);
	const [colorMode, setColorMode] = useState<ColorModeValues>("system");

	// reset copied state after 2 seconds
	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				setCopied(false);
			}, 2000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	const snippet = useMemo(() => {
		function toEmbedUrl(href: string) {
			return `${toShareUrl(href)}?ref_src=embed`;
		}

		const lang = record.langs && record.langs.length > 0 ? record.langs[0] : "";
		const profileHref = toEmbedUrl(["/profile", postAuthor.did].join("/"));
		const urip = new AtUri(postUri);
		const href = toEmbedUrl(["/profile", postAuthor.did, "post", urip.rkey].join("/"));

		// x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x
		// DO NOT ADD ANY NEW INTERPOLATIONS BELOW WITHOUT ESCAPING THEM!
		// Also, keep this code synced with the bskyembed code in landing.tsx.
		// x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x
		return `<blockquote class="bluesky-embed" data-bluesky-uri="${escapeHtml(
			postUri,
		)}" data-bluesky-cid="${escapeHtml(postCid)}" data-bluesky-embed-color-mode="${escapeHtml(
			colorMode,
		)}"><p lang="${escapeHtml(lang)}">${escapeHtml(record.text)}${
			record.embed ? `<br><br><a href="${escapeHtml(href)}">[image or embed]</a>` : ""
		}</p>&mdash; ${escapeHtml(
			postAuthor.displayName || postAuthor.handle,
		)} (<a href="${escapeHtml(profileHref)}">@${escapeHtml(
			postAuthor.handle,
		)}</a>) <a href="${escapeHtml(href)}">${escapeHtml(
			niceDate(timestamp),
		)}</a></blockquote><script async src="${EMBED_SCRIPT}" charset="utf-8"></script>`;
	}, [postUri, postCid, record, timestamp, postAuthor, colorMode]);

	return (
		<Dialog.Inner label="Embed post" style={{ maxWidth: 500 }}>
			<div style={a.gap_lg}>
				<div style={a.gap_sm}>
					<Text
						style={{
							...a.text_2xl,
							...a.font_heavy,
						}}
					>
						Embed post
					</Text>
					<Text
						style={{
							...a.text_md,
							...t.atoms.text_contrast_medium,
							...a.leading_normal,
						}}
					>
						Embed this post in your website. Simply copy the following snippet and paste it into the HTML
						code of your website.
					</Text>
				</div>
				<div
					style={{
						...a.border,
						...t.atoms.border_contrast_low,
						...a.rounded_sm,
						...a.overflow_hidden,
					}}
				>
					<Button
						label={showCustomisation ? "Hide customization options" : "Show customization options"}
						color="secondary"
						variant="ghost"
						size="small"
						shape="default"
						onPress={() => setShowCustomisation((c) => !c)}
						style={{
							...a.justify_start,
							...(showCustomisation && t.atoms.bg_contrast_25),
						}}
					>
						<ButtonIcon icon={showCustomisation ? ChevronBottomIcon : ChevronRightIcon} />
						<ButtonText>Customization options</ButtonText>
					</Button>

					{showCustomisation && (
						<div
							style={{
								...a.gap_sm,
								...a.p_md,
							}}
						>
							<Text
								style={{
									...t.atoms.text_contrast_medium,
									...a.font_bold,
								}}
							>
								Color theme
							</Text>
							<ToggleButton.Group
								label={"Color mode"}
								values={[colorMode]}
								onChange={([value]) => setColorMode(value as ColorModeValues)}
							>
								<ToggleButton.Button name="system" label="System">
									<ToggleButton.ButtonText>System</ToggleButton.ButtonText>
								</ToggleButton.Button>
								<ToggleButton.Button name="light" label="Light">
									<ToggleButton.ButtonText>Light</ToggleButton.ButtonText>
								</ToggleButton.Button>
								<ToggleButton.Button name="dark" label="Dark">
									<ToggleButton.ButtonText>Dark</ToggleButton.ButtonText>
								</ToggleButton.Button>
							</ToggleButton.Group>
						</div>
					)}
				</div>
				<div
					style={{
						...a.flex_row,
						...a.gap_sm,
					}}
				>
					<div style={a.flex_1}>
						<TextField.Root>
							<TextField.Icon icon={CodeBracketsIcon} />
							<TextField.Input
								label="Embed HTML code"
								editable={false}
								selection={{ start: 0, end: snippet.length }}
								value={snippet}
							/>
						</TextField.Root>
					</div>
					<Button
						label="Copy code"
						color="primary"
						variant="solid"
						size="large"
						onPress={() => {
							navigator.clipboard.writeText(snippet);
							setCopied(true);
						}}
					>
						{copied ? (
							<>
								<ButtonIcon icon={CheckIcon} />
								<ButtonText>Copied!</ButtonText>
							</>
						) : (
							<ButtonText>Copy code</ButtonText>
						)}
					</Button>
				</div>
			</div>
			<Dialog.Close />
		</Dialog.Inner>
	);
}

/**
 * Based on a snippet of code from React, which itself was based on the escape-html library.
 * Copyright (c) Meta Platforms, Inc. and affiliates
 * Copyright (c) 2012-2013 TJ Holowaychuk
 * Copyright (c) 2015 Andreas Lubbe
 * Copyright (c) 2015 Tiancheng "Timothy" Gu
 * Licensed as MIT.
 */
const matchHtmlRegExp = /["'&<>]/;
function escapeHtml(string: string) {
	const str = String(string);
	const match = matchHtmlRegExp.exec(str);
	if (!match) {
		return str;
	}
	let esc: string | undefined;
	let html = "";
	let index: number;
	let lastIndex = 0;
	for (index = match.index; index < str.length; index++) {
		switch (str.charCodeAt(index)) {
			case 34: // "
				esc = "&quot;";
				break;
			case 38: // &
				esc = "&amp;";
				break;
			case 39: // '
				esc = "&#x27;";
				break;
			case 60: // <
				esc = "&lt;";
				break;
			case 62: // >
				esc = "&gt;";
				break;
			default:
				continue;
		}
		if (lastIndex !== index) {
			html += str.slice(lastIndex, index);
		}
		lastIndex = index + 1;
		html += esc;
	}
	return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
