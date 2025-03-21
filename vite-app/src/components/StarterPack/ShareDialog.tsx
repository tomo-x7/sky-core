import type { AppBskyGraphDefs } from "@atproto/api";
import { requestMediaLibraryPermissionsAsync } from "expo-image-picker";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import type { DialogControlProps } from "#/components/Dialog";
import * as Dialog from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { saveImageToMediaLibrary } from "#/lib/media/manip";
import { shareUrl } from "#/lib/sharing";
import { getStarterPackOgCard } from "#/lib/strings/starter-pack";
import * as Toast from "#/view/com/util/Toast";

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
							...a.p_xl,
							...a.align_center,
						}}
					>
						<Loader size="xl" />
					</div>
				) : (
					<div style={!isTabletOrDesktop ? a.gap_lg : undefined}>
						<div
							style={{
								...a.gap_sm,
								...(isTabletOrDesktop && a.pb_lg),
							}}
						>
							<Text
								style={{
									...a.font_bold,
									...a.text_2xl,
								}}
							>
								Invite people to this starter pack!
							</Text>
							<Text
								style={{
									...a.text_md,
									...t.atoms.text_contrast_medium,
								}}
							>
								Share this starter pack and help people join your community on Bluesky.
							</Text>
						</div>
						<img
							src={imageUrl}
							style={{
								...a.rounded_sm,
								aspectRatio: 1200 / 630,
								marginTop: isTabletOrDesktop ? -20 : 0,
								scale: isTabletOrDesktop ? 0.85 : 1,
							}}
						/>
						<div
							style={{
								...a.gap_md,
								...a.gap_sm,
								...a.flex_row_reverse,
								marginLeft: "auto",
							}}
						>
							<Button
								label={"Copy link"}
								variant="solid"
								color="secondary"
								size="small"
								style={a.self_center}
								onPress={onShareLink}
							>
								<ButtonText>Copy Link</ButtonText>
							</Button>
							<Button
								label={"Share QR code"}
								variant="solid"
								color="secondary"
								size="small"
								style={a.self_center}
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
