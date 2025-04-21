import React from "react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "#/alf";
import { Button, ButtonText } from "#/components/Button";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";

export function ErrorState({ error }: { error: string }) {
	const t = useTheme();
	const navigate = useNavigate();

	const onPressBack = React.useCallback(() => {
		if (history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	}, [navigate]);

	return (
		<div style={{ paddingLeft: 20, paddingRight: 20 }}>
			<CircleInfo width={48} style={t.atoms.text_contrast_low} />
			<Text
				style={{
					fontSize: 20,
					letterSpacing: 0,
					fontWeight: "600",
					paddingBottom: 12,
					paddingTop: 20,
				}}
			>
				Hmmmm, we couldn't load that moderation service.
			</Text>
			<Text
				style={{
					fontSize: 16,
					letterSpacing: 0,
					lineHeight: 1.5,
					paddingBottom: 12,
					...t.atoms.text_contrast_medium,
				}}
			>
				This moderation service is unavailable. See below for more details. If this issue persists, contact us.
			</Text>
			<div
				style={{
					position: "relative",
					paddingTop: 12,
					paddingBottom: 12,
					paddingLeft: 16,
					paddingRight: 16,
					borderRadius: 12,
					marginBottom: 24,
					...t.atoms.bg_contrast_25,
				}}
			>
				<Text
					style={{
						fontSize: 16,
						letterSpacing: 0,
						lineHeight: 1.5,
					}}
				>
					{error}
				</Text>
			</div>
			<div style={{ flexDirection: "row" }}>
				<Button size="small" color="secondary" variant="solid" label={"Go Back"} onPress={onPressBack}>
					<ButtonText>Go Back</ButtonText>
				</Button>
			</div>
		</div>
	);
}
