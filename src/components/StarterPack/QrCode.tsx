import { type AppBskyGraphDefs, AppBskyGraphStarterpack } from "@atproto/api";
import { QRCodeSVG } from "qrcode.react";
// import ViewShot from "react-native-view-shot";
import QRCodeLogo from "../../assets/logo.png";

import { useTheme } from "#/alf";
import { atoms as a } from "#/alf";
import { LinearGradientBackground } from "#/components/LinearGradientBackground";
import { Text } from "#/components/Typography";
import * as bsky from "#/types/bsky";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";

interface Props {
	starterPack: AppBskyGraphDefs.StarterPackView;
	link: string;
}

export const QrCode = //React.forwardRef<ViewShot, Props>
	function QrCode({ starterPack, link }: Props) {
		const { record } = starterPack;

		if (!bsky.dangerousIsType<AppBskyGraphStarterpack.Record>(record, AppBskyGraphStarterpack.isRecord)) {
			return null;
		}

		return (
			// <ViewShot ref={ref}>
			//  </ViewShot>
			<LinearGradientBackground
				style={{
					...{ width: 300, minHeight: 390 },
					alignItems: "center",
					paddingLeft: 8,
					paddingRight: 8,
					paddingTop: 20,
					paddingBottom: 20,
					borderRadius: 8,
					justifyContent: "space-between",
					gap: 12,
				}}
			>
				<div style={{ gap: 8 }}>
					<Text
						style={{
							fontWeight: "600",
							fontSize: 26,
							letterSpacing: 0,
							textAlign: "center",
							...{ color: "white" },
						}}
					>
						{record.name}
					</Text>
				</div>
				<div
					style={{
						gap: 20,
						alignItems: "center",
					}}
				>
					<Text
						style={{
							fontWeight: "600",
							textAlign: "center",
							...{ color: "white", fontSize: 18 },
						}}
					>
						Join the conversation
					</Text>
					<div
						style={{
							borderRadius: 8,
							overflow: "hidden",
						}}
					>
						<QrCodeInner link={link} />
					</div>

					<Text
						style={{
							display:"flex",
							flexDirection: "row",
							alignItems: "center",
							fontWeight: "600",
							...{ color: "white", fontSize: 18, gap: 6 },
						}}
					>
						<>
							on
							<div
								style={{
									flexDirection: "row",
									alignItems: "center",
									...{ gap: 6 },
								}}
							>
								<Logo width={25} fill="white" />
								<div style={{ marginTop: 3.5 }}>
									<Logotype width={72} fill="white" />
								</div>
							</div>
						</>
					</Text>
				</div>
			</LinearGradientBackground>
		);
	};

function QrCodeInner({ link }: { link: string }) {
	const t = useTheme();

	return (
		<div
			style={{
				borderRadius: 8,
				height: 225,
				width: 225,
				backgroundColor: "#f3f3f3",
				padding: "20px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<QRCodeSVG
				value={link}
				size={185} // paddingを引いたサイズ
				bgColor="#f3f3f3"
				fgColor="#000000"
				level="Q"
				imageSettings={{
					src: QRCodeLogo, // 画像のパス
					x: undefined,
					y: undefined,
					height: 40,
					width: 40,
					excavate: true, // ロゴ部分のQRコードを削除
				}}
			/>
		</div>
	);
}

// function QrCodeInner({ link }: { link: string }) {
// 	const t = useTheme();

// 	return (
// 		<QRCode
// 			data={link}
// 			style={{
// 				borderRadius: 8,
// 				...{ height: 225, width: 225, backgroundColor: "#f3f3f3" },
// 			}}
// 			pieceSize={8}
// 			padding={20}
// 			// pieceLiquidRadius={2}
// 			pieceBorderRadius={4.5}
// 			outerEyesOptions={{
// 				topLeft: {
// 					borderRadius: [12, 12, 0, 12],
// 					color: t.palette.primary_500,
// 				},
// 				topRight: {
// 					borderRadius: [12, 12, 12, 0],
// 					color: t.palette.primary_500,
// 				},
// 				bottomLeft: {
// 					borderRadius: [12, 0, 12, 12],
// 					color: t.palette.primary_500,
// 				},
// 			}}
// 			innerEyesOptions={{ borderRadius: 3 }}
// 			logo={{
// 				href: require("../../../assets/logo.png"),
// 				scale: 0.95,
// 				padding: 2,
// 				hidePieces: true,
// 			}}
// 		/>
// 	);
// }
