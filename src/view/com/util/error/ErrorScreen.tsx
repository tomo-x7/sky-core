import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { atoms as a, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { ArrowRotateCounterClockwise_Stroke2_Corner0_Rounded as ArrowRotateCounterClockwiseIcon } from "#/components/icons/ArrowRotateCounterClockwise";
import { usePalette } from "#/lib/hooks/usePalette";

export function ErrorScreen({
	title,
	message,
	details,
	onPressTryAgain,
	showHeader,
}: {
	title: string;
	message: string;
	details?: string;
	onPressTryAgain?: () => void;
	showHeader?: boolean;
}) {
	const t = useTheme();
	const pal = usePalette("default");

	return (
		<Layout.Center>
			{showHeader && (
				<Layout.Header.Outer>
					<Layout.Header.BackButton />
					<Layout.Header.Content>
						<Layout.Header.TitleText>Error</Layout.Header.TitleText>
					</Layout.Header.Content>
					<Layout.Header.Slot />
				</Layout.Header.Outer>
			)}
			<div
				style={{
					paddingLeft: 20,
					paddingRight: 20,
					paddingTop: 24,
					paddingBottom: 24,
				}}
			>
				<div
					style={{
						marginBottom: 12,
						alignItems: "center",
					}}
				>
					<div
						style={{
							borderRadius: 999,
							...{ width: 50, height: 50 },
							alignItems: "center",
							justifyContent: "center",
							...{ backgroundColor: t.palette.contrast_950 },
						}}
					>
						<FontAwesomeIcon icon="exclamation" style={pal.textInverted} /*size={24}*/ size={"2xl"} />
					</div>
				</div>
				<Text
					style={{
						textAlign: "center",
						fontWeight: "800",
						fontSize: 22,
						letterSpacing: 0,
						marginBottom: 12,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						textAlign: "center",
						fontSize: 16,
						letterSpacing: 0,
						marginBottom: 20,
					}}
				>
					{message}
				</Text>
				{details && (
					<div
						style={{
							width: "100%",
							border: "1px solid black",
							borderWidth: 1,
							...t.atoms.border_contrast_medium,
							...t.atoms.bg_contrast_25,
							marginBottom: 20,
							paddingTop: 8,
							paddingBottom: 8,
							paddingLeft: 16,
							paddingRight: 16,
							borderRadius: 4,
							overflow: "hidden",
						}}
					>
						<Text
							style={{
								textAlign: "center",
								fontSize: 16,
								letterSpacing: 0,
								...t.atoms.text_contrast_high,
							}}
						>
							{details}
						</Text>
					</div>
				)}
				{onPressTryAgain && (
					<div style={{ alignItems:"center" }}>
						<Button
							onPress={onPressTryAgain}
							variant="solid"
							color="secondary_inverted"
							size="small"
							label={"Retry"}
						>
							<ButtonIcon icon={ArrowRotateCounterClockwiseIcon} />
							<ButtonText>Try again</ButtonText>
						</Button>
					</div>
				)}
			</div>
		</Layout.Center>
	);
}
