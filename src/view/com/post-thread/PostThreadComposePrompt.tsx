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
			style={{
				...(gtMobile ? a.py_xs : { paddingTop: 8, paddingBottom: 11 }),
				paddingLeft: 8,
				paddingRight: 8,
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...t.atoms.border_contrast_low,
				...t.atoms.bg,
			}}
			onClick={() => {
				onPressCompose();
			}}
			onMouseEnter={onHoverIn}
			onMouseLeave={onHoverOut}
		>
			<div
				style={{
					flexDirection: "row",
					alignItems: "center",
					padding: 8,
					gap: 8,
					borderRadius: 999,
					...((!gtMobile || hovered) && t.atoms.bg_contrast_25),

					transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
					transitionTimingFunction: "cubic-bezier(0.17, 0.73, 0.14, 1)",
					transitionDuration: "100ms",
				}}
			>
				<UserAvatar
					size={gtMobile ? 24 : 22}
					avatar={profile?.avatar}
					type={profile?.associated?.labeler ? "labeler" : "user"}
				/>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
				>
					Write your reply
				</Text>
			</div>
		</PressableScale>
	);
}
