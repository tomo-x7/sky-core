import type { AppBskyFeedDefs, ComAtprotoLabelDefs } from "@atproto/api";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, type ButtonSize, ButtonText } from "#/components/Button";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { LabelsOnMeDialog } from "#/components/moderation/LabelsOnMeDialog";
import { useSession } from "#/state/session";
import { useDialogControl } from "../Dialog";

export function LabelsOnMe({
	type,
	labels,
	size,
	style,
}: {
	type: "account" | "content";
	labels: ComAtprotoLabelDefs.Label[] | undefined;
	size?: ButtonSize;
	style?: React.CSSProperties;
}) {
	const { currentAccount } = useSession();
	const control = useDialogControl();

	if (!labels || !currentAccount) {
		return null;
	}
	labels = labels.filter((l) => !l.val.startsWith("!"));
	if (!labels.length) {
		return null;
	}

	return (
		<div
			style={{
				...a.flex_row,
				...style,
			}}
		>
			<LabelsOnMeDialog control={control} labels={labels} type={type} />
			<Button
				variant="solid"
				color="secondary"
				size={size || "small"}
				label={"View information about these labels"}
				onPress={() => {
					control.open();
				}}
			>
				<ButtonIcon position="left" icon={CircleInfo} />
				<ButtonText style={a.leading_snug}>
					{type === "account" ? (
						<>
							{labels.length} {labels.length === 1 ? "label has" : "labels have"} been placed on this
							account
						</>
					) : (
						<>
							{labels.length} {labels.length === 1 ? "label has" : "labels have"} been placed on this
							content
						</>
					)}
				</ButtonText>
			</Button>
		</div>
	);
}

export function LabelsOnMyPost({
	post,
	style,
}: {
	post: AppBskyFeedDefs.PostView;
	style?: React.CSSProperties;
}) {
	const { currentAccount } = useSession();
	if (post.author.did !== currentAccount?.did) {
		return null;
	}
	return <LabelsOnMe type="content" labels={post.labels} size="tiny" style={style} />;
}
