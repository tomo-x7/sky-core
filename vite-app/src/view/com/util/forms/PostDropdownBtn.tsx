import type { AppBskyFeedDefs, AppBskyFeedPost, AppBskyFeedThreadgate, RichText as RichTextAPI } from "@atproto/api";
import { useLingui } from "@lingui/react";
import type React from "react";
import { memo, useMemo, useState } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { atoms as a, useTheme as useAlf } from "#/alf";
import { useMenuControl } from "#/components/Menu";
import * as Menu from "#/components/Menu";
import { DotGrid_Stroke2_Corner0_Rounded as DotsHorizontal } from "#/components/icons/DotGrid";
import { useTheme } from "#/lib/ThemeContext";
import type { Shadow } from "#/state/cache/post-shadow";
import { EventStopper } from "../EventStopper";
import { PostDropdownMenuItems } from "./PostDropdownBtnMenuItems";

let PostDropdownBtn = ({
	testID,
	post,
	postFeedContext,
	record,
	richText,
	style,
	hitSlop,
	size,
	timestamp,
	threadgateRecord,
}: {
	testID: string;
	post: Shadow<AppBskyFeedDefs.PostView>;
	postFeedContext: string | undefined;
	record: AppBskyFeedPost.Record;
	richText: RichTextAPI;
	style?: StyleProp<ViewStyle>;
	hitSlop?: PressableProps["hitSlop"];
	size?: "lg" | "md" | "sm";
	timestamp: string;
	threadgateRecord?: AppBskyFeedThreadgate.Record;
}): React.ReactNode => {
	const theme = useTheme();
	const alf = useAlf();
	const { _ } = useLingui();
	const defaultCtrlColor = theme.palette.default.postCtrl;
	const menuControl = useMenuControl();
	const [hasBeenOpen, setHasBeenOpen] = useState(false);
	const lazyMenuControl = useMemo(
		() => ({
			...menuControl,
			open() {
				setHasBeenOpen(true);
				// HACK. We need the state update to be flushed by the time
				// menuControl.open() fires but RN doesn't expose flushSync.
				setTimeout(menuControl.open);
			},
		}),
		[menuControl, setHasBeenOpen],
	);
	return (
		<EventStopper onKeyDown={false}>
			<Menu.Root control={lazyMenuControl}>
				<Menu.Trigger label={"Open post options menu"}>
					{({ props, state }) => {
						return (
							<Pressable
								{...props}
								hitSlop={hitSlop}
								testID={testID}
								style={[
									style,
									a.rounded_full,
									(state.hovered || state.pressed) && [alf.atoms.bg_contrast_25],
								]}
							>
								<DotsHorizontal fill={defaultCtrlColor} style={{ pointerEvents: "none" }} size={size} />
							</Pressable>
						);
					}}
				</Menu.Trigger>
				{hasBeenOpen && (
					// Lazily initialized. Once mounted, they stay mounted.
					<PostDropdownMenuItems
						testID={testID}
						post={post}
						postFeedContext={postFeedContext}
						record={record}
						richText={richText}
						timestamp={timestamp}
						threadgateRecord={threadgateRecord}
					/>
				)}
			</Menu.Root>
		</EventStopper>
	);
};

PostDropdownBtn = memo(PostDropdownBtn);
export { PostDropdownBtn };
