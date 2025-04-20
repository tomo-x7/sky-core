import type { ModerationCause } from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { listUriToHref } from "#/lib/strings/url-helpers";

export function BlockedByListDialog({
	control,
	listBlocks,
}: {
	control: DialogControlProps;
	listBlocks: ModerationCause[];
}) {
	const t = useTheme();

	return (
		<Prompt.Outer control={control}>
			<Prompt.TitleText>{"User blocked by list"}</Prompt.TitleText>
			<div
				style={{
					gap: 8,
					paddingBottom: 16,
				}}
			>
				<Text
					selectable
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.3,
						...t.atoms.text_contrast_high,
					}}
				>
					{
						"This account is blocked by one or more of your moderation lists. To unblock, please visit the lists directly and remove this user."
					}{" "}
				</Text>

				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.3,
						...t.atoms.text_contrast_high,
					}}
				>
					{"Lists blocking this user:"}{" "}
					{listBlocks.map((block, i) =>
						block.source.type === "list" ? (
							<React.Fragment key={block.source.list.uri}>
								{i === 0 ? null : ", "}
								<InlineLinkText
									label={block.source.list.name}
									to={listUriToHref(block.source.list.uri)}
									style={{
										fontSize: 16,
										letterSpacing: 0,
										lineHeight: 1.3,
									}}
								>
									{block.source.list.name}
								</InlineLinkText>
							</React.Fragment>
						) : null,
					)}
				</Text>
			</div>
			<Prompt.Actions>
				<Prompt.Action cta={"I understand"} onPress={() => {}} />
			</Prompt.Actions>
			<Dialog.Close />
		</Prompt.Outer>
	);
}
