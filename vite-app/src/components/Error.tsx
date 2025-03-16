import { atoms as a, useBreakpoints, useTheme } from "#/alf";
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
				...//@ts-ignore
				a.h_full_vh,

				...a.align_center,
				...a.gap_5xl,
				...(!gtMobile && a.justify_between),
				...t.atoms.border_contrast_low,
				...{ paddingTop: 175, paddingBottom: 110 },
			}}
			sideBorders={sideBorders}
		>
			<div style={{ ...a.w_full, ...a.align_center, ...a.gap_lg }}>
				<Text
					style={{
						...a.font_bold,
						...a.text_3xl,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						...a.text_md,
						...a.text_center,
						...t.atoms.text_contrast_high,
						...{ lineHeight: 1.4 },
						...(gtMobile ? { width: 450 } : [a.w_full, a.px_lg]),
					}}
				>
					{message}
				</Text>
			</div>
			<div style={{ ...a.gap_md, ...(gtMobile ? { width: 350 } : { ...a.w_full, ...a.px_lg }) }}>
				{onRetry && (
					<Button
						variant="solid"
						color="primary"
						label={"Press to retry"}
						onPress={onRetry}
						size="large"
						style={{
							...a.rounded_sm,
							...a.overflow_hidden,
							...{ paddingVertical: 10 },
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
							...a.rounded_sm,
							...a.overflow_hidden,
							...{ paddingVertical: 10 },
						}}
					>
						<ButtonText>Go Back</ButtonText>
					</Button>
				)}
			</div>
		</CenteredView>
	);
}
