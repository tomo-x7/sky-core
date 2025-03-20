import { AtUri } from "@atproto/api";
import React from "react";

import { SubtleWebHover } from "#/components/SubtleWebHover";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { Link } from "../util/Link";

export function ViewFullThread({ uri }: { uri: string }) {
	const { state: hover, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();
	const pal = usePalette("default");
	const itemHref = React.useMemo(() => {
		const urip = new AtUri(uri);
		return makeProfileLink({ did: urip.hostname, handle: "" }, "post", urip.rkey);
	}, [uri]);

	return (
		<Link
			style={styles.viewFullThread}
			href={itemHref}
			asAnchor
			noFeedback
			onPointerEnter={onHoverIn}
			onPointerLeave={onHoverOut}
		>
			<SubtleWebHover
				hover={hover}
				// adjust position for visual alignment - the actual box has lots of top padding and not much bottom padding -sfn
				style={{ top: 8, bottom: -5 }}
			/>
			<div style={styles.viewFullThreadDots}>
				<svg width="4" height="40">
					<line x1="2" y1="0" x2="2" y2="15" stroke={pal.colors.replyLine} strokeWidth="2" />
					<circle cx="2" cy="22" r="1.5" fill={pal.colors.replyLineDot} />
					<circle cx="2" cy="28" r="1.5" fill={pal.colors.replyLineDot} />
					<circle cx="2" cy="34" r="1.5" fill={pal.colors.replyLineDot} />
				</svg>
			</div>
			<Text
				type="md"
				style={{
					...pal.link,
					...{ paddingTop: 18, paddingBottom: 4 },
				}}
			>
				View full thread
			</Text>
		</Link>
	);
}

const styles = {
	viewFullThread: {
		flexDirection: "row",
		gap: 10,
		paddingLeft: 18,
	},
	viewFullThreadDots: {
		width: 42,
		alignItems: "center",
	},
} satisfies Record<string, React.CSSProperties>;
