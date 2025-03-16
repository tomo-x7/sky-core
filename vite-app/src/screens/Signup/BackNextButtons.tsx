import { View } from "react-native";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { Loader } from "#/components/Loader";

export interface BackNextButtonsProps {
	hideNext?: boolean;
	showRetry?: boolean;
	isLoading: boolean;
	isNextDisabled?: boolean;
	onBackPress: () => void;
	onNextPress?: () => void;
	onRetryPress?: () => void;
	overrideNextText?: string;
}

export function BackNextButtons({
	hideNext,
	showRetry,
	isLoading,
	isNextDisabled,
	onBackPress,
	onNextPress,
	onRetryPress,
	overrideNextText,
}: BackNextButtonsProps) {
	return (
		<View
			style={{
				...a.flex_row,
				...a.justify_between,
				...a.pb_lg,
				...a.pt_3xl,
			}}
		>
			<Button
				label={"Go back to previous step"}
				variant="solid"
				color="secondary"
				size="large"
				onPress={onBackPress}
			>
				<ButtonText>Back</ButtonText>
			</Button>
			{!hideNext &&
				(showRetry ? (
					<Button
						label={"Press to retry"}
						variant="solid"
						color="primary"
						size="large"
						onPress={onRetryPress}
					>
						<ButtonText>Retry</ButtonText>
						{isLoading && <ButtonIcon icon={Loader} />}
					</Button>
				) : (
					<Button
						testID="nextBtn"
						label={"Continue to next step"}
						variant="solid"
						color="primary"
						size="large"
						disabled={isLoading || isNextDisabled}
						onPress={onNextPress}
					>
						<ButtonText>{overrideNextText ? overrideNextText : <>Next</>}</ButtonText>
						{isLoading && <ButtonIcon icon={Loader} />}
					</Button>
				))}
		</View>
	);
}
