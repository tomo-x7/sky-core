import type { AppBskyGraphDefs } from "@atproto/api";
import React from "react";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import type { DialogControlProps } from "#/components/Dialog";
import { Loader } from "#/components/Loader";
import { QrCode } from "#/components/StarterPack/QrCode";

export function QrCodeDialog({
	starterPack,
	link,
	control,
}: {
	starterPack: AppBskyGraphDefs.StarterPackView;
	link?: string;
	control: DialogControlProps;
}) {
	const [isProcessing, setIsProcessing] = React.useState(false);

	// const ref = React.useRef<ViewShot>(null);

	const getCanvas = (base64: string): Promise<HTMLCanvasElement> => {
		return new Promise((resolve) => {
			const image = new Image();
			image.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;

				const ctx = canvas.getContext("2d");
				ctx?.drawImage(image, 0, 0);
				resolve(canvas);
			};
			image.src = base64;
		});
	};

	const onSavePress = async () => {
		// ref.current?.capture?.().then(async (uri: string) => {
		// 	if (isNative) {
		// 		const res = await requestMediaLibraryPermissionsAsync();
		// 		if (!res) {
		// 			Toast.show("You must grant access to your photo library to save a QR code");
		// 			return;
		// 		}
		// 		// Incase of a FS failure, don't crash the app
		// 		try {
		// 			await createAssetAsync(`file://${uri}`);
		// 		} catch (e: unknown) {
		// 			Toast.show("An error occurred while saving the QR code!", "xmark");
		// 			console.error("Failed to save QR code", { error: e });
		// 			return;
		// 		}
		// 	} else {
		// 		setIsProcessing(true);
		// 		if (!bsky.validate(starterPack.record, AppBskyGraphStarterpack.validateRecord)) {
		// 			return;
		// 		}
		// 		const canvas = await getCanvas(uri);
		// 		const imgHref = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		// 		const link = document.createElement("a");
		// 		link.setAttribute("download", `${starterPack.record.name.replaceAll(" ", "_")}_Share_Card.png`);
		// 		link.setAttribute("href", imgHref);
		// 		link.click();
		// 	}
		// 	setIsProcessing(false);
		// 	Toast.show(isWeb ? "QR code has been downloaded!" : "QR code saved to your camera roll!");
		// 	control.close();
		// });
	};

	const onCopyPress = async () => {
		setIsProcessing(true);
		// ref.current?.capture?.().then(async (uri: string) => {
		// 	const canvas = await getCanvas(uri);
		// 	// @ ts-expect-error web only
		// 	canvas.toBlob((blob: Blob) => {
		// 		const item = new ClipboardItem({ "image/png": blob });
		// 		navigator.clipboard.write([item]);
		// 	});
		// 	Toast.show("QR code copied to your clipboard!");
		// 	setIsProcessing(false);
		// 	control.close();
		// });
	};

	const onSharePress = async () => {
		// ref.current?.capture?.().then(async (uri: string) => {
		// 	control.close(() => Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "image/png" }));
		// });
	};

	return (
		<Dialog.Outer control={control}>
			<Dialog.ScrollableInner label={"Create a QR code for a starter pack"}>
				<div
					style={{
						flex: 1,
						alignItems: "center",
						gap: 40,
					}}
				>
					<React.Suspense fallback={<Loading />}>
						{!link ? (
							<Loading />
						) : (
							<>
								<QrCode starterPack={starterPack} link={link} /*ref={ref}*/ />
								{isProcessing ? (
									<div>
										<Loader size="xl" />
									</div>
								) : (
									<div
										style={{
											width: "100%",
											gap: 12,
											flexDirection: "row-reverse",
										}}
									>
										<Button
											label={"Copy QR code"}
											variant="solid"
											color="secondary"
											size="small"
											onPress={onCopyPress}
										>
											<ButtonText>Copy</ButtonText>
										</Button>
										<Button
											label={"Save QR code"}
											variant="solid"
											color="secondary"
											size="small"
											onPress={onSavePress}
										>
											<ButtonText>Save</ButtonText>
										</Button>
									</div>
								)}
							</>
						)}
					</React.Suspense>
				</div>
			</Dialog.ScrollableInner>
		</Dialog.Outer>
	);
}

function Loading() {
	return (
		<div
			style={{
				alignItems: "center",
				padding: 20,
			}}
		>
			<Loader size="xl" />
		</div>
	);
}
