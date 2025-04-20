import { useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Text } from "#/components/Typography";
import { TimesLarge_Stroke2_Corner0_Rounded as Times } from "#/components/icons/Times";
import { useProgressGuide, useProgressGuideControls } from "#/state/shell/progress-guide";
import { FollowDialog } from "./FollowDialog";
import { ProgressGuideTask } from "./Task";

export function ProgressGuideList({ style }: { style?: React.CSSProperties }) {
	const t = useTheme();
	const followProgressGuide = useProgressGuide("follow-10");
	const followAndLikeProgressGuide = useProgressGuide("like-10-and-follow-7");
	const guide = followProgressGuide || followAndLikeProgressGuide;
	const { endProgressGuide } = useProgressGuideControls();

	if (guide) {
		return (
			<div
				style={{
					flexDirection: "column",
					gap: 12,
					...style,
				}}
			>
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							fontWeight: "600",
							fontSize: 14,
							letterSpacing: 0,
							...{ textTransform: "uppercase" },
						}}
					>
						Getting started
					</Text>
					<Button
						variant="ghost"
						size="tiny"
						color="secondary"
						shape="round"
						label={"Dismiss getting started guide"}
						onPress={endProgressGuide}
					>
						<ButtonIcon icon={Times} size="sm" />
					</Button>
				</div>
				{guide.guide === "follow-10" && (
					<>
						<ProgressGuideTask
							current={guide.numFollows + 1}
							total={10 + 1}
							title={"Follow 10 accounts"}
							subtitle={"Bluesky is better with friends!"}
						/>
						<FollowDialog guide={guide} />
					</>
				)}
				{guide.guide === "like-10-and-follow-7" && (
					<>
						<ProgressGuideTask
							current={guide.numLikes + 1}
							total={10 + 1}
							title={"Like 10 posts"}
							subtitle={"Teach our algorithm what you like"}
						/>
						<ProgressGuideTask
							current={guide.numFollows + 1}
							total={7 + 1}
							title={"Follow 7 accounts"}
							subtitle={"Bluesky is better with friends!"}
						/>
					</>
				)}
			</div>
		);
	}
	return null;
}
