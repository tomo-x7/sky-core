import type { AppBskyGraphDefs } from "@atproto/api";

import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import type { DialogControlProps } from "#/components/Dialog";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { shareUrl } from "#/lib/sharing";
import { getStarterPackOgCard } from "#/lib/strings/starter-pack";

interface Props {
	starterPack: AppBskyGraphDefs.StarterPackView;
	link?: string;
	imageLoaded?: boolean;
	qrDialogControl: DialogControlProps;
	control: DialogControlProps;
}

export function ShareDialog(props: Props) {
	return (
		<Dialog.Outer control={props.control}>
			<Dialog.Handle />
			<ShareDialogInner {...props} />
		</Dialog.Outer>
	);
}

function ShareDialogInner({ starterPack, link, imageLoaded, qrDialogControl, control }: Props) {
	const t = useTheme();
	const { isTabletOrDesktop } = useWebMediaQueries();

	const imageUrl = getStarterPackOgCard(starterPack);

	const onShareLink = async () => {
		if (!link) return;
		shareUrl(link);
		control.close();
	};

	return (
		<>
			<Dialog.ScrollableInner label={"Share link dialog"}>
				{!imageLoaded || !link ? (
					<div
						style={{
							padding: 20,
							alignItems: "center",
						}}
					>
						<Loader size="xl" />
					</div>
				) : (
					<div style={{ gap: !isTabletOrDesktop ? 16 : undefined }}>
						<div
							style={{
								gap: 8,
								...(isTabletOrDesktop && { paddingBottom: 16 }),
							}}
						>
							<Text
								style={{
									fontWeight: "600",
									fontSize: 22,
									letterSpacing: 0,
								}}
							>
								Invite people to this starter pack!
							</Text>
							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									...t.atoms.text_contrast_medium,
								}}
							>
								Share this starter pack and help people join your community on Bluesky.
							</Text>
						</div>
						<img
							src={imageUrl}
							style={{
								borderRadius: 8,
								aspectRatio: 1200 / 630,
								marginTop: isTabletOrDesktop ? -20 : 0,
								scale: isTabletOrDesktop ? 0.85 : 1,
							}}
						/>
						<div
							style={{
								gap: 8,
								flexDirection: "row-reverse",
								marginLeft: "auto",
							}}
						>
							<Button
								label={"Copy link"}
								variant="solid"
								color="secondary"
								size="small"
								style={{ alignSelf: "center" }}
								onPress={onShareLink}
							>
								<ButtonText>Copy Link</ButtonText>
							</Button>
							<Button
								label={"Share QR code"}
								variant="solid"
								color="secondary"
								size="small"
								style={{ alignSelf: "center" }}
								onPress={() => {
									control.close(() => {
										qrDialogControl.open();
									});
								}}
							>
								<ButtonText>Share QR code</ButtonText>
							</Button>
						</div>
					</div>
				)}
			</Dialog.ScrollableInner>
		</>
	);
}
