import type { Shadow } from "#/state/cache/types";
import { useProfileFollowMutationQueue } from "#/state/queries/profile";
import type * as bsky from "#/types/bsky";
import * as Toast from "../util/Toast";
import { Button, type ButtonType } from "../util/forms/Button";

export function FollowButton({
	unfollowedType = "inverted",
	followedType = "default",
	profile,
	labelStyle,
	onFollow,
}: {
	unfollowedType?: ButtonType;
	followedType?: ButtonType;
	profile: Shadow<bsky.profile.AnyProfileView>;
	labelStyle?: React.CSSProperties;
	onFollow?: () => void;
}) {
	const [queueFollow, queueUnfollow] = useProfileFollowMutationQueue(profile);

	const onPressFollow = async () => {
		try {
			await queueFollow();
			onFollow?.();
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	const onPressUnfollow = async () => {
		try {
			await queueUnfollow();
		} catch (e: any) {
			if (e?.name !== "AbortError") {
				Toast.show("An issue occurred, please try again.", "xmark");
			}
		}
	};

	if (!profile.viewer) {
		return <div />;
	}

	if (profile.viewer.following) {
		return <Button type={followedType} labelStyle={labelStyle} onPress={onPressUnfollow} label={"Unfollow"} />;
	} else if (!profile.viewer.followedBy) {
		return <Button type={unfollowedType} labelStyle={labelStyle} onPress={onPressFollow} label={"Follow"} />;
	} else {
		return <Button type={unfollowedType} labelStyle={labelStyle} onPress={onPressFollow} label={"Follow Back"} />;
	}
}
