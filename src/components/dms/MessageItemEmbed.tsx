import type { AppBskyEmbedRecord } from "@atproto/api";
import React from "react";

import { useTheme } from "#/alf";
import { PostEmbedViewContext, PostEmbeds } from "#/view/com/util/post-embeds";
import { MessageContextProvider } from "./MessageContext";

let MessageItemEmbed = ({
	embed,
}: {
	embed: AppBskyEmbedRecord.View;
}): React.ReactNode => {
	const t = useTheme();

	return (
		<MessageContextProvider>
			<div
				style={{
					marginTop: 4,
					marginBottom: 4,
					...t.atoms.bg,
				}}
			>
				<PostEmbeds embed={embed} allowNestedQuotes viewContext={PostEmbedViewContext.Feed} />
			</div>
		</MessageContextProvider>
	);
};
MessageItemEmbed = React.memo(MessageItemEmbed);
export { MessageItemEmbed };
