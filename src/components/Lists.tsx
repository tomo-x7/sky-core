import type React from "react";
import { memo } from "react";

import { atoms as a, useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Error } from "#/components/Error";
import { Loader } from "#/components/Loader";
import { Text } from "#/components/Typography";
import { cleanError } from "#/lib/strings/errors";
import { CenteredView } from "#/view/com/util/Views";

export function ListFooter({
	isFetchingNextPage,
	hasNextPage,
	error,
	onRetry,
	height,
	style,
	showEndMessage = false,
	endMessageText,
	renderEndMessage,
}: {
	isFetchingNextPage?: boolean;
	hasNextPage?: boolean;
	error?: string;
	onRetry?: () => Promise<unknown>;
	height?: number;
	style?: React.CSSProperties;
	showEndMessage?: boolean;
	endMessageText?: string;
	renderEndMessage?: () => React.ReactNode;
}) {
	const t = useTheme();

	return (
		<div
			style={{
				width: "100%",
				alignItems: "center",
				borderTop: "1px solid black",
				borderTopWidth: 1,
				paddingBottom: 16,
				...t.atoms.border_contrast_low,
				...{ height: height ?? 180, paddingTop: 30 },
				...style,
			}}
		>
			{isFetchingNextPage ? (
				<Loader size="xl" />
			) : error ? (
				<ListFooterMaybeError error={error} onRetry={onRetry} />
			) : !hasNextPage && showEndMessage ? (
				renderEndMessage ? (
					renderEndMessage()
				) : (
					<Text
						style={{
							fontSize: 14,
							letterSpacing: 0,
							...t.atoms.text_contrast_low,
						}}
					>
						{endMessageText ?? "You have reached the end"}
					</Text>
				)
			) : null}
		</div>
	);
}

function ListFooterMaybeError({
	error,
	onRetry,
}: {
	error?: string;
	onRetry?: () => Promise<unknown>;
}) {
	const t = useTheme();

	if (!error) return null;

	return (
		<div
			style={{
				width: "100%",
				paddingLeft: 16,
				paddingRight: 16,
			}}
		>
			<div
				style={{
					flexDirection: "row",
					gap: 12,
					padding: 12,
					borderRadius: 8,
					alignItems: "center",
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						flex: 1,
						fontSize: 14,
						letterSpacing: 0,
						...t.atoms.text_contrast_medium,
					}}
					numberOfLines={2}
				>
					{error ? cleanError(error) : <>Oops, something went wrong!</>}
				</Text>
				<Button
					variant="gradient"
					label={"Press to retry"}
					style={{
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 8,
						overflow: "hidden",
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 8,
						paddingBottom: 8,
					}}
					onPress={onRetry}
				>
					<ButtonText>Retry</ButtonText>
				</Button>
			</div>
		</div>
	);
}

let ListMaybePlaceholder = ({
	isLoading,
	noEmpty,
	isError,
	emptyTitle,
	emptyMessage,
	errorTitle,
	errorMessage,
	emptyType = "page",
	onRetry,
	onGoBack,
	hideBackButton,
	sideBorders,
	topBorder = false,
}: {
	isLoading: boolean;
	noEmpty?: boolean;
	isError?: boolean;
	emptyTitle?: string;
	emptyMessage?: string;
	errorTitle?: string;
	errorMessage?: string;
	emptyType?: "page" | "results";
	onRetry?: () => Promise<unknown>;
	onGoBack?: () => void;
	hideBackButton?: boolean;
	sideBorders?: boolean;
	topBorder?: boolean;
}): React.ReactNode => {
	const t = useTheme();
	const { gtMobile, gtTablet } = useBreakpoints();

	if (isLoading) {
		return (
			<CenteredView
				style={{
					height: "100dvh",
					alignItems: "center",
					...(!gtMobile ? a.justify_between : a.gap_5xl),
					...t.atoms.border_contrast_low,
					paddingTop: 175,
					paddingBottom: 110,
				}}
				sideBorders={sideBorders ?? gtMobile}
				topBorder={topBorder && !gtTablet}
			>
				<div
					style={{
						width: "100%",
						alignItems: "center",
						...{ top: 100 },
					}}
				>
					<Loader size="xl" />
				</div>
			</CenteredView>
		);
	}

	if (isError) {
		return (
			<Error
				title={errorTitle ?? "Oops!"}
				message={errorMessage ?? "Something went wrong!"}
				onRetry={onRetry}
				onGoBack={onGoBack}
				sideBorders={sideBorders}
				hideBackButton={hideBackButton}
			/>
		);
	}

	if (!noEmpty) {
		return (
			<Error
				title={emptyTitle ?? (emptyType === "results" ? "No results found" : "Page not found")}
				message={emptyMessage ?? `We're sorry! We can't find the page you were looking for.`}
				onRetry={onRetry}
				onGoBack={onGoBack}
				hideBackButton={hideBackButton}
				sideBorders={sideBorders}
			/>
		);
	}

	return null;
};
ListMaybePlaceholder = memo(ListMaybePlaceholder);
export { ListMaybePlaceholder };
