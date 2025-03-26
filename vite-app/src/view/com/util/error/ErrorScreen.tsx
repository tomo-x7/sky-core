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
					...a.px_xl,
					...a.py_2xl,
				}}
			>
				<div
					style={{
						...a.mb_md,
						...a.align_center,
					}}
				>
					<div
						style={{
							...a.rounded_full,
							...{ width: 50, height: 50 },
							...a.align_center,
							...a.justify_center,
							...{ backgroundColor: t.palette.contrast_950 },
						}}
					>
						<FontAwesomeIcon icon="exclamation" style={pal.textInverted} /*size={24}*/ size={"2xl"} />
					</div>
				</div>
				<Text
					style={{
						...a.text_center,
						...a.font_heavy,
						...a.text_2xl,
						...a.mb_md,
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						...a.text_center,
						...a.text_md,
						...a.mb_xl,
					}}
				>
					{message}
				</Text>
				{details && (
					<div
						style={{
							...a.w_full,
							...a.border,
							...t.atoms.border_contrast_medium,
							...t.atoms.bg_contrast_25,
							...a.mb_xl,
							...a.py_sm,
							...a.px_lg,
							...a.rounded_xs,
							...a.overflow_hidden,
						}}
					>
						<Text
							style={{
								...a.text_center,
								...a.text_md,
								...t.atoms.text_contrast_high,
							}}
						>
							{details}
						</Text>
					</div>
				)}
				{onPressTryAgain && (
					<div style={a.align_center}>
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
