import React, { useState } from "react";

import { useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import { Pencil_Stroke2_Corner0_Rounded as Pencil } from "#/components/icons/Pencil";
import { StreamingLive_Stroke2_Corner0_Rounded as StreamingLive } from "#/components/icons/StreamingLive";
import { AvatarCreatorCircle } from "#/screens/Onboarding/StepProfile/AvatarCreatorCircle";
import { useAvatar } from "#/screens/Onboarding/StepProfile/index";

export function AvatarCircle({
	openLibrary,
	openCreator,
}: {
	openLibrary: () => unknown;
	openCreator: () => unknown;
}) {
	const t = useTheme();
	const { avatar } = useAvatar();

	const styles = React.useMemo<{
		imageContainer: React.CSSProperties;
	}>(
		() => ({
			imageContainer: {
				borderRadius: 999,
				overflow: "hidden",
				alignItems: "center",
				justifyContent: "center",
				border: "1px solid black",
				...t.atoms.border_contrast_low,
				...t.atoms.bg_contrast_25,
				height: 200,
				width: 200,
			},
		}),
		[t.atoms.bg_contrast_25, t.atoms.border_contrast_low],
	);

	return (
		<div>
			{avatar.useCreatedAvatar ? (
				<AvatarCreatorCircle avatar={avatar} size={200} />
			) : avatar.image ? (
				<ImageWithTransition src={avatar.image.path} style={styles.imageContainer} />
			) : (
				<div style={styles.imageContainer}>
					<StreamingLive height={100} width={100} style={{ color: t.palette.contrast_200 }} />
				</div>
			)}
			<div
				style={{
					position: "absolute",
					...{ bottom: 2, right: 2 },
				}}
			>
				<Button
					label={"Select an avatar"}
					size="large"
					shape="round"
					variant="solid"
					color="primary"
					onPress={avatar.useCreatedAvatar ? openCreator : openLibrary}
				>
					<ButtonIcon icon={Pencil} />
				</Button>
			</div>
		</div>
	);
}

function ImageWithTransition({ src, style }: { src?: string; style?: React.CSSProperties }) {
	const [loaded, setLoaded] = useState(false);
	return (
		<img
			src={src}
			onLoad={() => setLoaded(true)}
			style={{
				opacity: loaded ? 1 : 0,
				transition: "opacity 300ms ease-in-out",
			}}
		/>
	);
}
