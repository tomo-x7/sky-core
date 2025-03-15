import type { AppBskyEmbedRecord } from "@atproto/api";
import React from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
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
			<View style={[a.my_xs, t.atoms.bg]}>
				<PostEmbeds embed={embed} allowNestedQuotes viewContext={PostEmbedViewContext.Feed} />
			</View>
		</MessageContextProvider>
	);
};
MessageItemEmbed = React.memo(MessageItemEmbed);
export { MessageItemEmbed };
