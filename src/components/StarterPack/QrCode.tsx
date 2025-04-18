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
					...a.align_center,
					...a.px_sm,
					...a.py_xl,
					...a.rounded_sm,
					...a.justify_between,
					...a.gap_md,
				}}
			>
				<div style={a.gap_sm}>
					<Text
						style={{
							...a.font_bold,
							...a.text_3xl,
							...a.text_center,
							...{ color: "white" },
						}}
					>
						{record.name}
					</Text>
				</div>
				<div
					style={{
						...a.gap_xl,
						...a.align_center,
					}}
				>
					<Text
						style={{
							...a.font_bold,
							...a.text_center,
							...{ color: "white", fontSize: 18 },
						}}
					>
						Join the conversation
					</Text>
					<div
						style={{
							...a.rounded_sm,
							...a.overflow_hidden,
						}}
					>
						<QrCodeInner link={link} />
					</div>

					<Text
						style={{
							...a.flex,
							...a.flex_row,
							...a.align_center,
							...a.font_bold,
							...{ color: "white", fontSize: 18, gap: 6 },
						}}
					>
						<>
							on
							<div
								style={{
									...a.flex_row,
									...a.align_center,
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
				...a.rounded_sm,
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
// 				...a.rounded_sm,
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
