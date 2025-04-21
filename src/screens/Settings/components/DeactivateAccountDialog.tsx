import React from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import type { DialogOuterProps } from "#/components/Dialog";
import { Divider } from "#/components/Divider";
import { Loader } from "#/components/Loader";
import * as Prompt from "#/components/Prompt";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";
import { useAgent, useSessionApi } from "#/state/session";

export function DeactivateAccountDialog({
	control,
}: {
	control: DialogOuterProps["control"];
}) {
	return (
		<Prompt.Outer control={control}>
			<DeactivateAccountDialogInner control={control} />
		</Prompt.Outer>
	);
}

function DeactivateAccountDialogInner({
	control,
}: {
	control: DialogOuterProps["control"];
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const agent = useAgent();
	const { logoutCurrentAccount } = useSessionApi();
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState<string | undefined>();

	const handleDeactivate = React.useCallback(async () => {
		try {
			setPending(true);
			await agent.com.atproto.server.deactivateAccount({});
			control.close(() => {
				logoutCurrentAccount();
			});
		} catch (e: any) {
			switch (e.message) {
				case "Bad token scope":
					setError(
						`You're signed in with an App Password. Please sign in with your main password to continue deactivating your account.`,
					);
					break;
				default:
					setError("Something went wrong, please try again");
					break;
			}

			console.error(e, {
				message: "Failed to deactivate account",
			});
		} finally {
			setPending(false);
		}
	}, [agent, control, logoutCurrentAccount]);

	return (
		<>
			<Prompt.TitleText>{"Deactivate account"}</Prompt.TitleText>
			<Prompt.DescriptionText>
				Your profile, posts, feeds, and lists will no longer be visible to other Bluesky users. You can
				reactivate your account at any time by logging in.
			</Prompt.DescriptionText>
			<div style={{ paddingBottom: 20 }}>
				<Divider />
				<div
					style={{
						gap: 8,
						paddingTop: 16,
						paddingBottom: 20,
					}}
				>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							lineHeight: 1.3,
						}}
					>
						There is no time limit for account deactivation, come back any time.
					</Text>
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							lineHeight: 1.3,
						}}
					>
						If you're trying to change your handle or email, do so before you deactivate.
					</Text>
				</div>

				<Divider />
			</div>
			<Prompt.Actions>
				<Button
					variant="solid"
					color="negative"
					size={gtMobile ? "small" : "large"}
					label={"Yes, deactivate"}
					onPress={handleDeactivate}
				>
					<ButtonText>{"Yes, deactivate"}</ButtonText>
					{pending && <ButtonIcon icon={Loader} position="right" />}
				</Button>
				<Prompt.Cancel />
			</Prompt.Actions>
			{error && (
				<div
					style={{
						flexDirection: "row",
						gap: 8,
						marginTop: 12,
						padding: 12,
						borderRadius: 8,
						...t.atoms.bg_contrast_25,
					}}
				>
					<CircleInfo size="md" fill={t.palette.negative_400} />
					<Text
						style={{
							flex: 1,
							lineHeight: 1.3,
						}}
					>
						{error}
					</Text>
				</div>
			)}
		</>
	);
}
