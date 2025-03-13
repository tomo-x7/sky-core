import { View } from "react-native";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { PressableScale } from "#/lib/custom-animations/PressableScale";
import { useProfileQuery } from "#/state/queries/profile";
import { useSession } from "#/state/session";
import { UserAvatar } from "#/view/com/util/UserAvatar";

export function PostThreadComposePrompt({
	onPressCompose,
}: {
	onPressCompose: () => void;
}) {
	const { currentAccount } = useSession();
	const { data: profile } = useProfileQuery({ did: currentAccount?.did });
	const { gtMobile } = useBreakpoints();
	const t = useTheme();
	const { state: hovered, onIn: onHoverIn, onOut: onHoverOut } = useInteractionState();

	return (
		<PressableScale
			accessibilityRole="button"
			accessibilityLabel={"Compose reply"}
			accessibilityHint={"Opens composer"}
			style={[
				gtMobile ? a.py_xs : { paddingTop: 8, paddingBottom: 11 },
				a.px_sm,
				a.border_t,
				t.atoms.border_contrast_low,
				t.atoms.bg,
			]}
			onPress={() => {
				onPressCompose();
			}}
			onHoverIn={onHoverIn}
			onHoverOut={onHoverOut}
		>
			<View
				style={[
					a.flex_row,
					a.align_center,
					a.p_sm,
					a.gap_sm,
					a.rounded_full,
					(!gtMobile || hovered) && t.atoms.bg_contrast_25,
					//@ts-ignore
					a.transition_color,
				]}
			>
				<UserAvatar
					size={gtMobile ? 24 : 22}
					avatar={profile?.avatar}
					type={profile?.associated?.labeler ? "labeler" : "user"}
				/>
				<Text style={[a.text_md, t.atoms.text_contrast_medium]}>Write your reply</Text>
			</View>
		</PressableScale>
	);
}
