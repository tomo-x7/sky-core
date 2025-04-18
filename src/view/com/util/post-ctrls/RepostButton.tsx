import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import * as Menu from "#/components/Menu";
import { Text } from "#/components/Typography";
import { CloseQuote_Stroke2_Corner1_Rounded as Quote } from "#/components/icons/Quote";
import { Repost_Stroke2_Corner2_Rounded as Repost } from "#/components/icons/Repost";
import { useRequireAuth } from "#/state/session";
import { useSession } from "#/state/session";
import { EventStopper } from "../EventStopper";
import { formatCount } from "../numeric/format";

interface Props {
	isReposted: boolean;
	repostCount?: number;
	onRepost: () => void;
	onQuote: () => void;
	big?: boolean;
	embeddingDisabled: boolean;
}

export const RepostButton = ({ isReposted, repostCount, onRepost, onQuote, big, embeddingDisabled }: Props) => {
	const t = useTheme();
	const { hasSession } = useSession();
	const requireAuth = useRequireAuth();

	const color = React.useMemo(
		() => ({
			color: isReposted ? t.palette.positive_600 : t.palette.contrast_500,
		}),
		[t, isReposted],
	);

	return hasSession ? (
		<EventStopper onKeyDown={false}>
			<Menu.Root>
				<Menu.Trigger label={"Repost or quote post"}>
					{({ props: { onPress, ...props }, state }) => {
						return (
							<button
								type="button"
								onClick={onPress}
								{...props}
								style={{
									...a.rounded_full,

									...((state.hovered || state.pressed) && {
										backgroundColor: t.palette.contrast_25,
									}),
								}}
							>
								<RepostInner
									isReposted={isReposted}
									color={color}
									repostCount={repostCount}
									big={big}
								/>
							</button>
						);
					}}
				</Menu.Trigger>
				<Menu.Outer style={{ minWidth: 170 }}>
					<Menu.Item label={isReposted ? "Undo repost" : "Repost"} onPress={onRepost}>
						<Menu.ItemText>{isReposted ? "Undo repost" : "Repost"}</Menu.ItemText>
						<Menu.ItemIcon icon={Repost} position="right" />
					</Menu.Item>
					<Menu.Item
						disabled={embeddingDisabled}
						label={embeddingDisabled ? "Quote posts disabled" : "Quote post"}
						onPress={onQuote}
					>
						<Menu.ItemText>{embeddingDisabled ? "Quote posts disabled" : "Quote post"}</Menu.ItemText>
						<Menu.ItemIcon icon={Quote} position="right" />
					</Menu.Item>
				</Menu.Outer>
			</Menu.Root>
		</EventStopper>
	) : (
		<Button
			onPress={() => {
				requireAuth(() => {});
			}}
			label={"Repost or quote post"}
			style={{ padding: 0 }}
			hoverStyle={t.atoms.bg_contrast_25}
			shape="round"
		>
			<RepostInner isReposted={isReposted} color={color} repostCount={repostCount} big={big} />
		</Button>
	);
};

const RepostInner = ({
	isReposted,
	color,
	repostCount,
	big,
}: {
	isReposted: boolean;
	color: { color: string };
	repostCount?: number;
	big?: boolean;
}) => {
	return (
		<div
			style={{
				...a.flex_row,
				...a.align_center,
				...a.gap_xs,
				...{ padding: 5 },
			}}
		>
			<Repost style={color} width={big ? 22 : 18} />
			{typeof repostCount !== "undefined" && repostCount > 0 ? (
				<Text
					style={{
						...color,
						...(big ? a.text_md : { fontSize: 15 }),
						...(isReposted ? a.font_bold : undefined),
						...a.user_select_none,
					}}
				>
					{formatCount(repostCount)}
				</Text>
			) : undefined}
		</div>
	);
};
