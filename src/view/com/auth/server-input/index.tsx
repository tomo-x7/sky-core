import { useCallback, useImperativeHandle, useRef, useState } from "react";

import { atoms as a, flatten, useBreakpoints, useTheme } from "#/alf";
import { Admonition } from "#/components/Admonition";
import { Button, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { InlineLinkText } from "#/components/Link";
import { P, Text } from "#/components/Typography";
import * as TextField from "#/components/forms/TextField";
import * as ToggleButton from "#/components/forms/ToggleButton";
import { Globe_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";
import { BSKY_SERVICE } from "#/lib/constants";
import * as persisted from "#/state/persisted";
import { useSession } from "#/state/session";

export function ServerInputDialog({
	control,
	onSelect,
}: {
	control: Dialog.DialogOuterProps["control"];
	onSelect: (url: string) => void;
}) {
	const formRef = useRef<DialogInnerRef>(null);

	// persist these options between dialog open/close
	const [fixedOption, setFixedOption] = useState(BSKY_SERVICE);
	const [previousCustomAddress, setPreviousCustomAddress] = useState("");

	const onClose = useCallback(() => {
		const result = formRef.current?.getFormState();
		if (result) {
			onSelect(result);
			if (result !== BSKY_SERVICE) {
				setPreviousCustomAddress(result);
			}
		}
	}, [onSelect]);

	return (
		<Dialog.Outer control={control} onClose={onClose}>
			<Dialog.Handle />
			<DialogInner
				formRef={formRef}
				fixedOption={fixedOption}
				setFixedOption={setFixedOption}
				initialCustomAddress={previousCustomAddress}
			/>
		</Dialog.Outer>
	);
}

type DialogInnerRef = { getFormState: () => string | null };

function DialogInner({
	formRef,
	fixedOption,
	setFixedOption,
	initialCustomAddress,
}: {
	formRef: React.Ref<DialogInnerRef>;
	fixedOption: string;
	setFixedOption: (opt: string) => void;
	initialCustomAddress: string;
}) {
	const control = Dialog.useDialogContext();
	const t = useTheme();
	const { accounts } = useSession();
	const { gtMobile } = useBreakpoints();
	const [customAddress, setCustomAddress] = useState(initialCustomAddress);
	const [pdsAddressHistory, setPdsAddressHistory] = useState<string[]>(persisted.get("pdsAddressHistory") || []);

	useImperativeHandle(
		formRef,
		() => ({
			getFormState: () => {
				let url;
				if (fixedOption === "custom") {
					url = customAddress.trim().toLowerCase();
					if (!url) {
						return null;
					}
				} else {
					url = fixedOption;
				}
				if (!url.startsWith("http://") && !url.startsWith("https://")) {
					if (url === "localhost" || url.startsWith("localhost:")) {
						url = `http://${url}`;
					} else {
						url = `https://${url}`;
					}
				}

				if (fixedOption === "custom") {
					if (!pdsAddressHistory.includes(url)) {
						const newHistory = [url, ...pdsAddressHistory.slice(0, 4)];
						setPdsAddressHistory(newHistory);
						persisted.write("pdsAddressHistory", newHistory);
					}
				}

				return url;
			},
		}),
		[customAddress, fixedOption, pdsAddressHistory],
	);

	const isFirstTimeUser = accounts.length === 0;

	return (
		<Dialog.ScrollableInner accessibilityDescribedBy="dialog-description">
			<div
				style={{
					...a.relative,
					...a.gap_md,
					...a.w_full,
				}}
			>
				<Text
					style={{
						...a.text_2xl,
						...a.font_bold,
					}}
				>
					Choose your account provider
				</Text>
				<ToggleButton.Group
					label="Preferences"
					values={[fixedOption]}
					onChange={(values) => setFixedOption(values[0])}
				>
					<ToggleButton.Button name={BSKY_SERVICE} label={"Bluesky"}>
						<ToggleButton.ButtonText>{"Bluesky"}</ToggleButton.ButtonText>
					</ToggleButton.Button>
					<ToggleButton.Button name="custom" label={"Custom"}>
						<ToggleButton.ButtonText>{"Custom"}</ToggleButton.ButtonText>
					</ToggleButton.Button>
				</ToggleButton.Group>

				{fixedOption === BSKY_SERVICE && isFirstTimeUser && (
					<Admonition type="tip">
						Bluesky is an open network where you can choose your own provider. If you're new here, we
						recommend sticking with the default Bluesky Social option.
					</Admonition>
				)}

				{fixedOption === "custom" && (
					<div
						style={{
							...a.border,
							...t.atoms.border_contrast_low,
							...a.rounded_sm,
							...a.px_md,
							...a.py_md,
						}}
					>
						<TextField.LabelText>Server address</TextField.LabelText>
						<TextField.Root>
							<TextField.Icon icon={Globe} />
							<Dialog.Input
								value={customAddress}
								onChangeText={setCustomAddress}
								label="my-server.com"
								inputMode="url"
								autoCapitalize="none"
							/>
						</TextField.Root>
						{pdsAddressHistory.length > 0 && (
							<div
								style={{
									...a.flex_row,
									...a.flex_wrap,
									...a.mt_xs,
								}}
							>
								{pdsAddressHistory.map((uri) => (
									<Button
										key={uri}
										variant="ghost"
										color="primary"
										label={uri}
										style={{
											...a.px_sm,
											...a.py_xs,
											...a.rounded_sm,
											...a.gap_sm,
										}}
										onPress={() => setCustomAddress(uri)}
									>
										<ButtonText>{uri}</ButtonText>
									</Button>
								))}
							</div>
						)}
					</div>
				)}

				<div style={a.py_xs}>
					<P
						style={{
							...t.atoms.text_contrast_medium,
							...a.text_sm,
							...a.leading_snug,
							...a.flex_1,
						}}
					>
						{isFirstTimeUser ? (
							<>If you're a developer, you can host your own server.</>
						) : (
							<>
								Bluesky is an open network where you can choose your hosting provider. If you're a
								developer, you can host your own server.
							</>
						)}{" "}
						<InlineLinkText
							label={"Learn more about self hosting your PDS."}
							to="https://atproto.com/guides/self-hosting"
						>
							Learn more.
						</InlineLinkText>
					</P>
				</div>

				<div style={flatten(gtMobile && [a.flex_row, a.justify_end])}>
					<Button
						variant="outline"
						color="primary"
						size="small"
						onPress={() => control.close()}
						label={"Done"}
					>
						<ButtonText>{"Done"}</ButtonText>
					</Button>
				</div>
			</div>
		</Dialog.ScrollableInner>
	);
}
