import { type AppBskyFeedDefs, AtUri } from "@atproto/api";
import * as React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { makeProfileLink } from "#/lib/routes/links";
import { Link } from "../util/Link";
import { UserAvatar } from "../util/UserAvatar";

export function PostThreadLoadMore({ post }: { post: AppBskyFeedDefs.PostView }) {
	const t = useTheme();

	const postHref = React.useMemo(() => {
		const urip = new AtUri(post.uri);
		return makeProfileLink(post.author, "post", urip.rkey);
	}, [post.uri, post.author]);

	return (
		<Link
			href={postHref}
			style={{
				...a.flex_row,
				...a.align_center,
				...a.py_md,
				...{ paddingLeft: 14, paddingRight: 14 },
			}}
			hoverStyle={t.atoms.bg_contrast_25}
		>
			<div style={a.flex_row}>
				<div
					style={{
						alignItems: "center",
						justifyContent: "center",
						width: 34,
						height: 34,
						borderRadius: 18,
						backgroundColor: t.atoms.bg.backgroundColor,
						marginRight: -20,
					}}
				>
					<UserAvatar
						avatar={post.author.avatar}
						size={30}
						type={post.author.associated?.labeler ? "labeler" : "user"}
					/>
				</div>
				<div
					style={{
						alignItems: "center",
						justifyContent: "center",
						width: 34,
						height: 34,
						borderRadius: 18,
						backgroundColor: t.atoms.bg.backgroundColor,
					}}
				>
					<UserAvatar
						avatar={post.author.avatar}
						size={30}
						type={post.author.associated?.labeler ? "labeler" : "user"}
					/>
				</div>
			</div>
			<div style={a.px_sm}>
				<Text
					style={{
						...{ color: t.palette.primary_500 },
						...a.text_md,
					}}
				>
					Continue thread...
				</Text>
			</div>
		</Link>
	);
}
