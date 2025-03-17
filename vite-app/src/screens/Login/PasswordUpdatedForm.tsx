import { atoms as a, useBreakpoints } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { FormContainer } from "./FormContainer";

export const PasswordUpdatedForm = ({
	onPressNext,
}: {
	onPressNext: () => void;
}) => {
	const { gtMobile } = useBreakpoints();

	return (
		<FormContainer
			style={{
				...a.gap_2xl,
				...(!gtMobile && a.mt_5xl),
			}}
		>
			<Text
				style={{
					...a.text_3xl,
					...a.font_bold,
					...a.text_center,
				}}
			>
				Password updated!
			</Text>
			<Text
				style={{
					...a.text_center,
					...a.mx_auto,
					...{ maxWidth: "80%" },
				}}
			>
				You can now sign in with your new password.
			</Text>
			<div
				style={{
					...a.flex_row,
					...a.justify_center,
				}}
			>
				<Button
					onPress={onPressNext}
					label={"Close alert"}
					accessibilityHint={"Closes password update alert"}
					variant="solid"
					color="primary"
					size="large"
				>
					<ButtonText>Okay</ButtonText>
				</Button>
			</div>
		</FormContainer>
	);
};
