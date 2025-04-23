import React from "react";

import { tokens, useTheme } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { useDialogControl } from "#/components/Dialog";
import { Text } from "#/components/Typography";
import { Globe_Stroke2_Corner0_Rounded as GlobeIcon } from "#/components/icons/Globe";
import { PencilLine_Stroke2_Corner0_Rounded as PencilIcon } from "#/components/icons/Pencil";
import { Keyboard } from "#/lib/Keyboard";
import { toNiceDomain } from "#/lib/strings/url-helpers";
import { ServerInputDialog } from "#/view/com/auth/server-input";

export function HostingProvider({
	serviceUrl,
	onSelectServiceUrl,
	onOpenDialog,
	minimal,
}: {
	serviceUrl: string;
	onSelectServiceUrl: (provider: string) => void;
	onOpenDialog?: () => void;
	minimal?: boolean;
}) {
	const serverInputControl = useDialogControl();
	const t = useTheme();

	const onPressSelectService = React.useCallback(() => {
		Keyboard.dismiss();
		serverInputControl.open();
		onOpenDialog?.();
	}, [onOpenDialog, serverInputControl]);

	return (
		<>
			<ServerInputDialog control={serverInputControl} onSelect={onSelectServiceUrl} />
			{minimal ? (
				<div
					style={{
						flexDirection: "row",
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<Text
						style={{
							fontSize: 14,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
						}}
					>
						You are creating an account on{" "}
						<Button
							label={toNiceDomain(serviceUrl)}
							onPress={onPressSelectService}
							variant="ghost"
							color="secondary"
							size="tiny"
							style={{
								paddingLeft: 4,
								paddingRight: 4,
								...{ marginRight: tokens.space.xs * -1, marginLeft: tokens.space.xs * -1 },
							}}
						>
							<ButtonText style={{ fontSize: 8 }}>{toNiceDomain(serviceUrl)}</ButtonText>
							<ButtonIcon icon={PencilIcon} />
						</Button>
					</Text>
				</div>
			) : (
				<Button
					label={toNiceDomain(serviceUrl)}
					variant="solid"
					color="secondary"
					style={{
						width: "100%",
						flexDirection: "row",
						alignItems: "center",
						borderRadius: 8,
						paddingLeft: 12,
						paddingRight: 8,
						gap: 4,
						...{ paddingTop: 8, paddingBottom: 8 },
					}}
					onPress={onPressSelectService}
				>
					{({ hovered, pressed }) => {
						const interacted = hovered || pressed;
						return (
							<>
								<div style={{ paddingRight: 4 }}>
									<GlobeIcon
										size="md"
										fill={interacted ? t.palette.contrast_800 : t.palette.contrast_500}
									/>
								</div>
								<Text style={{ fontSize: 16 }}>{toNiceDomain(serviceUrl)}</Text>
								<div
									style={{
										borderRadius: 8,
										...(interacted ? t.atoms.bg_contrast_300 : t.atoms.bg_contrast_100),
										...{ marginLeft: "auto", padding: 6 },
									}}
								>
									<PencilIcon
										size="sm"
										style={{
											color: interacted ? t.palette.contrast_800 : t.palette.contrast_500,
										}}
									/>
								</div>
							</>
						);
					}}
				</Button>
			)}
		</>
	);
}
