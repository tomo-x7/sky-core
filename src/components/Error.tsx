import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { useGoBack } from "#/lib/hooks/useGoBack";
import { CenteredView } from "#/view/com/util/Views";

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export function Error({
	title,
	message,
	onRetry,
	onGoBack,
	hideBackButton,
	sideBorders = true,
}: {
	title?: string;
	message?: string;
	onRetry?: () => unknown;
	onGoBack?: () => unknown;
	hideBackButton?: boolean;
	sideBorders?: boolean;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const goBack = useGoBack(onGoBack);

	return (
		<CenteredView
			style={{
				height: "100dvh",

				alignItems: "center",
				gap: 40,
				justifyContent: gtMobile ? undefined : "space-between",
				...t.atoms.border_contrast_low,
				paddingTop: 175,
				paddingBottom: 110,
			}}
			sideBorders={sideBorders}
		>
			<div style={{ width: "100%", alignItems: "center", gap: 16 }}>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 26,
						letterSpacing: 0,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						textAlign: "center",
						...t.atoms.text_contrast_high,
						lineHeight: 1.4,
						...(gtMobile ? { width: 450 } : { width: "100%", paddingLeft: 16, paddingRight: 16 }),
					}}
				>
					{message}
				</Text>
			</div>
			<div
				style={{
					gap: 12,
					...(gtMobile ? { width: 350 } : { width: "100%", paddingLeft: 16, paddingRight: 16 }),
				}}
			>
				{onRetry && (
					<Button
						variant="solid"
						color="primary"
						label={"Press to retry"}
						onPress={onRetry}
						size="large"
						style={{
							borderRadius: 8,
							overflow: "hidden",
							paddingTop: 10,
							paddingBottom: 10,
						}}
					>
						<ButtonText>Retry</ButtonText>
					</Button>
				)}
				{!hideBackButton && (
					<Button
						variant="solid"
						color={onRetry ? "secondary" : "primary"}
						label={"Return to previous page"}
						onPress={goBack}
						size="large"
						style={{
							borderRadius: 8,
							overflow: "hidden",
							paddingTop: 10,
							paddingBottom: 10,
						}}
					>
						<ButtonText>Go Back</ButtonText>
					</Button>
				)}
			</div>
		</CenteredView>
	);
}
