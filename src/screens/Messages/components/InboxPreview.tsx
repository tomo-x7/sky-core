import type { ChatBskyActorDefs } from "@atproto/api";

import { atoms as a, useTheme } from "#/alf";
import { AvatarStack } from "#/components/AvatarStack";
import { ButtonIcon, ButtonText } from "#/components/Button";
import { Link } from "#/components/Link";
import { ArrowRight_Stroke2_Corner0_Rounded as ArrowRightIcon } from "#/components/icons/Arrow";
import { Envelope_Stroke2_Corner2_Rounded as EnvelopeIcon } from "#/components/icons/Envelope";

export function InboxPreview({
	profiles,
}: // count,
{
	profiles: ChatBskyActorDefs.ProfileViewBasic[];
	count: number;
}) {
	const t = useTheme();
	return (
		<Link
			label={"Chat request inbox"}
			style={{
				flex: 1,
				paddingLeft: 20,
				paddingRight: 20,
				paddingTop: 8,
				paddingBottom: 8,
				flexDirection: "row",
				alignItems: "center",
				gap: 12,
				borderTop: "1px solid black",
				borderTopWidth: 1,
				...{ marginTop: a.border_t.borderTopWidth * -1 },
				borderBottom: "1px solid black",
				...t.atoms.border_contrast_low,
				...{ minHeight: 44 },
				borderRadius: 0,
			}}
			to="/messages/inbox"
			color="secondary"
			variant="solid"
		>
			<div style={{ ...a.relative }}>
				<ButtonIcon icon={EnvelopeIcon} size="lg" />
				{profiles.length > 0 && (
					<div
						style={{
							position: "absolute",
							borderRadius: 999,
							zIndex: 20,

							...{
								top: -4,
								right: -5,
								width: 10,
								height: 10,
								backgroundColor: t.palette.primary_500,
							},
						}}
					/>
				)}
			</div>
			<ButtonText
				style={{
					flex: 1,
					fontWeight: "600",
					textAlign: "left",
				}}
				// TODO
				// numberOfLines={1}
			>
				Chat requests
			</ButtonText>
			<AvatarStack profiles={profiles} backgroundColor={t.atoms.bg_contrast_25.backgroundColor} />
			<ButtonIcon icon={ArrowRightIcon} size="lg" />
		</Link>
	);
}
