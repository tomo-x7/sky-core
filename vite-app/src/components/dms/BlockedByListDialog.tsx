import type { ModerationCause } from "@atproto/api";
import React from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
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
		<Prompt.Outer control={control} testID="blockedByListDialog">
			<Prompt.TitleText>{"User blocked by list"}</Prompt.TitleText>

			<View style={[a.gap_sm, a.pb_lg]}>
				<Text selectable style={[a.text_md, a.leading_snug, t.atoms.text_contrast_high]}>
					{
						"This account is blocked by one or more of your moderation lists. To unblock, please visit the lists directly and remove this user."
					}{" "}
				</Text>

				<Text style={[a.text_md, a.leading_snug, t.atoms.text_contrast_high]}>
					{"Lists blocking this user:"}{" "}
					{listBlocks.map((block, i) =>
						block.source.type === "list" ? (
							<React.Fragment key={block.source.list.uri}>
								{i === 0 ? null : ", "}
								<InlineLinkText
									label={block.source.list.name}
									to={listUriToHref(block.source.list.uri)}
									style={[a.text_md, a.leading_snug]}
								>
									{block.source.list.name}
								</InlineLinkText>
							</React.Fragment>
						) : null,
					)}
				</Text>
			</View>

			<Prompt.Actions>
				<Prompt.Action cta={"I understand"} onPress={() => {}} />
			</Prompt.Actions>

			<Dialog.Close />
		</Prompt.Outer>
	);
}
