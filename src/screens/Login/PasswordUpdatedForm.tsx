import { useBreakpoints } from "#/alf";
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
				gap: 24,
				...(!gtMobile && { marginTop: 40 }),
			}}
		>
			<Text
				style={{
					fontSize: 26,
					letterSpacing: 0,
					fontWeight: "600",
					textAlign: "center",
				}}
			>
				Password updated!
			</Text>
			<Text
				style={{
					textAlign: "center",
					marginLeft: "auto",
					marginRight: "auto",
					...{ maxWidth: "80%" },
				}}
			>
				You can now sign in with your new password.
			</Text>
			<div
				style={{
					flexDirection: "row",
					justifyContent: "center",
				}}
			>
				<Button onPress={onPressNext} label={"Close alert"} variant="solid" color="primary" size="large">
					<ButtonText>Okay</ButtonText>
				</Button>
			</div>
		</FormContainer>
	);
};
